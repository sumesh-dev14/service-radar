import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../providers/ThemeProvider';
import { Calendar, MapPin, DollarSign, ChevronRight } from 'lucide-react';

interface BookingCardProps {
  id: string;
  providerName: string;
  categoryName: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  scheduledDate: string;
  location: string;
  price: number;
}

export default function BookingCard({
  id,
  providerName,
  categoryName,
  status,
  scheduledDate,
  location,
  price,
}: BookingCardProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const statusConfig = {
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Pending' },
    accepted: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Accepted' },
    completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Completed' },
    cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Cancelled' },
  };

  const config = statusConfig[status];

  return (
    <div
      onClick={() => navigate(`/booking/${id}`)}
      className={`rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
        theme === 'dark'
          ? 'bg-card border border-border/30 hover:border-primary/50'
          : 'bg-card border border-border/20 shadow-md hover:shadow-xl'
      }}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="mb-4">
            <h3 className="font-semibold text-foreground mb-1">{providerName}</h3>
            <p className="text-sm text-foreground/60">{categoryName}</p>
          </div>

          {/* Details */}
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex items-center gap-2 text-foreground/70">
              <Calendar className="w-4 h-4" />
              <span>{new Date(scheduledDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/70">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{location}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/70">
              <DollarSign className="w-4 h-4" />
              <span>${price.toFixed(2)}</span>
            </div>
          </div>

          {/* Status badge */}
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            <div className={`w-2 h-2 rounded-full ${
              status === 'pending' ? 'bg-yellow-500' :
              status === 'accepted' ? 'bg-blue-500' :
              status === 'completed' ? 'bg-green-500' :
              'bg-red-500'
            }`} />
            {config.label}
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-foreground/30 shrink-0" />
      </div>
    </div>
  );
}