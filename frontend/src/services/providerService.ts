/**
 * Provider Service — Service Radar
 * Ref: §Provider Endpoints
 *
 * Endpoints:
 *   GET   /providers                  — list / search providers (public)
 *   GET   /providers/:id              — single provider (public)
 *   GET   /providers/:id/reviews      — provider reviews + stats (public)
 *   POST  /providers/profile          — create profile (provider role)
 *   PUT   /providers/profile          — update profile (provider role)
 *   PATCH /providers/availability     — toggle availability (provider role)
 */

import api from './api'
import type {
    ApiResponse,
    AvailabilityResponseData,
    FilterOptions,
    ProfileResponseData,
    ProviderProfile,
    ProviderProfilePayload,
    ProviderResponseData,
    ProvidersResponseData,
    ReviewsResponseData,
} from '@/types/models'

// ── Get All Providers (public, filterable) ────────────────────────────────────

/**
 * Fetch providers list. Supports filtering by category, geolocation, limit.
 * Query params: ?category=&lat=&lng=&limit=
 */
export async function getProviders(
    filters: FilterOptions = {},
): Promise<ProviderProfile[]> {
    const params: Record<string, string | number> = {}

    if (filters.category) params.category = filters.category
    if (filters.lat !== undefined) params.lat = filters.lat
    if (filters.lng !== undefined) params.lng = filters.lng
    if (filters.limit !== undefined) params.limit = filters.limit
    if (filters.page !== undefined && filters.page > 1) params.page = filters.page

    const { data } = await api.get<ApiResponse<ProvidersResponseData>>(
        '/providers',
        { params },
    )

    if (!data.success || !data.data) {
        throw new Error(data.message ?? 'Failed to fetch providers')
    }

    return data.data.providers
}

// ── Get Provider by ID (public) ───────────────────────────────────────────────

export async function getProviderById(id: string): Promise<ProviderProfile> {
    const { data } = await api.get<ApiResponse<ProviderResponseData>>(
        `/providers/${id}`,
    )

    if (!data.success || !data.data) {
        throw new Error(data.message ?? 'Provider not found')
    }

    return data.data.provider
}

// ── Get Provider Reviews + Stats (public) ─────────────────────────────────────

export async function getProviderReviews(
    providerId: string,
): Promise<ReviewsResponseData> {
    const { data } = await api.get<ApiResponse<ReviewsResponseData>>(
        `/providers/${providerId}/reviews`,
    )

    if (!data.success || !data.data) {
        throw new Error(data.message ?? 'Failed to fetch reviews')
    }

    return data.data
}

// ── Get My Profile (provider role) ───────────────────────────────────────────

/**
 * Fetch the logged-in provider's own profile.
 * Calls GET /providers/profile (authenticated endpoint).
 * Returns null if the provider has not created a profile yet.
 */
export async function getMyProfile(): Promise<ProviderProfile | null> {
    try {
        const { data } = await api.get<ApiResponse<ProfileResponseData>>(
            '/providers/profile',
        )
        if (!data.success || !data.data) return null
        return data.data.profile
    } catch {
        // 404 = no profile yet; any other error → null (don't block the page)
        return null
    }
}

// ── Create Provider Profile (provider role) ───────────────────────────────────

export async function createProviderProfile(
    payload: ProviderProfilePayload,
): Promise<ProviderProfile> {
    const { data } = await api.post<ApiResponse<ProfileResponseData>>(
        '/providers/profile',
        payload,
    )

    if (!data.success || !data.data) {
        throw new Error(data.message ?? 'Failed to create profile')
    }

    return data.data.profile
}

// ── Update Provider Profile (provider role) ───────────────────────────────────

export async function updateProviderProfile(
    payload: Partial<ProviderProfilePayload>,
): Promise<ProviderProfile> {
    const { data } = await api.put<ApiResponse<ProfileResponseData>>(
        '/providers/profile',
        payload,
    )

    if (!data.success || !data.data) {
        throw new Error(data.message ?? 'Failed to update profile')
    }

    return data.data.profile
}

// ── Toggle Availability (provider role) ───────────────────────────────────────

/**
 * Toggles the provider's isAvailable flag on the server.
 * Returns the new availability boolean.
 */
export async function toggleAvailability(): Promise<boolean> {
    const { data } = await api.patch<ApiResponse<AvailabilityResponseData>>(
        '/providers/availability',
    )

    if (!data.success || !data.data) {
        throw new Error(data.message ?? 'Failed to update availability')
    }

    return data.data.isAvailable
}
