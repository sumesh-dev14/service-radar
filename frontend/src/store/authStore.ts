/**
 * Auth Store — Service Radar
 * Ref: §State Management (Zustand), §Authentication Flow
 *
 * Manages authentication session:
 *   - user:         currently logged-in User (null if not authenticated)
 *   - status:       'idle' | 'loading' | 'authenticated' | 'unauthenticated'
 *   - error:        last error message (null when clean)
 *   - initialized:  true once initializeAuth() has run (prevents flash of logged-out UI)
 *
 * Persistence strategy:
 *   - Token:  localStorage key 'sr_token'  (used in Axios interceptor)
 *   - User:   localStorage key 'sr_user'   (JSON-serialised User object)
 *   - initializeAuth() reads from localStorage on app boot (called in <App> useEffect)
 *   - If localStorage has a user, calls GET /auth/me to verify token is still valid
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { AuthStatus, LoginPayload, RegisterPayload, User } from '@/types/models'
import * as authService from '@/services/authService'
import { useProviderStore } from './providerStore'
import { useBookingStore } from './bookingStore'

// ── State + Actions Interface ─────────────────────────────────────────────────

interface AuthState {
    // State
    user: User | null
    status: AuthStatus
    error: string | null
    initialized: boolean   // true once initializeAuth() finishes (first render guard)

    // Actions
    initializeAuth: () => Promise<void>
    login: (payload: LoginPayload) => Promise<void>
    register: (payload: RegisterPayload) => Promise<void>
    logout: () => Promise<void>
    setUser: (user: User | null) => void
    clearError: () => void
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
    devtools(
        (set) => ({
            // ── Initial state ────────────────────────────────────────────────────
            user: null,
            status: 'idle',
            error: null,
            initialized: false,

            // ── initializeAuth ───────────────────────────────────────────────────
            /**
             * Called once on app boot (in App.tsx useEffect).
             * Reads user from localStorage and validates with GET /auth/me.
             * If validation fails → clears stale data, user is treated as logged out.
             */
            initializeAuth: async () => {
                set({ status: 'loading' }, false, 'auth/initializeAuth/start')

                const savedUser = localStorage.getItem('sr_user')

                if (!savedUser) {
                    // No session stored → immediately mark as unauthenticated
                    set(
                        { status: 'unauthenticated', initialized: true },
                        false,
                        'auth/initializeAuth/noSession',
                    )
                    // Clear provider profile cache
                    useProviderStore.getState().clearMyProfile()
                    useBookingStore.getState().clearBookings()
                    return
                }

                try {
                    // Validate token with backend
                    const user = await authService.getMe()
                    set(
                        { user, status: 'authenticated', initialized: true, error: null },
                        false,
                        'auth/initializeAuth/success',
                    )
                } catch {
                    // Token expired or invalid — clear stale data
                    localStorage.removeItem('sr_user')
                    localStorage.removeItem('sr_token')
                    set(
                        { user: null, status: 'unauthenticated', initialized: true },
                        false,
                        'auth/initializeAuth/expired',
                    )
                    // Clear provider profile cache
                    useProviderStore.getState().clearMyProfile()
                    useBookingStore.getState().clearBookings()
                }
            },

            // ── login ────────────────────────────────────────────────────────────
            login: async (payload) => {
                set({ status: 'loading', error: null }, false, 'auth/login/start')
                try {
                    const user = await authService.login(payload)
                    set(
                        { user, status: 'authenticated', error: null },
                        false,
                        'auth/login/success',
                    )
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Login failed'
                    set(
                        { status: 'unauthenticated', error: message },
                        false,
                        'auth/login/error',
                    )
                    throw err  // re-throw so form components can handle it
                }
            },

            // ── register ─────────────────────────────────────────────────────────
            register: async (payload) => {
                set({ status: 'loading', error: null }, false, 'auth/register/start')
                try {
                    const user = await authService.register(payload)
                    set(
                        { user, status: 'authenticated', error: null },
                        false,
                        'auth/register/success',
                    )
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Registration failed'
                    set(
                        { status: 'unauthenticated', error: message },
                        false,
                        'auth/register/error',
                    )
                    throw err
                }
            },

            // ── logout ───────────────────────────────────────────────────────────
            logout: async () => {
                set({ status: 'loading' }, false, 'auth/logout/start')
                try {
                    await authService.logout()
                } finally {
                    // Always reset state even if network call fails
                    set(
                        { user: null, status: 'unauthenticated', error: null },
                        false,
                        'auth/logout/done',
                    )
                    // Clear provider profile cache and bookings
                    useProviderStore.getState().clearMyProfile()
                    useBookingStore.getState().clearBookings()
                }
            },

            // ── setUser ──────────────────────────────────────────────────────────
            /** Directly update user (e.g., after profile edit) */
            setUser: (user) => {
                if (user) {
                    localStorage.setItem('sr_user', JSON.stringify(user))
                    set({ user, status: 'authenticated' }, false, 'auth/setUser')
                } else {
                    localStorage.removeItem('sr_user')
                    set({ user: null, status: 'unauthenticated' }, false, 'auth/setUser/null')
                }
            },

            // ── clearError ───────────────────────────────────────────────────────
            clearError: () => set({ error: null }, false, 'auth/clearError'),
        }),
        { name: 'AuthStore' },
    ),
)

// ── Derived Selectors ─────────────────────────────────────────────────────────

/** True when user is logged in */
export const selectIsAuthenticated = (s: AuthState) =>
    s.status === 'authenticated' && s.user !== null

/** True while login/register/logout is in flight */
export const selectAuthLoading = (s: AuthState) =>
    s.status === 'loading'

/** User's role string or null */
export const selectUserRole = (s: AuthState) =>
    s.user?.role ?? null
