/**
 * ProtectedRoute — Service Radar
 * Ref: §Route Protection Logic, §Authentication Flow
 *
 * Guards routes that require authentication and/or a specific role.
 *
 * Behaviour matrix:
 * ┌─────────────────────┬─────────────────────────────────────────────┐
 * │ State               │ Result                                      │
 * ├─────────────────────┼─────────────────────────────────────────────┤
 * │ Not initialized     │ Show <LoadingSpinner> (prevents flash)      │
 * │ Not authenticated   │ Redirect → /login (save `from` location)    │
 * │ Wrong role          │ Redirect → role's dashboard                 │
 * │ Authenticated ✓     │ Render <Outlet /> (children)                │
 * └─────────────────────┴─────────────────────────────────────────────┘
 *
 * Usage in App.tsx:
 *   <Route element={<ProtectedRoute requiredRole="customer" />}>
 *     <Route path="/customer/dashboard" element={<CustomerDashboard />} />
 *   </Route>
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types/models'

// ── Inline loading spinner (avoids import cycle before Spinner is built) ──────

function InitializingSpinner() {
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
            aria-label="Loading…"
        >
            <div
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: '3px solid var(--color-border)',
                    borderTopColor: 'var(--color-primary)',
                    animation: 'spin 0.7s linear infinite',
                }}
            />
        </div>
    )
}

// ── Role → dashboard map ──────────────────────────────────────────────────────

const ROLE_HOME: Record<UserRole, string> = {
    customer: '/customer/dashboard',
    provider: '/provider/dashboard',
}

// ── ProtectedRoute ────────────────────────────────────────────────────────────

interface ProtectedRouteProps {
    /** If provided, also enforce that user.role === requiredRole */
    requiredRole?: UserRole
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
    const location = useLocation()

    const initialized = useAuthStore(s => s.initialized)
    const user = useAuthStore(s => s.user)
    const status = useAuthStore(s => s.status)

    // ── 1. Still initializing (reading localStorage + /auth/me) ──────────────
    if (!initialized || status === 'loading') {
        return <InitializingSpinner />
    }

    // ── 2. Not authenticated → redirect to /login, remembering the destination
    if (!user) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        )
    }

    // ── 3. Wrong role → redirect to the correct dashboard ────────────────────
    if (requiredRole && user.role !== requiredRole) {
        const correct = ROLE_HOME[user.role]
        return <Navigate to={correct} replace />
    }

    // ── 4. All checks pass → render child route ───────────────────────────────
    return <Outlet />
}
