/**
 * Store barrel — import everything from '@/store'
 *
 * Usage:
 *   import { useAuthStore, selectIsAuthenticated }    from '@/store'
 *   import { useProviderStore, selectAvailableProviders } from '@/store'
 *   import { useBookingStore, selectPendingCount }    from '@/store'
 */

// Auth
export {
    useAuthStore,
    selectIsAuthenticated,
    selectAuthLoading,
    selectUserRole,
} from './authStore'

// Provider
export {
    useProviderStore,
    selectProviderById,
    selectAvailableProviders,
} from './providerStore'

// Booking
export {
    useBookingStore,
    selectBookingsByStatus,
    selectPendingCount,
    selectCompletedCount,
    selectRecentBookings,
} from './bookingStore'
