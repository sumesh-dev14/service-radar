import { create } from 'zustand';
import { Booking, CreateBookingInput } from '../types/models';
import api from '../services/api';

export interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;

  createBooking: (booking: CreateBookingInput) => Promise<Booking>;
  fetchMyBookings: () => Promise<void>;
  acceptBooking: (id: string) => Promise<void>;
  completeBooking: (id: string) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  isLoading: false,
  error: null,

  createBooking: async (booking: CreateBookingInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/bookings', booking);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create booking';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchMyBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/bookings/me');
      set({ bookings: response.data.data.bookings, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch bookings';
      set({ error: message, isLoading: false });
    }
  },

  acceptBooking: async (id: string) => {
    try {
      await api.patch(`/bookings/${id}/accept`);
      const response = await api.get('/bookings/me');
      set({ bookings: response.data.data.bookings });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to accept booking';
      set({ error: message });
      throw error;
    }
  },

  completeBooking: async (id: string) => {
    try {
      await api.patch(`/bookings/${id}/complete`);
      const response = await api.get('/bookings/me');
      set({ bookings: response.data.data.bookings });
    } catch (error) {
      throw error;
    }
  },

  cancelBooking: async (id: string) => {
    try {
      await api.patch(`/bookings/${id}/cancel`);
      const response = await api.get('/bookings/me');
      set({ bookings: response.data.data.bookings });
    } catch (error) {
      throw error;
    }
  },
}));
