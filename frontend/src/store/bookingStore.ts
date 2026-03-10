/**
 * Booking Store — Service Radar
 * Ref: §State Management (Zustand), §Booking Endpoints, §Booking System
 *
 * Manages all booking state for both customers and providers:
 *
 *   - bookings:       full list for current user (customer → their bookings | provider → incoming)
 *   - currentBooking: detail for a specific booking (BookingDetails page)
 *   - isLoading:      true while list-level fetch is in flight
 *   - actionLoading:  true while a status update or create is in flight
 *   - error:          last error message
 *
 * Status flow:
 *   pending → accepted   (provider accepts)
 *   pending → cancelled  (customer or provider cancels)
 *   accepted → completed (provider marks complete)
 *   accepted → cancelled (provider cancels accepted)
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Booking, BookingStatus, CreateBookingPayload } from '@/types/models'
import * as bookingService from '@/services/bookingService'

// ── State + Actions Interface ─────────────────────────────────────────────────

interface BookingState {
    // State
    bookings: Booking[]
    currentBooking: Booking | null
    isLoading: boolean       // list fetch
    actionLoading: boolean   // create / status-update actions
    error: string | null

    // Actions
    fetchBookings: () => Promise<void>
    getBookingDetail: (id: string) => Promise<void>
    createBooking: (payload: CreateBookingPayload) => Promise<Booking>
    updateBookingStatus: (id: string, status: BookingStatus) => Promise<void>
    clearCurrentBooking: () => void
    clearBookings: () => void
    clearError: () => void
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useBookingStore = create<BookingState>()(
    devtools(
        (set, get) => ({
            // ── Initial state ────────────────────────────────────────────────────
            bookings: [],
            currentBooking: null,
            isLoading: false,
            actionLoading: false,
            error: null,

            // ── fetchBookings ────────────────────────────────────────────────────
            /**
             * Fetch all bookings for the authenticated user.
             * - Customer  → their own bookings
             * - Provider  → incoming bookings for their profile
             * The backend determines scope via the JWT.
             */
            fetchBookings: async () => {
                set({ isLoading: true, error: null }, false, 'bookings/fetch/start')
                try {
                    const bookings = await bookingService.getBookings()
                    set({ bookings, isLoading: false }, false, 'bookings/fetch/success')
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Failed to fetch bookings'
                    set({ error: message, isLoading: false }, false, 'bookings/fetch/error')
                    throw err
                }
            },

            // ── getBookingDetail ─────────────────────────────────────────────────
            /**
             * Fetch a single booking by ID.
             * First checks local bookings cache; falls back to network.
             */
            getBookingDetail: async (id) => {
                // Check local cache first to avoid redundant request
                const cached = get().bookings.find(b => b._id === id)
                if (cached) {
                    set({ currentBooking: cached }, false, 'bookings/detail/cache')
                    return
                }

                set(
                    { isLoading: true, error: null, currentBooking: null },
                    false,
                    'bookings/detail/start',
                )
                try {
                    const booking = await bookingService.getBookingById(id)
                    set(
                        { currentBooking: booking, isLoading: false },
                        false,
                        'bookings/detail/success',
                    )
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Booking not found'
                    set(
                        { error: message, isLoading: false },
                        false,
                        'bookings/detail/error',
                    )
                    throw err
                }
            },

            // ── createBooking ────────────────────────────────────────────────────
            /**
             * Create a new booking (customer role).
             * Prepends the new booking to the local list (optimistic update pattern).
             * Returns the created Booking for redirect logic.
             */
            createBooking: async (payload) => {
                set(
                    { actionLoading: true, error: null },
                    false,
                    'bookings/create/start',
                )
                try {
                    const booking = await bookingService.createBooking(payload)
                    set(
                        (state) => ({
                            bookings: [booking, ...state.bookings],
                            actionLoading: false,
                        }),
                        false,
                        'bookings/create/success',
                    )
                    return booking
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Failed to create booking'
                    set(
                        { error: message, actionLoading: false },
                        false,
                        'bookings/create/error',
                    )
                    throw err
                }
            },

            // ── updateBookingStatus ───────────────────────────────────────────────
            /**
             * Update booking status and reflect in both:
             *   - `bookings` list (in-place update)
             *   - `currentBooking` if it matches the updated ID
             */
            updateBookingStatus: async (id, status) => {
                set(
                    { actionLoading: true, error: null },
                    false,
                    `bookings/status/${status}/start`,
                )
                try {
                    const updated = await bookingService.updateBookingStatus(id, status)

                    set(
                        (state) => ({
                            // Replace the booking in the list
                            bookings: state.bookings.map(b =>
                                b._id === id ? updated : b,
                            ),
                            // Update detail view if open
                            currentBooking:
                                state.currentBooking?._id === id
                                    ? updated
                                    : state.currentBooking,
                            actionLoading: false,
                        }),
                        false,
                        `bookings/status/${status}/success`,
                    )
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Failed to update booking'
                    set(
                        { error: message, actionLoading: false },
                        false,
                        `bookings/status/${status}/error`,
                    )
                    throw err
                }
            },

            // ── clearCurrentBooking ───────────────────────────────────────────────
            clearCurrentBooking: () =>
                set({ currentBooking: null }, false, 'bookings/clearCurrentBooking'),

            // ── clearBookings ────────────────────────────────────────────────────
            /**
             * Clear all cached bookings (called on logout or auth reset)
             */
            clearBookings: () =>
                set(
                    { bookings: [], currentBooking: null, isLoading: false, actionLoading: false, error: null },
                    false,
                    'bookings/clearBookings',
                ),

            // ── clearError ───────────────────────────────────────────────────────
            clearError: () => set({ error: null }, false, 'bookings/clearError'),
        }),
        { name: 'BookingStore' },
    ),
)

// ── Derived Selectors ─────────────────────────────────────────────────────────

/** Filter bookings by status */
export const selectBookingsByStatus = (status: BookingStatus) =>
    (s: BookingState) => s.bookings.filter(b => b.status === status)

/** Count of pending bookings */
export const selectPendingCount = (s: BookingState) =>
    s.bookings.filter(b => b.status === 'pending').length

/** Count of completed bookings */
export const selectCompletedCount = (s: BookingState) =>
    s.bookings.filter(b => b.status === 'completed').length

/** Most recent N bookings sorted by creation date */
export const selectRecentBookings = (n: number) =>
    (s: BookingState) =>
        [...s.bookings]
            .sort((a, b) => {
                const dateA = new Date(a.createdAt ?? 0).getTime()
                const dateB = new Date(b.createdAt ?? 0).getTime()
                return dateB - dateA
            })
            .slice(0, n)
