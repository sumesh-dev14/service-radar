import { create } from 'zustand';
import { User } from '../types/models';
import api from '../services/api';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'customer' | 'provider') => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  initialized: false,

  initializeAuth: () => {
    // Load user from localStorage on app startup
    const savedUser = localStorage.getItem('authUser');
    console.log('[Auth] Initializing... savedUser from localStorage:', savedUser ? 'found' : 'not found');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        console.log('[Auth] Restored user:', user.email, 'role:', user.role);
        set({ user, initialized: true });
      } catch (e) {
        console.error('[Auth] Failed to parse savedUser:', e);
        localStorage.removeItem('authUser');
        set({ initialized: true });
      }
    } else {
      console.log('[Auth] No saved user, starting fresh');
      set({ initialized: true });
    }
  },

  login: async (email: string, password: string) => {
    console.log('[Auth] Login attempt:', email);
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<any>('/auth/login', {
        email,
        password,
      });
      const { user } = response.data.data;
      console.log('[Auth] Login successful:', user.email, 'role:', user.role);
      // Save to localStorage
      localStorage.setItem('authUser', JSON.stringify(user));
      set({ user, isLoading: false });
      console.log('[Auth] User saved to localStorage and Zustand');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      console.error('[Auth] Login failed:', message);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  register: async (name: string, email: string, password: string, role: 'customer' | 'provider') => {
    console.log('[Auth] Register attempt:', email, 'role:', role);
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<any>('/auth/register', {
        name,
        email,
        password,
        role,
      });
      const { user } = response.data.data;
      console.log('[Auth] Register successful:', user.email, 'role:', user.role);
      // Save to localStorage
      localStorage.setItem('authUser', JSON.stringify(user));
      set({ user, isLoading: false });
      console.log('[Auth] User saved to localStorage and Zustand');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      console.error('[Auth] Register failed:', message);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      // Call logout endpoint to clear cookie on backend
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user state and localStorage
      localStorage.removeItem('authUser');
      set({ user: null });
    }
  },

  setUser: (user: User | null) => {
    if (user) {
      localStorage.setItem('authUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('authUser');
    }
    set({ user });
  },
}));
