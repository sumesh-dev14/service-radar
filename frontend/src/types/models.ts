// Types from Backend - Keep in sync
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

export interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

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

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
}
