/**
 * Auth Service — Service Radar
 * Ref: §Authentication Endpoints
 *
 * Endpoints:
 *   POST /auth/register
 *   POST /auth/login
 *   POST /auth/logout
 *   GET  /auth/me
 */

import api, { tokenStorage } from './api'
import type {
    ApiResponse,
    AuthResponseData,
    LoginPayload,
    RegisterPayload,
    User,
} from '@/types/models'

// ── Register ─────────────────────────────────────────────────────────────────

/**
 * Register a new user (customer or provider).
 * Does NOT set token — backend returns user only; token arrives via cookie.
 */
export async function register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.post<ApiResponse<AuthResponseData>>(
        '/auth/register',
        payload,
    )

    if (!data.success || !data.data) {
        throw new Error(data.message ?? 'Registration failed')
    }

    // Persist user to localStorage for session restoration
    localStorage.setItem('sr_user', JSON.stringify(data.data.user))

    // Some backends return token in body; store if present
    if (data.data.token) {
        tokenStorage.set(data.data.token)
    }

    return data.data.user
}

// ── Login ─────────────────────────────────────────────────────────────────────

/**
 * Login a user and return the authenticated User.
 * Token is stored in localStorage if returned in body.
 * HttpOnly cookie is set automatically by the browser.
 */
export async function login(payload: LoginPayload): Promise<User> {
    const { data } = await api.post<ApiResponse<AuthResponseData>>(
        '/auth/login',
        payload,
    )

    if (!data.success || !data.data) {
        throw new Error(data.message ?? 'Login failed')
    }

    const { user, token } = data.data

    // Persist session
    localStorage.setItem('sr_user', JSON.stringify(user))
    if (token) tokenStorage.set(token)

    return user
}

// ── Logout ────────────────────────────────────────────────────────────────────

/**
 * Logout current user.
 * Clears the HttpOnly cookie on the server side.
 * Caller should clear local auth state (authStore.logout()).
 */
export async function logout(): Promise<void> {
    try {
        await api.post<ApiResponse>('/auth/logout')
    } finally {
        // Always clear local storage regardless of network result
        tokenStorage.clear()
        localStorage.removeItem('sr_user')
    }
}

// ── Get Current User ──────────────────────────────────────────────────────────

/**
 * Re-validate the current session and return fresh user data.
 * Called on app load (initializeAuth) to restore session.
 */
export async function getMe(): Promise<User> {
    const { data } = await api.get<ApiResponse<AuthResponseData>>('/auth/me')

    if (!data.success || !data.data) {
        throw new Error(data.message ?? 'Session invalid')
    }

    // Refresh localStorage with latest user data
    localStorage.setItem('sr_user', JSON.stringify(data.data.user))

    return data.data.user
}
