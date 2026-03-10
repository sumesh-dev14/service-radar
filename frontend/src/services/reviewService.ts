/**
 * Review Service — Service Radar
 * Ref: §Review Endpoints
 *
 * Endpoints:
 *   POST /reviews              — submit review (customer, booking must be completed)
 *   GET  /providers/:id/reviews — get reviews for a provider (public)
 *
 * Note: getProviderReviews is co-located in providerService since it's a
 * provider sub-resource. This service handles the write side only.
 */

import api from './api'
import type {
    ApiResponse,
    CreateReviewPayload,
    Review,
    ReviewResponseData,
    ReviewsResponseData,
} from '@/types/models'

// ── Submit Review (customer, completed booking) ───────────────────────────────

/**
 * Submit a review for a completed booking.
 * @param payload - { bookingId, rating (1-5), comment }
 * @throws Error if booking is not completed, or review already exists
 */
export async function submitReview(
    payload: CreateReviewPayload,
): Promise<Review> {
    const { data } = await api.post<ApiResponse<ReviewResponseData>>(
        '/reviews',
        payload,
    )

    if (!data.success || !data.data) {
        throw new Error(data.message ?? 'Failed to submit review')
    }

    return data.data.review
}

// ── Get Provider Reviews (public) ─────────────────────────────────────────────

/**
 * Get all reviews + aggregate stats for a specific provider.
 * Re-exported here for convenience — primary location is providerService.ts
 */
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
// ── Alias for components that import createReview (ReviewForm) ────────────────
/**
 * Alias of submitReview — provided for backward compat with ReviewForm.tsx
 * which imports `createReview`. Functionally identical.
 */
export const createReview = submitReview
