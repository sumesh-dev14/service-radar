/**
 * Service Radar — Axios API Client
 * §API Documentation, §Authentication Flow
 *
 * - Base URL from VITE_API_URL env variable
 * - Sends JWT via Authorization header (from localStorage)
 * - withCredentials: true for HttpOnly cookie support
 * - Request interceptor: auto-attach token
 * - Response interceptor: global 401 handler → clears auth + redirects to /login
 */

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

// ── Constants ─────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
const TOKEN_KEY = 'sr_token'

// ── Token helpers (used by authService + store) ───────────────────────────────

export const tokenStorage = {
    get: (): string | null => localStorage.getItem(TOKEN_KEY),
    set: (token: string): void => { localStorage.setItem(TOKEN_KEY, token) },
    clear: (): void => { localStorage.removeItem(TOKEN_KEY) },
}

// ── Axios Instance ────────────────────────────────────────────────────────────

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,         // send/receive HttpOnly cookies
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15_000,               // 15 s timeout
})

// ── Request Interceptor — attach Bearer token ─────────────────────────────────

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenStorage.get()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error: AxiosError) => Promise.reject(error),
)

// ── Response Interceptor — global error handling ──────────────────────────────

api.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired / invalid — clear auth state and redirect to login
            tokenStorage.clear()
            localStorage.removeItem('sr_user')
            // Navigate without react-router (works outside component tree)
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    },
)

export default api
