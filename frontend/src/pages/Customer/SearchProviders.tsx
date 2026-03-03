import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../providers/ThemeProvider';
import { MapPin, Filter, ArrowLeft, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useProviderStore } from '../../store/providerStore';
import ProviderList from '../../components/Provider/ProviderList';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

export default function SearchProviders() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const { providers, categories, isLoading, error, fetchProviders, fetchCategories } = useProviderStore();
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        () => {
          // Silent fail - location not required
        }
      );
    }
  }, []);

  // Fetch providers when category changes or location updates
  useEffect(() => {
    if (selectedCategory) {
      fetchProviders(selectedCategory, latitude, longitude);
    }
  }, [selectedCategory, latitude, longitude]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-background' : 'bg-background'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-foreground mb-8">Search Providers</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters sidebar */}
          <div className={`rounded-xl p-6 h-fit ${
            theme === 'dark' ? 'bg-card border border-border/30' : 'bg-card shadow-md'
          }`}>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  Category
                </label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-background/50 border-border/50' : 'bg-background border-border'
                  } text-foreground text-sm`}>
                  <option value="">Select a category...</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              {latitude && longitude && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                  📍 Location detected: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </div>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}
            {isLoading && !selectedCategory && (
              <div className={`rounded-xl p-8 border-2 border-dashed border-border/30 text-center ${
                theme === 'dark' ? 'bg-background/30' : 'bg-background/50'
              }`}>
                <MapPin className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Select a category</h3>
                <p className="text-foreground/60">
                  Choose a service category from filters to see available providers
                </p>
              </div>
            )}
            {isLoading && selectedCategory && <LoadingSpinner />}
            {!isLoading && selectedCategory && (
              <ProviderList 
                providers={providers}
                isEmpty={providers.length === 0}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
