import { useTheme } from '../../providers/ThemeProvider';
import { Star, User } from 'lucide-react';

interface Review {
  _id: string;
  customerId: any;
  rating: number;
  comment: string;
  createdAt?: string;
}

interface ReviewListProps {
  reviews: Review[];
  isLoading?: boolean;
}

export default function ReviewList({ reviews, isLoading = false }: ReviewListProps) {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`rounded-xl h-32 animate-pulse ${
              theme === 'dark' ? 'bg-background/50' : 'bg-background/30'
            }`}
          />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={`rounded-xl p-8 border-2 border-dashed border-border/30 text-center ${
        theme === 'dark' ? 'bg-background/30' : 'bg-background/50'
      }`}>
        <Star className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No reviews yet</h3>
        <p className="text-foreground/60">
          Be the first to review this provider
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review._id}
          className={`rounded-xl p-6 ${
            theme === 'dark'
              ? 'bg-card border border-border/30'
              : 'bg-card border border-border/20 shadow-sm'
          }}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-primary to-accent rounded-full flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {typeof review.customerId === 'string' ? 'Anonymous' : review.customerId?.name || 'Anonymous'}
                </p>
                <p className="text-xs text-foreground/50">
                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-foreground/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Comment */}
          <p className="text-foreground/80 text-sm leading-relaxed">
            {review.comment}
          </p>
        </div>
      ))}
    </div>
  );
}