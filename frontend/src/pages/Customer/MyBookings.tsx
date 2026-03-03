import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../providers/ThemeProvider';
import { ArrowLeft, Calendar, Star, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useBookingStore } from '../../store/bookingStore';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

export default function MyBookings() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const { bookings, isLoading, error, fetchMyBookings } = useBookingStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyBookings();
    } else {
      navigate('/login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'accepted':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'completed':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'cancelled':
        return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-background' : 'bg-background'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-foreground mb-8">My Bookings</h1>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className={`rounded-xl p-8 border-2 border-dashed border-border/30 text-center ${
            theme === 'dark' ? 'bg-background/30' : 'bg-background/50'
          }`}>
            <Calendar className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No bookings yet</h3>
            <p className="text-foreground/60 mb-6">
              Start by searching for service providers
            </p>
            <button
              onClick={() => navigate('/search-providers')}
              className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Browse Providers
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking: any) => (
              <div
                key={booking._id}
                onClick={() => navigate(`/booking/${booking._id}`)}
                className={`p-6 rounded-xl border cursor-pointer hover:shadow-lg transition-all ${
                  theme === 'dark' ? 'bg-card border-border/30 hover:border-primary/50' : 'bg-card border-border/20 shadow-md hover:shadow-lg'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Booking #{booking._id?.substring(0, 8)}
                    </h3>
                    <p className="text-foreground/60 text-sm">
                      Provider: {typeof booking.providerId === 'string' 
                        ? booking.providerId 
                        : booking.providerId?.userId?.name || 'Unknown'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium border capitalize ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-foreground/70">
                  <p>📅 {new Date(booking.scheduledDate).toLocaleDateString()}</p>
                  <p>⏰ {new Date(booking.scheduledDate).toLocaleTimeString()}</p>
                  {typeof booking.providerId === 'object' && booking.providerId?.price && (
                    <p>💰 ${booking.providerId.price}/hour</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}