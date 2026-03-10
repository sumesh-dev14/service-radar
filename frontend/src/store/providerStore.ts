/**
 * Provider Store — Service Radar
 * Ref: §State Management (Zustand), §Provider Endpoints, §Provider Discovery
 *
 * Manages provider search, discovery, and profile state:
 *   - providers:        current search results (array of ProviderProfiles)
 *   - currentProvider: the detail view provider (single ProviderProfile)
 *   - filters:         active search filters (FilterOptions)
 *   - isLoading:       true while any async action is in flight
 *   - error:           last error message
 *
 * Provider profile management (for logged-in providers):
 *   - myProfile:       the current user's provider profile (null if not created yet)
 *   - profileLoading:  separate loading state for profile operations
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { FilterOptions, ProviderProfile } from '@/types/models'
import * as providerService from '@/services/providerService'

// ── State + Actions Interface ─────────────────────────────────────────────────

const PAGE_SIZE = 20

interface ProviderState {
    // Discovery / Search
    providers: ProviderProfile[]
    currentProvider: ProviderProfile | null
    filters: FilterOptions
    isLoading: boolean
    isLoadingMore: boolean   // 19.3 — for "Load more" button
    hasMore: boolean         // 19.3 — whether another page exists
    page: number             // 19.3 — current page (1-indexed)
    error: string | null

    // Provider's own profile (for /provider dashboard)
    myProfile: ProviderProfile | null
    profileLoading: boolean
    profileError: string | null

    // Actions — Discovery
    searchProviders: (filters?: FilterOptions) => Promise<void>
    loadMoreProviders: () => Promise<void>           // 19.3
    getProviderDetail: (id: string) => Promise<void>
    applyFilters: (filters: Partial<FilterOptions>) => Promise<void>
    resetFilters: () => void
    clearCurrentProvider: () => void

    // Actions — Profile management
    loadMyProfile: () => Promise<void>
    createMyProfile: (payload: Parameters<typeof providerService.createProviderProfile>[0]) => Promise<void>
    updateMyProfile: (payload: Parameters<typeof providerService.updateProviderProfile>[0]) => Promise<void>
    toggleMyAvailability: () => Promise<void>
    clearMyProfile: () => void

    clearError: () => void
}

// ── Default Filters ───────────────────────────────────────────────────────────

const DEFAULT_FILTERS: FilterOptions = {
    limit: 20,
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useProviderStore = create<ProviderState>()(
    devtools(
        (set, get) => ({
            // ── Initial state ────────────────────────────────────────────────────
            providers: [],
            currentProvider: null,
            filters: DEFAULT_FILTERS,
            isLoading: false,
            isLoadingMore: false,
            hasMore: false,
            page: 1,
            error: null,

            myProfile: null,
            profileLoading: false,
            profileError: null,

            // ── searchProviders ──────────────────────────────────────────────────
            /**
             * Fetch providers using the given filters.
             * If no filters passed → uses current store filters.
             */
            searchProviders: async (overrideFilters) => {
                const filters = overrideFilters ?? get().filters
                set({ isLoading: true, error: null, page: 1 }, false, 'providers/search/start')
                try {
                    const result = await providerService.getProviders({ ...filters, limit: PAGE_SIZE, page: 1 })
                    set(
                        {
                            providers: result,
                            isLoading: false,
                            hasMore: result.length === PAGE_SIZE,
                            page: 1,
                        },
                        false,
                        'providers/search/success',
                    )
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Search failed'
                    set(
                        { error: message, isLoading: false },
                        false,
                        'providers/search/error',
                    )
                    throw err
                }
            },

            // ── loadMoreProviders (19.3) ─────────────────────────────────────────
            /**
             * Append the next page of providers to the existing list.
             * Only callable when hasMore === true.
             */
            loadMoreProviders: async () => {
                const { filters, page, isLoadingMore, hasMore } = get()
                if (isLoadingMore || !hasMore) return
                const nextPage = page + 1
                set({ isLoadingMore: true }, false, 'providers/loadMore/start')
                try {
                    const result = await providerService.getProviders({ ...filters, limit: PAGE_SIZE, page: nextPage })
                    set(
                        s => ({
                            providers: [...s.providers, ...result],
                            isLoadingMore: false,
                            hasMore: result.length === PAGE_SIZE,
                            page: nextPage,
                        }),
                        false,
                        'providers/loadMore/success',
                    )
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Failed to load more'
                    set(
                        { error: message, isLoadingMore: false },
                        false,
                        'providers/loadMore/error',
                    )
                }
            },

            // ── getProviderDetail ────────────────────────────────────────────────
            /**
             * Fetch a single provider by ID for the detail page.
             * Sets currentProvider in store.
             */
            getProviderDetail: async (id) => {
                set(
                    { isLoading: true, error: null, currentProvider: null },
                    false,
                    'providers/detail/start',
                )
                try {
                    const provider = await providerService.getProviderById(id)
                    set(
                        { currentProvider: provider, isLoading: false },
                        false,
                        'providers/detail/success',
                    )
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Failed to load provider'
                    set(
                        { error: message, isLoading: false },
                        false,
                        'providers/detail/error',
                    )
                    throw err
                }
            },

            // ── applyFilters ─────────────────────────────────────────────────────
            /**
             * Merge new filters into existing, then re-fetch providers.
             * Used by filter sidebar (debounced) and URL param sync.
             */
            applyFilters: async (newFilters) => {
                const merged: FilterOptions = { ...get().filters, ...newFilters }
                set({ filters: merged }, false, 'providers/applyFilters')
                await get().searchProviders(merged)
            },

            // ── resetFilters ─────────────────────────────────────────────────────
            resetFilters: () => {
                set(
                    { filters: DEFAULT_FILTERS },
                    false,
                    'providers/resetFilters',
                )
            },

            // ── clearCurrentProvider ─────────────────────────────────────────────
            clearCurrentProvider: () =>
                set({ currentProvider: null }, false, 'providers/clearCurrentProvider'),

            // ── loadMyProfile ─────────────────────────────────────────────────────
            /**
             * Load the logged-in provider's own profile from GET /providers/profile.
             * Called on Provider Dashboard and Profile page mount so myProfile
             * is populated even after a full page refresh.
             * Returns null (not throws) if no profile exists yet.
             * Force flag bypasses the cache check and always fetches fresh data.
             */
            loadMyProfile: async (force = false) => {
                // Skip if already loaded (unless force flag is set)
                if (get().myProfile && !force) return
                set({ profileLoading: true, profileError: null }, false, 'providers/profileLoad/start')
                try {
                    const profile = await providerService.getMyProfile()
                    set(
                        { myProfile: profile, profileLoading: false },
                        false,
                        'providers/profileLoad/done',
                    )
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Failed to load profile'
                    set(
                        { profileError: message, profileLoading: false },
                        false,
                        'providers/profileLoad/error',
                    )
                }
            },

            // ── createMyProfile ───────────────────────────────────────────────────
            createMyProfile: async (payload) => {
                set({ profileLoading: true, profileError: null }, false, 'providers/profileCreate/start')
                try {
                    const profile = await providerService.createProviderProfile(payload)
                    set(
                        { myProfile: profile, profileLoading: false },
                        false,
                        'providers/profileCreate/success',
                    )
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Failed to create profile'
                    set(
                        { profileError: message, profileLoading: false },
                        false,
                        'providers/profileCreate/error',
                    )
                    throw err
                }
            },

            // ── updateMyProfile ───────────────────────────────────────────────────
            updateMyProfile: async (payload) => {
                set({ profileLoading: true, profileError: null }, false, 'providers/profileUpdate/start')
                try {
                    const profile = await providerService.updateProviderProfile(payload)
                    set(
                        { myProfile: profile, profileLoading: false },
                        false,
                        'providers/profileUpdate/success',
                    )
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Failed to update profile'
                    set(
                        { profileError: message, profileLoading: false },
                        false,
                        'providers/profileUpdate/error',
                    )
                    throw err
                }
            },

            // ── toggleMyAvailability ──────────────────────────────────────────────
            toggleMyAvailability: async () => {
                const current = get().myProfile
                set({ profileLoading: true }, false, 'providers/toggleAvailability/start')
                try {
                    const isAvailable = await providerService.toggleAvailability()
                    const updated: ProviderProfile | null = current
                        ? { ...current, isAvailable }
                        : null
                    set(
                        { myProfile: updated, profileLoading: false },
                        false,
                        'providers/toggleAvailability/success',
                    )
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Failed to toggle availability'
                    set(
                        { profileError: message, profileLoading: false },
                        false,
                        'providers/toggleAvailability/error',
                    )
                    throw err
                }
            },

            // ── clearMyProfile ───────────────────────────────────────────────────
            /**
             * Clear the cached provider profile (called on logout or auth reset)
             */
            clearMyProfile: () => {
                set(
                    { myProfile: null, profileLoading: false, profileError: null },
                    false,
                    'providers/clearMyProfile',
                )
            },

            // ── clearError ───────────────────────────────────────────────────────
            clearError: () => set({ error: null, profileError: null }, false, 'providers/clearError'),
        }),
        { name: 'ProviderStore' },
    ),
)

// ── Derived Selectors ─────────────────────────────────────────────────────────

export const selectProviderById = (id: string) => (s: ProviderState) =>
    s.providers.find(p => p._id === id) ?? null

export const selectAvailableProviders = (s: ProviderState) =>
    s.providers.filter(p => p.isAvailable)
