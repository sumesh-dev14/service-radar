/**
 * Service Radar — Frontend TypeScript Types
 * Reference: PROJECT_DOCUMENTATION.md
 * §Database Design, §API Documentation, §State Management
 */

// ─── Core Enums ──────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'provider'

export type BookingStatus = 'pending' | 'accepted' | 'completed' | 'cancelled'

// ─── Domain Models ───────────────────────────────────────────────────────────

/**
 * User — matches /api/auth endpoints
 * §Users Collection
 */
export interface User {
    id: string
    name: string
    email: string
    role: UserRole
}

/**
 * Location — embedded in ProviderProfile
 * Used for geospatial search (Haversine distance)
 */
export interface Location {
    lat: number
    lng: number
}

/**
 * Category — matches /api/categories endpoint
 * §Categories Collection
 */
export interface Category {
    _id: string
    name: string
    description: string
    createdAt?: string
    updatedAt?: string
}

/**
 * ProviderProfile — matches /api/providers endpoint
 * §ProviderProfiles Collection
 * Note: userId and categoryId are populated objects in GET responses
 */
export interface ProviderProfile {
    _id: string
    userId: PopulatedUser | string    // populated in GET, string in POST/PUT
    categoryId: PopulatedCategory | string  // populated in GET, string in POST/PUT
    bio: string
    price: number                     // hourly rate in dollars
    rating: number                    // average rating 0-5
    totalReviews: number
    isAvailable: boolean
    location: Location
    distance?: number                 // computed field (km), returned when lat/lng provided
    createdAt?: string
    updatedAt?: string
}

/**
 * Populated sub-objects returned from GET /api/providers
 * The API populates these from User and Category documents
 */
export interface PopulatedUser {
    _id: string
    name: string
    email: string
}

export interface PopulatedCategory {
    _id: string
    name: string
    description?: string
}

/**
 * Booking — matches /api/bookings endpoints
 * §Bookings Collection
 * Status flow: pending → accepted → completed | cancelled
 */
export interface Booking {
    _id: string
    customerId: PopulatedUser | string   // populated in GET detail view
    providerId: ProviderProfile | string // populated in GET detail view
    categoryId: PopulatedCategory | string
    status: BookingStatus
    scheduledDate: string                // ISO date string (maps to scheduledAt in POST body)
    createdAt?: string
    updatedAt?: string
}

/**
 * Review — matches /api/reviews endpoints
 * §Reviews Collection
 */
export interface Review {
    _id: string
    bookingId: string
    customerId: PopulatedUser | string  // populated in GET provider reviews
    providerId: string
    rating: number                      // 1-5 stars
    comment: string
    createdAt: string
    updatedAt?: string
}

/**
 * Review statistics returned with provider reviews
 * GET /api/providers/:id/reviews → data.stats
 */
export interface ReviewStats {
    count: number
    providerRating: number
    totalReviews: number
}

// ─── API Request Payloads ─────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 */
export interface RegisterPayload {
    name: string
    email: string
    password: string
    role: UserRole
}

/**
 * POST /api/auth/login
 */
export interface LoginPayload {
    email: string
    password: string
}

/**
 * POST /api/providers/profile (create)
 * PUT  /api/providers/profile (update — all fields optional)
 */
export interface ProviderProfilePayload {
    categoryId?: string
    bio?: string
    price?: number
    location?: Location
}

/**
 * POST /api/bookings
 */
export interface CreateBookingPayload {
    providerId: string
    categoryId: string
    scheduledAt: string  // ISO date string
}

/**
 * PATCH /api/bookings/:id/status
 */
export interface UpdateBookingStatusPayload {
    status: BookingStatus
}

/**
 * POST /api/reviews
 */
export interface CreateReviewPayload {
    bookingId: string
    rating: number    // 1-5
    comment: string
}

// ─── API Response Wrapper ─────────────────────────────────────────────────────

/**
 * Generic API response shape
 * All backend responses follow this structure
 * §Response Format
 */
export interface ApiResponse<T = unknown> {
    success: boolean
    message: string
    data?: T
    error?: string
}

// ─── Specific API Response Data Shapes ───────────────────────────────────────

export interface AuthResponseData {
    user: User
    token?: string  // JWT token (may also be set as HttpOnly cookie)
}

export interface ProvidersResponseData {
    providers: ProviderProfile[]
}

export interface ProviderResponseData {
    provider: ProviderProfile
}

export interface BookingsResponseData {
    bookings: Booking[]
}

export interface BookingResponseData {
    booking: Booking
}

export interface ReviewsResponseData {
    reviews: Review[]
    stats: ReviewStats
}

export interface ReviewResponseData {
    review: Review
}

export interface CategoriesResponseData {
    categories: Category[]
}

export interface ProfileResponseData {
    profile: ProviderProfile
}

export interface AvailabilityResponseData {
    isAvailable: boolean
}

// ─── Store / UI State Types ───────────────────────────────────────────────────

/**
 * Filter options for provider search
 * Maps to query params: GET /api/providers?category=&lat=&lng=&limit=
 */
export interface FilterOptions {
    category?: string    // category _id
    lat?: number
    lng?: number
    minPrice?: number
    maxPrice?: number
    minRating?: number
    limit?: number
    page?: number        // 19.3 — for paginated provider search
}

/**
 * Geolocation state from useGeolocation hook
 */
export interface GeoLocation {
    lat: number
    lng: number
}

/**
 * Toast notification type
 * Used by the global notification system
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
    id: string
    type: ToastType
    message: string
    duration?: number  // ms, default 4000
}

/**
 * Auth initialization state
 * Tracks whether the auth store has read from localStorage
 */
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

// ─── UI Helper Types ──────────────────────────────────────────────────────────

/**
 * Step in a multi-step form (e.g. BookingForm)
 */
export interface FormStep {
    id: number
    label: string
    isCompleted: boolean
}

/**
 * Generic async operation state
 */
export interface AsyncState {
    isLoading: boolean
    error: string | null
}

// ─── Type Guards ──────────────────────────────────────────────────────────────

/**
 * Check if userId field in ProviderProfile is populated
 */
export function isPopulatedUser(
    value: PopulatedUser | string
): value is PopulatedUser {
    return typeof value === 'object' && value !== null && '_id' in value
}

/**
 * Check if categoryId field is populated
 */
export function isPopulatedCategory(
    value: PopulatedCategory | string
): value is PopulatedCategory {
    return typeof value === 'object' && value !== null && '_id' in value
}

/**
 * Check if a booking's customerId is populated
 */
export function isPopulatedBookingUser(
    value: PopulatedUser | string
): value is PopulatedUser {
    return typeof value === 'object' && value !== null && 'name' in value
}

/**
 * Check if a booking's providerId is a full ProviderProfile
 */
export function isPopulatedProvider(
    value: ProviderProfile | string
): value is ProviderProfile {
    return typeof value === 'object' && value !== null && 'bio' in value
}

// ─── Utility Types ────────────────────────────────────────────────────────────

/** Make specific keys optional */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/** Make specific keys required */
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>

/** API pagination meta */
export interface PaginationMeta {
    page: number
    limit: number
    total: number
    hasMore: boolean
}
