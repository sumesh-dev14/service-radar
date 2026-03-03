import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../providers/ThemeProvider';
import { Briefcase } from 'lucide-react';

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  if (!isAuthenticated || !user || user.role !== 'provider') {
    navigate('/login');
    return null;
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-background' : 'bg-background'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Provider Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`p-6 rounded-xl ${
              theme === 'dark' ? 'bg-card border border-border/30' : 'bg-card shadow-md'
            }`}>
              <Briefcase className="w-6 h-6 text-primary mb-3" />
              <h3 className="text-foreground/60 text-sm font-medium mb-2">Metric {i}</h3>
              <p className="text-2xl font-bold text-foreground">0</p>
            </div>
          ))}
        </div>

        <div className={`rounded-xl p-8 border-2 border-dashed border-border/30 text-center ${
          theme === 'dark' ? 'bg-background/30' : 'bg-background/50'
        }`}>
          <Briefcase className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Welcome, {user.name}</h3>
          <p className="text-foreground/60">
            Complete your profile and start receiving bookings
          </p>
        </div>
      </div>
    </div>
  );
}