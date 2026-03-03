/**
 * FRONTEND-READY TypeScript Models
 * Use these interfaces in your frontend application
 * Import from: backend/src/types/models.ts
 */

// ============ USER ============
export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "provider";
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// ============ CATEGORY ============
export interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============ PROVIDER PROFILE ============
export interface Location {
  lat: number;
  lng: number;
}

export interface ProviderProfile {
  _id: string;
  userId: string | { _id?: string; name?: string; email?: string };
  categoryId: string | { _id?: string; name?: string };
  bio: string;
  price: number;
  rating: number;
  totalReviews: number;
  isAvailable: boolean;
  location: Location;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProviderProfileInput {
  categoryId: string;
  bio: string;
  price: number;
  location: Location;
}

// ============ BOOKING ============
export type BookingStatus = "pending" | "accepted" | "completed" | "cancelled";

export interface Booking {
  _id: string;
  customerId: string | { _id?: string; name?: string; email?: string };
  providerId: string | ProviderProfile;
  categoryId?: string | Category;
  status: BookingStatus;
  scheduledDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookingInput {
  providerId: string;
  categoryId?: string;
  scheduledAt: string;
}

// ============ REVIEW ============
export interface Review {
  _id: string;
  bookingId: string;
  customerId: string | { _id?: string; name?: string; email?: string };
  providerId: string;
  rating: number;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReviewInput {
  bookingId: string;
  rating: number;
  comment: string;
}

export interface ReviewStats {
  count: number;
  providerRating: number;
  totalReviews: number;
  reviews: Review[];
}

// ============ API RESPONSE WRAPPER ============
export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
}

// ============ PAGINATED RESPONSE ============
export interface PaginatedResponse<T> {
  count: number;
  items: T[];
}

// ============ COMMON ============
export interface AuthToken {
  token: string;
  expiresIn: string;
}

export interface RankedProvider {
  id: string;
  score: number;
}
