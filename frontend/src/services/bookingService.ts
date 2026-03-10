/**
 * Booking Service — Service Radar
 * Ref: §Booking Endpoints
 *
 * Endpoints:
 *   POST  /bookings              — create booking (customer role)
 *   GET   /bookings              — get user's bookings (auth required)
 *   GET   /bookings/:id          — get booking detail (auth required)
 *   PATCH /bookings/:id/status   — update status (auth required)
 *
 * Status flow:
 *   pending → accepted   (provider accepts)
 *   pending → cancelled  (customer cancels)
 *   accepted → completed (provider marks complete)
 *   accepted → cancelled (either can cancel)
 */

import api from './api'
import type {
    ApiResponse,
    Booking,
    BookingResponseData,
    BookingsResponseData,
    BookingStatus,
    CreateBookingPayload,
} from '@/types/models'

// ── Create Booking (customer role) ────────────────────────────────────────────

/**
 * Book a provider service.
 * @param payload - { providerId, categoryId, scheduledAt (ISO string) }
 */
export async function createBooking(
    payload: CreateBookingPayload,
): Promise<Booking> {
    const { data } = await api.post<ApiResponse<BookingResponseData>>(
        '/bookings',
        payload,
    )

    if (!data.success || !data.data) {
        throw new Error(data.message ?? 'Failed to create booking')
    }

    return data.data.booking
}

// ── Get User Bookings (auth required) ────────────────────────────────────────

/**
 * Fetch all bookings for the current user.
 * If the user is a customer → returns bookings they made.
 * If the user is a provider → returns incoming bookings for their profile.
 */
export async function getBookings(): Promise<Booking[]> {
    const { data } = await api.get<ApiResponse<BookingsResponseData>>('/bookings')

    if (!data.success || !data.data) {
        throw new Error(data.message ?? 'Failed to fetch bookings')
    }

    return data.data.bookings
}

// ── Get Booking by ID (auth required) ─────────────────────────────────────────

export async function getBookingById(id: string): Promise<Booking> {
    const { data } = await api.get<ApiResponse<BookingResponseData>>(
        `/bookings/${id}`,
    )

    if (!data.success || !data.data) {
        throw new Error(data.message ?? 'Booking not found')
    }

    // Backend may return data.data directly OR data.data.booking
    const booking =
        (data.data as BookingResponseData).booking ??
        (data.data as unknown as Booking)

    return booking
}

// ── Update Booking Status (auth required) ─────────────────────────────────────

/**
 * Update the status of a booking.
 * Customers can cancel pending bookings.
 * Providers can accept, complete, or cancel bookings.
 */
export async function updateBookingStatus(
    id: string,
    status: BookingStatus,
): Promise<Booking> {
    const { data } = await api.patch<ApiResponse<BookingResponseData>>(
        `/bookings/${id}/status`,
        { status },
    )

    if (!data.success || !data.data) {
        throw new Error(data.message ?? 'Failed to update booking status')
    }

    const booking =
        (data.data as BookingResponseData).booking ??
        (data.data as unknown as Booking)

    return booking
}
