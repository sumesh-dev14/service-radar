/**
 * useDebounce — Service Radar
 * Ref: §Performance Optimization, §SearchProviders (300ms debounce on filter change)
 *
 * Returns a debounced copy of `value` that only updates after `delay` ms
 * of inactivity. Used by the search/filter sidebar to avoid firing an API
 * call on every keystroke.
 *
 * Usage:
 *   const debouncedQuery = useDebounce(searchQuery, 300)
 *   useEffect(() => { store.searchProviders({ query: debouncedQuery }) }, [debouncedQuery])
 */

import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        // Clean up: cancel the timer if value changes before delay elapses
        return () => clearTimeout(timer)
    }, [value, delay])

    return debouncedValue
}
