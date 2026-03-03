import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../providers/ThemeProvider';
import { ArrowLeft, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useBookingStore } from '../../store/bookingStore';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

export default function AvailableBookings() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const { acceptBooking, completeBooking } = useBookingStore();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!isAuthenticated || user?.role !== 'provider') {
    navigate('/login');
    return null;
  }

  // Fetch pending bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/bookings/me');
        // Filter for pending bookings only
        const pendingBookings = res.data.data.bookings.filter(
          (b: any) => b.status === 'pending' || b.status === 'accepted'
        );
        setBookings(pendingBookings);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleAccept = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);
      setError('');
      await acceptBooking(bookingId);
      // Refresh bookings
      const res = await api.get('/bookings/me');
      const pendingBookings = res.data.data.bookings.filter(
        (b: any) => b.status === 'pending' || b.status === 'accepted'
      );
      setBookings(pendingBookings);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);
      setError('');
      await completeBooking(bookingId);
      // Refresh bookings
      const res = await api.get('/bookings/me');
      const pendingBookings = res.data.data.bookings.filter(
        (b: any) => b.status === 'pending' || b.status === 'accepted'
      );
      setBookings(pendingBookings);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete booking');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
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

        <h1 className="text-3xl font-bold text-foreground mb-8">Available Bookings</h1>

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
            <Clock className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No pending bookings</h3>
            <p className="text-foreground/60">
              Bookings will appear here when customers request your services
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking: any) => (
              <div
                key={booking._id}
                className={`rounded-xl p-6 border ${
                  theme === 'dark' ? 'bg-card border-border/30' : 'bg-card border-border/20 shadow-md'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start mb-4">
                  {/* Booking info */}
                  <div>
                    <p className="text-foreground/60 text-sm mb-1">Booking ID</p>
                    <p className="font-semibold text-foreground">{booking._id?.substring(0, 8)}</p>
                  </div>

                  <div>
                    <p className="text-foreground/60 text-sm mb-1">Customer</p>
                    <p className="font-semibold text-foreground">
                      {typeof booking.customerId === 'string' 
                        ? booking.customerId 
                        : booking.customerId?.name || 'Unknown'}
                    </p>
                  </div>

                  <div>
                    <p className="text-foreground/60 text-sm mb-1">Scheduled Date</p>
                    <p className="font-semibold text-foreground">
                      {new Date(booking.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-foreground/60 text-sm mb-1">Status</p>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    }`}>
                      <Clock className="w-3 h-3" />
                      {booking.status}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-border/30">
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleAccept(booking._id)}
                      disabled={actionLoading !== null}
                      className="flex-1 px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg font-medium hover:bg-green-500/20 transition disabled:opacity-50"
                    >
                      {actionLoading === booking._id ? 'Accepting...' : 'Accept Booking'}
                    </button>
                  )}

                  {booking.status === 'accepted' && (
                    <button
                      onClick={() => handleComplete(booking._id)}
                      disabled={actionLoading !== null}
                      className="flex-1 px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg font-medium hover:bg-green-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {actionLoading === booking._id ? 'Completing...' : 'Complete Service'}
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/booking/${booking._id}`)}
                    className="flex-1 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg font-medium hover:bg-primary/20 transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}