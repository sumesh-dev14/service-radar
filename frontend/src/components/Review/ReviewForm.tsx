import { useState } from 'react';
import { useTheme } from '../../providers/ThemeProvider';
import { Star, AlertCircle } from 'lucide-react';

interface ReviewFormProps {
  bookingId: string;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
}

export default function ReviewForm({ bookingId, onSubmit, onCancel }: ReviewFormProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      comment: e.target.value,
    }));
    setError('');
  };

  const handleRating = (rating: number) => {
    setFormData((prev) => ({
      ...prev,
      rating,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!formData.comment.trim()) {
        setError('Please write a review');
        return;
      }

      await onSubmit({ ...formData, bookingId });
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error alert */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400 shrink-0 w-5 h-5" />
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => handleRating(rating)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  rating <= formData.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-foreground/30'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Your Review</label>
        <textarea
          value={formData.comment}
          onChange={handleChange}
          placeholder="Share your experience with this service provider..." 
          rows={4}
          className={`w-full px-4 py-2.5 rounded-lg border ${
            theme === 'dark' ? 'bg-background/50 border-border/50' : 'bg-background border-border'
          } text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none`}
        />
        <p className="text-xs text-foreground/50 mt-2">{formData.comment.length}/500</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 px-4 border border-border rounded-lg font-medium text-foreground hover:bg-foreground/5 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2.5 px-4 bg-linear-to-r from-primary to-accent text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}