import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../providers/ThemeProvider';
import { ArrowLeft, Star, MapPin, DollarSign, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useProviderStore } from '../../store/providerStore';
import { useBookingStore } from '../../store/bookingStore';
import BookingForm from '../../components/Booking/BookingForm';
import ReviewList from '../../components/Review/ReviewList';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import api from '../../services/api';

export default function ProviderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const { createBooking, isLoading: bookingLoading } = useBookingStore();
  
  const [provider, setProvider] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Fetch provider and reviews
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch provider
        const providerRes = await api.get(`/providers/${id}`);
        setProvider(providerRes.data.data.provider);
        
        // Fetch reviews
        const reviewsRes = await api.get(`/reviews/provider/${id}`);
        setReviews(reviewsRes.data.data.reviews || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load provider details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleBooking = async (bookingData: any) => {
    try {
      setError('');
      await createBooking({
        providerId: id!,
        scheduledAt: `${bookingData.scheduledDate}T${bookingData.scheduledTime}:00`,
      });
      setBookingSuccess(true);
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!provider) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-background' : 'bg-background'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/search-providers')}
            className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </button>
          <div className={`rounded-xl p-8 border-2 border-dashed border-border/30 text-center ${
            theme === 'dark' ? 'bg-background/30' : 'bg-background/50'
          }`}>
            <AlertCircle className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Provider not found</h3>
            <p className="text-foreground/60 mb-6">The provider you're looking for doesn't exist</p>
            <button
              onClick={() => navigate('/search-providers')}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-background' : 'bg-background'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/search-providers')}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </button>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {bookingSuccess && (
          <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
            ✓ Booking created successfully! Redirecting...
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Provider Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className={`rounded-xl p-6 ${
              theme === 'dark' ? 'bg-card border border-border/30' : 'bg-card shadow-md'
            }`}>
              <div className="flex gap-6">
                <div className="w-20 h-20 bg-linear-to-br from-primary to-accent rounded-lg shrink-0"></div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {typeof provider.userId === 'string' ? provider.userId : provider.userId?.name}
                  </h1>
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-lg font-semibold text-foreground">{provider.rating.toFixed(1)}</span>
                    <span className="text-foreground/60">({provider.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-4 text-foreground/60 text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {provider.location?.lat?.toFixed(4)}, {provider.location?.lng?.toFixed(4)}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ${provider.price}/hour
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className={`rounded-xl p-6 ${
              theme === 'dark' ? 'bg-card border border-border/30' : 'bg-card shadow-md'
            }`}>
              <h2 className="text-lg font-semibold text-foreground mb-3">About</h2>
              <p className="text-foreground/80">{provider.bio}</p>
            </div>

            {/* Reviews */}
            <div className={`rounded-xl p-6 ${
              theme === 'dark' ? 'bg-card border border-border/30' : 'bg-card shadow-md'
            }`}>
              <h2 className="text-lg font-semibold text-foreground mb-4">Reviews</h2>
              <ReviewList reviews={reviews} />
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className={`lg:col-span-1 rounded-xl p-6 h-fit ${
            theme === 'dark' ? 'bg-card border border-border/30' : 'bg-card shadow-md'
          }`}>
            <h3 className="text-lg font-semibold text-foreground mb-4">Book Service</h3>
            {provider.isAvailable ? (
              <BookingForm
                providerId={provider._id}
                providerName={typeof provider.userId === 'string' ? provider.userId : provider.userId?.name}
                onSubmit={handleBooking}
              />
            ) : (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-700 dark:text-yellow-300 text-sm">
                This provider is currently unavailable
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}