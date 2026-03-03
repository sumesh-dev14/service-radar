import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../providers/ThemeProvider';
import { AlertCircle, Mail, Lock, User, ArrowRight, UserCheck } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isAuthenticated, user } = useAuth();
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: (searchParams.get('role') || 'customer') as 'customer' | 'provider',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const destination = user.role === 'provider' ? '/provider/dashboard' : '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate inputs
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      // Name validation
      if (formData.name.length < 2) {
        setError('Name must be at least 2 characters');
        setIsLoading(false);
        return;
      }

      // Password validation
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }

      // Password match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      // Call register - useEffect will handle redirect on success
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      );
      // No navigation here - let useEffect handle it when isAuthenticated changes
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-8 ${
      theme === 'dark' ? 'bg-background' : 'bg-background'
    }`}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main container */}
      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Service Radar
          </h1>
          <p className="text-foreground/60">Create your account</p>
        </div>

        {/* Card */}
        <div className={`rounded-2xl p-8 ${
          theme === 'dark' 
            ? 'bg-card border border-border/30' 
            : 'bg-card border border-border/20 shadow-lg'
        }`}>
          {/* Error alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400 shrink-0 w-5 h-5" />
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-primary/50" />
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-background/50 border-border/50 focus:border-primary'
                      : 'bg-background border-border focus:border-primary'
                  } text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-primary/50" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-background/50 border-border/50 focus:border-primary'
                      : 'bg-background border-border focus:border-primary'
                  } text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-primary/50" />
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-background/50 border-border/50 focus:border-primary'
                      : 'bg-background border-border focus:border-primary'
                  } text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>
            </div>

            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-3 w-5 h-5 text-primary/50" />
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-background/50 border-border/50 focus:border-primary'
                      : 'bg-background border-border focus:border-primary'
                  } text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>
            </div>

            {/* Role selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-foreground mb-2">
                I want to sign up as
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-background/50 border-border/50 focus:border-primary'
                    : 'bg-background border-border focus:border-primary'
                } text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="customer">Customer (Find Services)</option>
                <option value="provider">Service Provider (Offer Services)</option>
              </select>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-lg hover:shadow-lg hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-foreground/60 bg-card">Already have an account?</span>
            </div>
          </div>

          {/* Login link */}
          <Link
            to="/login"
            className="w-full block text-center py-2.5 px-4 border border-border rounded-lg font-medium text-primary hover:bg-primary/5 transition-all"
          >
            Sign In
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-foreground/50 mt-6">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-primary hover:underline">
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
}
