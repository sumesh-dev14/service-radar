/**
 * Services barrel — import everything from '@/services'
 *
 * Usage:
 *   import { login, register }   from '@/services'
 *   import { getProviders }      from '@/services'
 *   import { createBooking }     from '@/services'
 *   import { submitReview }      from '@/services'
 *   import { getCategories }     from '@/services'
 */

export { default as api, tokenStorage } from './api'

export {
    register,
    login,
    logout,
    getMe,
} from './authService'

export {
    getProviders,
    getProviderById,
    getProviderReviews,
    createProviderProfile,
    updateProviderProfile,
    toggleAvailability,
} from './providerService'

export {
    createBooking,
    getBookings,
    getBookingById,
    updateBookingStatus,
} from './bookingService'

export {
    submitReview,
} from './reviewService'

export {
    getCategories,
    clearCategoryCache,
} from './categoryService'
