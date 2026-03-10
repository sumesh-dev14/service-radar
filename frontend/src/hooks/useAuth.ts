/**
 * useAuth — Service Radar
 * Ref: §Custom Hooks, §Authentication Flow, §State Management
 *
 * Thin wrapper around useAuthStore that exposes a clean, semantic API
 * for any component that needs auth state or actions.
 *
 * Returns:
 *   user              — current User object (null if not authenticated)
 *   isAuthenticated   — true when status === 'authenticated'
 *   isLoading         — true while login / register / logout / initializeAuth is in flight
 *   initialized       — true once initializeAuth() has completed (use to prevent flash)
 *   error             — last error message from auth operations
 *   role              — 'customer' | 'provider' | null
 *   isCustomer        — convenience boolean
 *   isProvider        — convenience boolean
 *   login()           — calls authStore.login() with payload
 *   register()        — calls authStore.register() with payload
 *   logout()          — calls authStore.logout()
 *   clearError()      — clears the error state
 */

import { useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import type { LoginPayload, RegisterPayload } from '@/types/models'

export function useAuth() {
    const user = useAuthStore(s => s.user)
    const status = useAuthStore(s => s.status)
    const error = useAuthStore(s => s.error)
    const initialized = useAuthStore(s => s.initialized)

    // Pull actions (stable refs from Zustand — won't cause re-renders)
    const loginAction = useAuthStore(s => s.login)
    const registerAction = useAuthStore(s => s.register)
    const logoutAction = useAuthStore(s => s.logout)
    const clearErrorAction = useAuthStore(s => s.clearError)

    // ── Derived state ─────────────────────────────────────────────────────────
    const isAuthenticated = status === 'authenticated' && user !== null
    const isLoading = status === 'loading'
    const role = user?.role ?? null
    const isCustomer = role === 'customer'
    const isProvider = role === 'provider'

    // ── Wrapped actions (stable references via useCallback) ───────────────────

    const login = useCallback(
        async (payload: LoginPayload) => {
            await loginAction(payload)
        },
        [loginAction],
    )

    const register = useCallback(
        async (payload: RegisterPayload) => {
            await registerAction(payload)
        },
        [registerAction],
    )

    const logout = useCallback(async () => {
        await logoutAction()
    }, [logoutAction])

    const clearError = useCallback(() => {
        clearErrorAction()
    }, [clearErrorAction])

    return {
        // State
        user,
        isAuthenticated,
        isLoading,
        initialized,
        error,
        role,
        isCustomer,
        isProvider,

        // Actions
        login,
        register,
        logout,
        clearError,
    }
}
