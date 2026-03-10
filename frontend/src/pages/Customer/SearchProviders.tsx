/**
 * SearchProviders — Service Radar
 * Ref: §Navigation & Routes (/search), §Provider Endpoints, §Provider Discovery
 * Phase 14
 *
 * Real implementation:
 *   - Reads `?category=` from URL on mount to pre-fill filter (set by Home category tiles)
 *   - Filter sidebar: category dropdown, max price slider, min rating slider
 *   - Geolocation button → uses useGeolocation hook → sends lat/lng to API
 *   - Debounced (500ms) filter change → GET /api/providers?category=&lat=&lng=
 *   - Results rendered in ProviderList (skeletons while loading)
 *   - URL query params kept in sync with active filters
 */

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Loader2, X, SlidersHorizontal, LocateFixed } from 'lucide-react'
import { useProviderStore } from '@/store/providerStore'
import { ProviderList } from '@/components/Provider'
import { getCategories } from '@/services/categoryService'
import { useDebounce } from '@/hooks/useDebounce'
import { useGeolocation } from '@/hooks/useGeolocation'
import type { Category } from '@/types/models'

// ── Filter sidebar ────────────────────────────────────────────────────────────

interface FilterState {
    category: string      // categoryId or ''
    maxPrice: number      // 0 = no limit
    minRating: number     // 0 = no filter
}

const DEFAULT_FILTERS: FilterState = { category: '', maxPrice: 0, minRating: 0 }

