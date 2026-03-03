import { create } from 'zustand';
import { ProviderProfile, Category } from '../types/models';
import api from '../services/api';

export interface ProviderState {
  providers: ProviderProfile[];
  categories: Category[];
  selectedProvider: ProviderProfile | null;
  isLoading: boolean;
  error: string | null;

  fetchProviders: (categoryId: string, lat?: number, lng?: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  getProviderById: (id: string) => Promise<ProviderProfile>;
}

export const useProviderStore = create<ProviderState>((set) => ({
  providers: [],
  categories: [],
  selectedProvider: null,
  isLoading: false,
  error: null,

  fetchProviders: async (categoryId: string, lat?: number, lng?: number) => {
    set({ isLoading: true, error: null });
    try {
      const params: any = {
        category: categoryId,
        limit: 20,
      };
      if (lat) params.lat = lat;
      if (lng) params.lng = lng;

      const response = await api.get('/providers', { params });
      set({ providers: response.data.data.providers, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch providers';
      set({ error: message, isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const response = await api.get('/categories');
      set({ categories: response.data.data.categories });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch categories';
      set({ error: message });
    }
  },

  getProviderById: async (id: string) => {
    try {
      const response = await api.get(`/providers/${id}`);
      return response.data.data.provider;
    } catch (error) {
      throw error;
    }
  },
}));
