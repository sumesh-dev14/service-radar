import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../providers/ThemeProvider';
import { Menu, X, Moon, Sun, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  if (!isAuthenticated) {
    return null;
  }

  const navLinks = user?.role === 'provider' 
    ? [
        { label: 'Dashboard', path: '/provider/dashboard' },
        { label: 'Bookings', path: '/provider/available-bookings' },
        { label: 'Profile', path: '/provider/profile' },
      ]
    : [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Search', path: '/search-providers' },
        { label: 'My Bookings', path: '/my-bookings' },
      ];

  return (
    <nav className={`sticky top-0 z-50 ${
      theme === 'dark'
        ? 'bg-card/80 border-b border-border/30'
        : 'bg-card/95 border-b border-border/20 shadow-sm'
    } backdrop-blur-md`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            onClick={() => navigate(user?.role === 'provider' ? '/provider/dashboard' : '/dashboard')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-linear-to-br from-primary to-accent rounded-lg"></div>
            <span className="text-xl font-bold text-foreground hidden sm:inline">Service Radar</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-primary'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right side - Theme toggle, User menu, Mobile menu */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>

            {/* User menu - Desktop */}
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-sm text-foreground/70 font-medium">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-foreground/5 rounded-lg transition-colors"
            >
              {isOpen ? (
                <X className="w-5 h-5 text-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border/30 py-4 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/60 hover:bg-foreground/5'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}