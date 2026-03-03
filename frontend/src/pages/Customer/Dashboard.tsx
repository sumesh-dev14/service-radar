import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../providers/ThemeProvider';
import { Search, MapPin, Clock, Star } from 'lucide-react';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-background' : 'bg-background'}`}>
      {/* Navigation */}
      <nav className={`sticky top-0 z-40 ${
        theme === 'dark' 
          ? 'bg-card/80 border-b border-border/30' 
          : 'bg-card/95 border-b border-border/20 shadow-sm'
      } backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-primary to-accent rounded-lg"></div>
              <span className="text-xl font-bold text-foreground">Service Radar</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-foreground/60 text-sm">Hello, {user.name}</span>
              <button
                onClick={() => navigate('/my-bookings')}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-foreground/60 hover:text-primary transition-colors"
              >
                My Bookings
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('authToken');
                  navigate('/login');
                }}
                className="px-4 py-1.5 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Find the Perfect Service Provider
            </h1>
            <p className="text-xl text-foreground/60">
              Browse local professionals and book services in just a few clicks
            </p>
          </div>

          {/* Search section */}
          <div className="max-w-2xl mx-auto mb-12">
            <button
              onClick={() => navigate('/search-providers')}
              className={`w-full px-6 py-4 rounded-xl border-2 border-primary/30 ${
                theme === 'dark' ? 'bg-card' : 'bg-card shadow-lg'
              } flex items-center gap-3 hover:border-primary transition-all group cursor-pointer`}
            >
              <Search className="w-5 h-5 text-primary group-hover:text-primary transition-colors" />
              <span className="text-foreground/60 group-hover:text-foreground transition-colors">
                Search for services or providers...
              </span>
            </button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-xl ${
              theme === 'dark' ? 'bg-card border border-border/30' : 'bg-card shadow-md'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-primary" />
                </div>
              </div>
              <h3 className="text-foreground font-semibold mb-1">Browse Services</h3>
              <p className="text-foreground/60 text-sm">Find local professionals in your area</p>
            </div>

            <div className={`p-6 rounded-xl ${
              theme === 'dark' ? 'bg-card border border-border/30' : 'bg-card shadow-md'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
              </div>
              <h3 className="text-foreground font-semibold mb-1">Easy Booking</h3>
              <p className="text-foreground/60 text-sm">Book services instantly with just a few taps</p>
            </div>

            <div className={`p-6 rounded-xl ${
              theme === 'dark' ? 'bg-card border border-border/30' : 'bg-card shadow-md'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-secondary" />
                </div>
              </div>
              <h3 className="text-foreground font-semibold mb-1">Trusted Reviews</h3>
              <p className="text-foreground/60 text-sm">Read verified reviews from other customers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-foreground mb-8">Getting Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={`p-8 rounded-xl ${
            theme === 'dark' ? 'bg-card border border-border/30' : 'bg-card shadow-md'
          }`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center font-bold text-primary">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground">Select a Service Category</h3>
            </div>
            <p className="text-foreground/60 mb-4">
              Browse through various service categories like plumbing, cleaning, repairs, and more.
            </p>
            <button
              onClick={() => navigate('/search-providers')}
              className="text-primary font-medium hover:underline flex items-center gap-2"
            >
              Start browsing <MapPin className="w-4 h-4" />
            </button>
          </div>

          <div className={`p-8 rounded-xl ${
            theme === 'dark' ? 'bg-card border border-border/30' : 'bg-card shadow-md'
          }`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center font-bold text-accent">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground">View My Bookings</h3>
            </div>
            <p className="text-foreground/60 mb-4">
              Track your bookings, view provider details, and manage your scheduled services.
            </p>
            <button
              onClick={() => navigate('/my-bookings')}
              className="text-accent font-medium hover:underline flex items-center gap-2"
            >
              View bookings <Clock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
