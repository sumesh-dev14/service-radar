/**
 * App.tsx — Service Radar
 * Ref: §Navigation & Routes, §Route Protection Logic, §Authentication Flow
 *
 * Full route declaration using React Router DOM v7.
 * All protected page routes are code-split via React.lazy + Suspense.
 * initializeAuth() is called once on mount to restore session from localStorage.
 *
 * Route groups:
 *   Public         — /  /login  /register  /search  /provider/:id
 *   Customer only  — /customer/*  (role="customer")
 *   Provider only  — /provider/*  (role="provider")
 *   Catch-all      — * → <NotFound />
 *
 * Phase 17 — Animations:
 *   AnimatePresence wraps Routes for page-level fade transitions on route change.
 *   useLocation provides the key that triggers re-animation on navigation.
 */

import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { ProtectedRoute } from '@/components/Common/ProtectedRoute'
import { Navbar } from '@/components/Common/Navbar'
import { ToastProvider } from '@/components/Common/Toast'

// ── Page-level code splitting (lazy) ──────────────────────────────────────────

// Public pages
const Home = lazy(() => import('@/pages/Home'))
const NotFound = lazy(() => import('@/pages/NotFound'))

// Auth pages
const Login = lazy(() => import('@/pages/Auth/Login'))
const Register = lazy(() => import('@/pages/Auth/Register'))

// Public/shared provider pages
const SearchProviders = lazy(() => import('@/pages/Customer/SearchProviders'))
const ProviderDetail = lazy(() => import('@/pages/Customer/ProviderDetail'))

// Customer pages (protected, role=customer)
const CustomerDashboard = lazy(() => import('@/pages/Customer/Dashboard'))
const MyBookings = lazy(() => import('@/pages/Customer/MyBookings'))
const BookingDetails = lazy(() => import('@/pages/Customer/BookingDetails'))

// Provider pages (protected, role=provider)
const ProviderDashboard = lazy(() => import('@/pages/Provider/Dashboard'))
const ProviderProfile = lazy(() => import('@/pages/Provider/Profile'))
const AvailableBookings = lazy(() => import('@/pages/Provider/AvailableBookings'))

// ── Page transition variants (17.1) ──────────────────────────────────────────

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const PAGE_TRANSITION = {
  duration: 0.28,
  ease: [0.25, 0.1, 0.25, 1] as const, // cubic-bezier ease-in-out
}

// ── Animated page wrapper ─────────────────────────────────────────────────────

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={PAGE_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={PAGE_TRANSITION}
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  )
}

// ── Suspense fallback ─────────────────────────────────────────────────────────

function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--color-bg)',
      }}
      role="status"
      aria-label="Loading page…"
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          animation: 'spin 0.7s linear infinite',
        }}
      />
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* ── Public routes ─────────────────────────────────────────────── */}
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
          <Route path="/search" element={<PageWrapper><SearchProviders /></PageWrapper>} />
          <Route path="/provider/:id" element={<PageWrapper><ProviderDetail /></PageWrapper>} />

          {/* ── Customer routes (role="customer") ─────────────────────────── */}
          <Route element={<ProtectedRoute requiredRole="customer" />}>
            <Route path="/customer/dashboard" element={<PageWrapper><CustomerDashboard /></PageWrapper>} />
            <Route path="/customer/bookings" element={<PageWrapper><MyBookings /></PageWrapper>} />
            <Route path="/customer/bookings/:id" element={<PageWrapper><BookingDetails /></PageWrapper>} />
            {/* /customer → redirect to dashboard */}
            <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />
          </Route>

          {/* ── Provider routes (role="provider") ─────────────────────────── */}
          <Route element={<ProtectedRoute requiredRole="provider" />}>
            <Route path="/provider/dashboard" element={<PageWrapper><ProviderDashboard /></PageWrapper>} />
            <Route path="/provider/profile" element={<PageWrapper><ProviderProfile /></PageWrapper>} />
            <Route path="/provider/bookings" element={<PageWrapper><AvailableBookings /></PageWrapper>} />
            {/* /provider → redirect to dashboard */}
            <Route path="/provider" element={<Navigate to="/provider/dashboard" replace />} />
          </Route>

          {/* ── Catch-all 404 ─────────────────────────────────────────────── */}
          <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

export default function App() {
  const initializeAuth = useAuthStore(s => s.initializeAuth)

  /**
   * On first mount: restore session from localStorage + validate with /auth/me.
   * This sets authStore.initialized = true so ProtectedRoute stops showing spinner.
   */
  useEffect(() => {
    initializeAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ToastProvider>
      <Navbar />
      <AnimatedRoutes />
    </ToastProvider>
  )
}
