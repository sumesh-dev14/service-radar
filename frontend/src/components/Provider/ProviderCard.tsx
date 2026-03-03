import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../providers/ThemeProvider';
import { Star, MapPin, DollarSign, Check } from 'lucide-react';

interface ProviderCardProps {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  price: number;
  location: string;
  isAvailable: boolean;
  bio?: string;
}

export default function ProviderCard({
  id,
  name,
  category,
  rating,
  reviews,
  price,
  location,
  isAvailable,
  bio,
}: ProviderCardProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div
      onClick={() => navigate(`/provider/${id}`)}
      className={`rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
        theme === 'dark'
          ? 'bg-card border border-border/30 hover:border-primary/50'
          : 'bg-card border border-border/20 shadow-md hover:shadow-xl'
      }}`}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-linear-to-br from-primary to-accent rounded-lg shrink-0" />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground">{name}</h3>
              <p className="text-sm text-foreground/60">{category}</p>
            </div>
            {isAvailable && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded text-green-700 dark:text-green-400 text-xs font-medium">
                <Check className="w-3 h-3" />
                Available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <p className="text-sm text-foreground/60 mb-4 line-clamp-2">
          {bio}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 py-4 border-y border-border/30">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
          </div>
          <p className="text-xs text-foreground/60">({reviews} reviews)</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">{price}/hr</span>
          </div>
          <p className="text-xs text-foreground/60">Hourly Rate</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-foreground/60 mb-1">Distance</p>
          <p className="font-semibold text-foreground">2.3 mi</p>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-start gap-2 mt-4 text-sm text-foreground/60">
        <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{location}</span>
      </div>

      {/* CTA */}
      <button className="w-full mt-4 py-2 px-3 bg-linear-to-r from-primary to-accent text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all">
        View Details
      </button>
    </div>
  );
}