export default function SearchProviders() {
    const [searchParams, setSearchParams] = useSearchParams()
    const { providers, isLoading, applyFilters, resetFilters } = useProviderStore()
    const { location, isLoading: geoLoading, error: geoError, getLocation, clearLocation } = useGeolocation()

    const [categories, setCategories] = useState<Category[]>([])
    const [filters, setFilters] = useState<FilterState>({
        ...DEFAULT_FILTERS,
        category: searchParams.get('category') ?? '',
    })
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const debouncedFilters = useDebounce(filters, 500)

    // Load categories once
    useEffect(() => {
        getCategories().then(setCategories).catch(() => { })
    }, [])

    // Sync filters → URL params
    useEffect(() => {
        const params: Record<string, string> = {}
        if (debouncedFilters.category) params.category = debouncedFilters.category
        if (debouncedFilters.maxPrice > 0) params.maxPrice = String(debouncedFilters.maxPrice)
        if (debouncedFilters.minRating > 0) params.minRating = String(debouncedFilters.minRating)
        setSearchParams(params, { replace: true })
    }, [debouncedFilters, setSearchParams])

    // Trigger API call when debounced filters or location changes
    useEffect(() => {
        const apiFilters: Parameters<typeof applyFilters>[0] = { limit: 20 }
        if (debouncedFilters.category) apiFilters.category = debouncedFilters.category
        if (location) { apiFilters.lat = location.lat; apiFilters.lng = location.lng }
        applyFilters(apiFilters)
    }, [debouncedFilters, location, applyFilters])

    const setFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }, [])

    const handleReset = () => {
        setFilters(DEFAULT_FILTERS)
        clearLocation()
        resetFilters()
    }

    const hasActiveFilters = filters.category !== '' || filters.maxPrice > 0 || filters.minRating > 0 || !!location

    const selectedCategoryName = categories.find(c => c._id === filters.category)?.name ?? 'All Categories'

    return (
        <main style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-fg)', paddingTop: '1rem' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem' }}>

                {/* ── Page header ───────────────────────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                        <h1 style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '1.75rem', color: 'var(--color-fg)' }}>
                            Find Providers
                        </h1>
                        <p style={{ margin: '0.25rem 0 0', fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                            {isLoading ? 'Searching…' : `${providers.length} provider${providers.length !== 1 ? 's' : ''} found`}
                            {location && <span style={{ color: 'var(--color-primary)', marginLeft: '0.5rem' }}>· Near you</span>}
                            {filters.category && <span style={{ color: 'var(--color-primary)', marginLeft: '0.5rem' }}>· {selectedCategoryName}</span>}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                        {hasActiveFilters && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={handleReset}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.425rem 0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'none', color: 'var(--color-muted)', fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', cursor: 'pointer' }}
                            >
                                <X size={13} /> Clear filters
                            </motion.button>
                        )}
                        <button
                            onClick={() => setSidebarOpen(s => !s)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: sidebarOpen ? 'var(--color-primary)15' : 'none', color: sidebarOpen ? 'var(--color-primary)' : 'var(--color-fg)', fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
                            aria-label="Toggle filter sidebar"
                        >
                            <SlidersHorizontal size={15} /> Filters
                        </button>
                    </div>
                </div>

                {/* ── Layout: Sidebar + Results ──────────────────────────────────── */}
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

                    {/* Sidebar */}
                    <AnimatePresence initial={false}>
                        {sidebarOpen && (
                            <motion.aside
                                key="sidebar"
                                initial={{ opacity: 0, width: 0, x: -20 }}
                                animate={{ opacity: 1, width: 260, x: 0 }}
                                exit={{ opacity: 0, width: 0, x: -20 }}
                                transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                                style={{ flexShrink: 0, overflow: 'hidden' }}
                                aria-label="Provider search filters"
                            >
                                <div style={{ width: 260, background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                                    {/* Category */}
                                    <div>
                                        <label htmlFor="filter-category" style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-fg)', marginBottom: '0.5rem' }}>
                                            Category
                                        </label>
                                        <select
                                            id="filter-category"
                                            value={filters.category}
                                            onChange={e => setFilter('category', e.target.value)}
                                            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-fg)', fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', outline: 'none', cursor: 'pointer' }}
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map(c => (
                                                <option key={c._id} value={c._id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Max price */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <label htmlFor="filter-price" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-fg)' }}>
                                                Max Hourly Rate
                                            </label>
                                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                                                {filters.maxPrice === 0 ? 'Any' : `$${filters.maxPrice}/hr`}
                                            </span>
                                        </div>
                                        <input
                                            id="filter-price"
                                            type="range"
                                            min={0}
                                            max={300}
                                            step={10}
                                            value={filters.maxPrice}
                                            onChange={e => setFilter('maxPrice', Number(e.target.value))}
                                            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                                            aria-label={`Max rate: ${filters.maxPrice === 0 ? 'Any' : `$${filters.maxPrice}/hr`}`}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Poppins, sans-serif', fontSize: '0.6875rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>
                                            <span>Any</span><span>$300/hr</span>
                                        </div>
                                    </div>

                                    {/* Min rating */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <label htmlFor="filter-rating" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-fg)' }}>
                                                Min Rating
                                            </label>
                                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                                                {filters.minRating === 0 ? 'Any' : `${filters.minRating}★+`}
                                            </span>
                                        </div>
                                        <input
                                            id="filter-rating"
                                            type="range"
                                            min={0}
                                            max={5}
                                            step={0.5}
                                            value={filters.minRating}
                                            onChange={e => setFilter('minRating', Number(e.target.value))}
                                            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                                            aria-label={`Min rating: ${filters.minRating === 0 ? 'Any' : `${filters.minRating} stars and above`}`}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Poppins, sans-serif', fontSize: '0.6875rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>
                                            <span>Any</span><span>5★</span>
                                        </div>
                                    </div>

                                    {/* Geolocation */}
                                    <div>
                                        <p style={{ margin: '0 0 0.5rem', fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-fg)' }}>
                                            Location
                                        </p>
                                        {location ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.75rem', background: 'var(--color-primary)12', border: '1px solid var(--color-primary)25', borderRadius: 'var(--radius-md)' }}>
                                                    <MapPin size={13} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 500 }}>
                                                        Location active
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={clearLocation}
                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', padding: '0.4rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'none', color: 'var(--color-muted)', fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', cursor: 'pointer' }}
                                                >
                                                    <X size={12} /> Clear location
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <motion.button
                                                    onClick={getLocation}
                                                    disabled={geoLoading}
                                                    whileHover={geoLoading ? {} : { scale: 1.02 }}
                                                    whileTap={geoLoading ? {} : { scale: 0.97 }}
                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem 0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary)', background: 'var(--color-primary)10', color: 'var(--color-primary)', fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', fontWeight: 500, cursor: geoLoading ? 'wait' : 'pointer' }}
                                                    aria-label="Use my current location"
                                                >
                                                    {geoLoading
                                                        ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Locating…</>
                                                        : <><LocateFixed size={13} /> Use My Location</>
                                                    }
                                                </motion.button>
                                                {geoError && (
                                                    <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.6875rem', color: 'var(--color-error)', lineHeight: 1.4 }}>
                                                        {geoError}
                                                    </p>
                                                )}
                                                <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.6875rem', color: 'var(--color-muted)', lineHeight: 1.45 }}>
                                                    Sort results by distance from you
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.aside>
                        )}
                    </AnimatePresence>

                    {/* Results */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <ProviderList
                            providers={providers}
                            isLoading={isLoading}
                            skeletonCount={6}
                            emptyMessage={
                                hasActiveFilters
                                    ? 'No providers match these filters. Try adjusting your search criteria.'
                                    : 'No providers have registered yet.'
                            }
                        />
                    </div>
                </div>
            </div>
        </main>
    )
}
