import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './providers/ThemeProvider';
import { useAuth } from './hooks/useAuth';
import { useAuthStore } from './store/authStore';
import './App.css';

// Home page
import Home from './pages/Home';

// Auth pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Customer pages
import CustomerDashboard from './pages/Customer/Dashboard';
import SearchProviders from './pages/Customer/SearchProviders';
import ProviderDetail from './pages/Customer/ProviderDetail';
import MyBookings from './pages/Customer/MyBookings';
import BookingDetails from './pages/Customer/BookingDetails';

// Provider pages
import ProviderDashboard from './pages/Provider/Dashboard';
import AvailableBookings from './pages/Provider/AvailableBookings';
import ProviderProfile from './pages/Provider/Profile';

// Common pages
import NotFound from './pages/NotFound';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const initialized = useAuthStore((state) => state.initialized);
  
  // Don't check auth until app is initialized
  if (!initialized) return <div>Loading...</div>;
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function ProviderRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const initialized = useAuthStore((state) => state.initialized);
  
  // Don't check auth until app is initialized
  if (!initialized) return <div>Loading...</div>;
  
  if (!isAuthenticated || user?.role !== 'provider') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function CustomerRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const initialized = useAuthStore((state) => state.initialized);
  
  // Don't check auth until app is initialized
  if (!initialized) return <div>Loading...</div>;
  
  if (!isAuthenticated || user?.role !== 'customer') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  const initialized = useAuthStore((state) => state.initialized);
  
  // Don't redirect until app is fully initialized
  if (!initialized) return <div>Loading...</div>;
  
  // If authenticated, redirect to appropriate dashboard
  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'provider' ? '/provider/dashboard' : '/dashboard'} replace />;
  }
  
  // Otherwise show home page
  return <Home />;
}

function AppContent() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const initialized = useAuthStore((state) => state.initialized);

  useEffect(() => {
    initializeAuth();
  }, []);

  if (!initialized) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/signup" element={<Navigate to="/register" replace />} />

          {/* Customer routes */}
          <Route
            path="/dashboard"
            element={
              <CustomerRoute>
                <CustomerDashboard />
              </CustomerRoute>
            }
          />
          <Route
            path="/search-providers"
            element={
              <CustomerRoute>
                <SearchProviders />
              </CustomerRoute>
            }
          />
          <Route
            path="/provider/:id"
            element={
              <CustomerRoute>
                <ProviderDetail />
              </CustomerRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <CustomerRoute>
                <MyBookings />
              </CustomerRoute>
            }
          />
          <Route
            path="/booking/:id"
            element={
              <CustomerRoute>
                <BookingDetails />
              </CustomerRoute>
            }
          />

          {/* Provider routes */}
          <Route
            path="/provider/dashboard"
            element={
              <ProviderRoute>
                <ProviderDashboard />
              </ProviderRoute>
            }
          />
          <Route
            path="/provider/available-bookings"
            element={
              <ProviderRoute>
                <AvailableBookings />
              </ProviderRoute>
            }
          />
          <Route
            path="/provider/profile"
            element={
              <ProviderRoute>
                <ProviderProfile />
              </ProviderRoute>
            }
          />

      {/* Redirects */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
