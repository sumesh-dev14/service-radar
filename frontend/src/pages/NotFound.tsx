import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../providers/ThemeProvider';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      theme === 'dark' ? 'bg-background' : 'bg-background'
    }`}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main container */}
      <div className="relative text-center max-w-md">
        {/* Error icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        {/* Error code */}
        <h1 className="text-6xl font-bold text-primary mb-2">404</h1>

        {/* Error message */}
        <h2 className="text-2xl font-semibold text-foreground mb-3">Page Not Found</h2>
        <p className="text-foreground/60 mb-8">
          Sorry, the page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        {/* Action buttons */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-2.5 px-4 border border-border rounded-lg font-medium text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            {isAuthenticated ? 'Dashboard' : 'Login'}
          </button>
        </div>

        {/* Decorative element */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-foreground/50">
            Need help?{' '}
            <a href="mailto:support@serviceradar.com" className="text-primary hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
