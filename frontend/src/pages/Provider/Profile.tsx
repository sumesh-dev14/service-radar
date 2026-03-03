import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../providers/ThemeProvider';
import { ArrowLeft, AlertCircle, CheckCircle, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../services/api';

interface FormData {
  bio: string;
  category: string;
  price: string;
  latitude: string;
  longitude: string;
  isAvailable: boolean;
}

export default function ProviderProfile() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  const [formData, setFormData] = useState<FormData>({
    bio: '',
    category: '',
    price: '',
    latitude: '',
    longitude: '',
    isAvailable: true,
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    const fetchCategoriesAndProfile = async () => {
      try {
        const catRes = await api.get('/categories');
        setCategories(catRes.data.data || []);
        setProfileLoaded(true);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load categories');
        setProfileLoaded(true);
      }
    };

    fetchCategoriesAndProfile();
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setError('Please enter valid latitude and longitude');
      return;
    }

    if (lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90');
      return;
    }

    if (lng < -180 || lng > 180) {
      setError('Longitude must be between -180 and 180');
      return;
    }

    try {
      setIsLoading(true);

      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        setError('Please enter a valid price');
        return;
      }

      const payload = {
        categoryId: formData.category,
        bio: formData.bio,
        price: price,
        location: { lat, lng },
      };

      await api.post('/providers/profile', payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!profileLoaded) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-background' : 'bg-background'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/provider/dashboard')}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Profile</h1>
          <p className="text-foreground/60">Update your service provider information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-1 rounded-xl p-6 h-fit ${
            theme === 'dark' ? 'bg-card border border-border/30' : 'bg-card shadow-md'
          }`}>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-linear-to-br from-primary to-accent rounded-full mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-1">{user?.name}</h2>
              <span className="text-foreground/60 text-sm">(24 reviews)</span>
            </div>

            <div className="space-y-3 pt-6 border-t border-border/30">
              <div>
                <p className="text-foreground/60 text-xs uppercase tracking-wide mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-foreground">24</p>
              </div>
              <div>
                <p className="text-foreground/60 text-xs uppercase tracking-wide mb-1">Completion Rate</p>
                <p className="text-2xl font-bold text-foreground">95%</p>
              </div>
              <div>
                <p className="text-foreground/60 text-xs uppercase tracking-wide mb-1">Member Since</p>
                <p className="text-foreground font-medium">Jan 2026</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className={`rounded-xl p-6 ${
              theme === 'dark' ? 'bg-card border border-border/30' : 'bg-card shadow-md'
            }`}>
              {error && (
                <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <p className="text-green-700 dark:text-green-300 text-sm">Profile updated successfully!</p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Bio *</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Describe your services and experience"
                    rows={4}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-background/50 border-border/50' : 'bg-background border-border'
                    } text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Service Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      theme === 'dark' ? 'bg-background/50 border-border/50' : 'bg-background border-border'
                    } text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition`}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat: any) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Price per Hour ($) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Enter hourly rate"
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-background/50 border-border/50' : 'bg-background border-border'
                    } text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition`}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Latitude *</label>
                    <input
                      type="number"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="-90 to 90"
                      step="0.0001"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-background/50 border-border/50' : 'bg-background border-border'
                      } text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Longitude *</label>
                    <input
                      type="number"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="-180 to 180"
                      step="0.0001"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-background/50 border-border/50' : 'bg-background border-border'
                      } text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition`}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg border border-border/30">
                  <input
                    type="checkbox"
                    id="availability"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleChange}
                    className="w-5 h-5 rounded text-primary focus:ring-2 focus:ring-primary/30 cursor-pointer"
                  />
                  <label htmlFor="availability" className="flex-1 cursor-pointer">
                    <p className="font-medium text-foreground">Available for Bookings</p>
                    <p className="text-sm text-foreground/60">Toggle to show/hide your profile from customers</p>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-linear-to-r from-primary to-accent text-white font-medium rounded-lg hover:shadow-lg hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
