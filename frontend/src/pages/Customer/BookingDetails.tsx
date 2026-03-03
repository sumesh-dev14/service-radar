import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../providers/ThemeProvider';
import { ArrowLeft, Calendar, MapPin, DollarSign, CheckCircle, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useBookingStore } from '../../store/bookingStore';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ReviewForm from '../../components/Review/ReviewForm';
import api from '../../services/api';

export default function BookingDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const { cancelBooking } = useBookingStore();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/bookings/${id}`);
        setBooking(res.data.data.booking);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBooking();
    }
  }, [id]);

  const handleCancel = async () => {
    try {
      setActionLoading(true);
      setError('');
      await cancelBooking(id!);
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data.data.booking);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewSubmit = async (data: any) => {
    try {
      setActionLoading(true);
      setError('');
      await api.post('/reviews', {
        bookingId: id,
        rating: data.rating,
        comment: data.comment,
      });
      setShowReviewForm(false);
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data.data.booking);
    } catch (err: any) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!booking) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-background' : 'bg-background'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/my-bookings')}
            className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Bookings
          </button>
          <div className={`rounded-xl p-8 border-2 border-dashed border-border/30 text-center ${
            theme === 'dark' ? 'bg-background/30' : 'bg-background/50'
          }`}>
            <AlertCircle className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Booking not found</h3>
            <p className="text-foreground/60 mb-6">The booking you're looking for doesn't exist</p>
            <button
              onClick={() => navigate('/my-bookings')}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
            >
              Back to Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusColors: any = {
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
    accepted: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
    completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
    cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
  };

  const colors = statusColors[booking.status] || statusColors.pending;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-background' : 'bg-background'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/my-bookings')}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bookings
        </button>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {booking ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className={`rounded-xl p-6 ${
                theme === 'dark' ? 'bg-card border border-border/30' : 'bg-card shadow-md'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Booking #{booking._id?.substring(0, 8)}</h1>
                    <div className={`flex items-center gap-2 ${colors.text}`}>
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium capitalize">{booking.status}</span>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-lg font-medium capitalize ${colors.bg} ${colors.text}`}>
                    {booking.status}
                  </span>
                </div>
              </div>

              <div className={`rounded-xl p-6 ${
                theme === 'dark' ? 'bg-card border border-border/30' : 'bg-card shadow-md'
              }`}>
                <h2 className="text-lg font-semibold text-foreground mb-4">Details</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="text-foreground/60 text-sm">Scheduled Date & Time</p>
                      <p className="text-foreground font-medium">{new Date(booking.scheduledDate).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="text-foreground/60 text-sm">Provider</p>
                      <p className="text-foreground font-medium">
                        {typeof booking.providerId === 'string' 
                          ? booking.providerId 
                          : booking.providerId?.userId?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  {typeof booking.providerId === 'object' && booking.providerId?.price && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="text-foreground/60 text-sm">Service Price</p>
                        <p className="text-foreground font-medium">${booking.providerId.price}/hour</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={`rounded-xl p-6 ${
                theme === 'dark' ? 'bg-card border border-border/30' : 'bg-card shadow-md'
              }`}>
                <h2 className="text-lg font-semibold text-foreground mb-4">Status Timeline</h2>
                <div className="space-y-4">
                  {[
                    { status: 'pending', label: 'Booking Created' },
                    { status: 'accepted', label: 'Provider Accepted' },
                    { status: 'completed', label: 'Service Complete' },
                    { status: 'cancelled', label: 'Cancelled' },
                  ].map((item, idx) => {
                    const isDone = 
                      (item.status === 'pending') ||
                      (item.status === 'accepted' && ['accepted', 'completed'].includes(booking.status)) ||
                      (item.status === 'completed' && booking.status === 'completed');
                    
                    return (
                      <div key={idx} className="flex gap-4 pb-4 border-b border-border/30 last:border-0 last:pb-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                          isDone ? 'bg-green-500' : booking.status === 'cancelled' ? 'bg-red-500' : 'border-2 border-foreground/30'
                        }`}>
                          {isDone && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-foreground font-medium">{item.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {booking.status === 'completed' && !showReviewForm && (
                <div className={`rounded-xl p-6 ${
                  theme === 'dark' ? 'bg-card border border-border/30' : 'bg-card shadow-md'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-foreground/60" />
                      <div>
                        <p className="text-foreground font-medium">Rate this service</p>
                        <p className="text-foreground/60 text-sm">Share your experience with others</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
                    >
                      Write Review
                    </button>
                  </div>
                </div>
              )}

              {showReviewForm && (
                <div className={`rounded-xl p-6 ${
                  theme === 'dark' ? 'bg-card border border-border/30' : 'bg-card shadow-md'
                }`}>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Leave a Review</h3>
                  <ReviewForm
                    bookingId={id!}
                    onSubmit={handleReviewSubmit}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </div>
              )}
            </div>

            <div className={`lg:col-span-1 rounded-xl p-6 h-fit ${
              theme === 'dark' ? 'bg-card border border-border/30' : 'bg-card shadow-md'
            }`}>
              <h3 className="text-lg font-semibold text-foreground mb-4">Actions</h3>
              <div className="space-y-3">
                {booking.status === 'pending' && (
                  <button
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg font-medium hover:bg-red-500/20 transition disabled:opacity-50"
                  >
                    {actionLoading ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                )}
                <button
                  onClick={() => navigate('/search-providers')}
                  className="w-full px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg font-medium hover:bg-primary/20 transition"
                >
                  Find More Services
                </button>
                <button
                  onClick={() => navigate('/my-bookings')}
                  className="w-full px-4 py-2 bg-foreground/5 text-foreground border border-foreground/10 rounded-lg font-medium hover:bg-foreground/10 transition"
                >
                  View All Bookings
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={`rounded-xl p-8 border-2 border-dashed border-border/30 text-center ${
            theme === 'dark' ? 'bg-background/30' : 'bg-background/50'
          }`}>
            <Clock className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Booking #{id?.substring(0, 8)}</h3>
            <p className="text-foreground/60">Loading booking details...</p>
          </div>
        )}
      </div>
    </div>
  );
}
