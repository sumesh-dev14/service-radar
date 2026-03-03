import { useState } from 'react';
import { useTheme } from '../../providers/ThemeProvider';
import { Calendar, MapPin, Clock, AlertCircle } from 'lucide-react';

interface BookingFormProps {
  providerId: string;
  providerName: string;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
}

export default function BookingForm({ providerId, providerName, onSubmit, onCancel }: BookingFormProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    location: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!formData.scheduledDate || !formData.scheduledTime) {
        setError('Please fill in all required fields');
        return;
      }

      await onSubmit({ ...formData, providerId });
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
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

      {/* Provider info */}
      <div className={`p-4 rounded-lg border ${(
        theme === 'dark' ? 'bg-background/50 border-border/50' : 'bg-background border-border'
      )}`}>
        <p className="text-sm text-foreground/60">Booking with</p>
        <p className="text-lg font-semibold text-foreground">{providerName}</p>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Preferred Date *</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 w-5 h-5 text-foreground/30" />
          <input
            type="date"
            name="scheduledDate"
            value={formData.scheduledDate}
            onChange={handleChange}
            required
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
              theme === 'dark' ? 'bg-background/50 border-border/50' : 'bg-background border-border'
            } text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all`}
          />
        </div>
      </div>

      {/* Time */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Preferred Time *</label>
        <div className="relative">
          <Clock className="absolute left-3 top-3 w-5 h-5 text-foreground/30" />
          <input
            type="time"
            name="scheduledTime"
            value={formData.scheduledTime}
            onChange={handleChange}
            required
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
              theme === 'dark' ? 'bg-background/50 border-border/50' : 'bg-background border-border'
            } text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all`}
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Service Location</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-5 h-5 text-foreground/30" />
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter your address..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
              theme === 'dark' ? 'bg-background/50 border-border/50' : 'bg-background border-border'
            } text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all`}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Additional Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any specific requests or details..."
          rows={3}
          className={`w-full px-4 py-2.5 rounded-lg border ${
            theme === 'dark' ? 'bg-background/50 border-border/50' : 'bg-background border-border'
          } text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none`}
        />
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
          {isLoading ? 'Booking...' : 'Confirm Booking'}
        </button>
      </div>
    </form>
  );
}