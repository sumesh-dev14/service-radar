/**
 * useGeolocation — Service Radar
 * Ref: §Custom Hooks, §Navigation & Routes (/search)
 *
 * Uses the browser's navigator.geolocation API.
 * Returns the user's current coordinates for provider proximity search.
 *
 * Returns:
 *   location    — { lat, lng } once obtained, null otherwise
 *   isLoading   — true while waiting for geolocation response
 *   error       — human-readable error if geolocation is denied/unavailable
 *   getLocation — imperative trigger (call on button click)
 *   isSupported — false on environments that don't have geolocation API
 *
 * Usage:
 *   const { location, isLoading, error, getLocation } = useGeolocation()
 *   <button onClick={() => getLocation()}>Use My Location</button>
 */

import { useState, useCallback } from 'react'
import type { GeoLocation } from '@/types/models'

interface GeolocationState {
    location: GeoLocation | null
    isLoading: boolean
    error: string | null
    isSupported: boolean
}

export type GeolocationCallbacks = {
    /** Called when coordinates are successfully read (same tick as hook state update). */
    onSuccess?: (location: GeoLocation) => void
}

interface UseGeolocationReturn extends GeolocationState {
    getLocation: (callbacks?: GeolocationCallbacks) => void
    clearLocation: () => void
}

// Geolocation options — balance accuracy vs speed
const GEO_OPTIONS: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10_000,         // 10 seconds
    maximumAge: 5 * 60_000,  // cache position for 5 minutes
}

/** Convert GeolocationPositionError code to a user-friendly message */
function getErrorMessage(code: number): string {
    switch (code) {
        case GeolocationPositionError.PERMISSION_DENIED:
            return 'Location access denied. Please allow location access in your browser settings.'
        case GeolocationPositionError.POSITION_UNAVAILABLE:
            return 'Location information is unavailable. Please try again.'
        case GeolocationPositionError.TIMEOUT:
            return 'Location request timed out. Please check your connection and try again.'
        default:
            return 'An unknown error occurred while fetching your location.'
    }
}

export function useGeolocation(): UseGeolocationReturn {
    const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator

    const [state, setState] = useState<GeolocationState>({
        location: null,
        isLoading: false,
        error: null,
        isSupported,
    })

    // ── getLocation — imperative trigger ─────────────────────────────────────

    const getLocation = useCallback((callbacks?: GeolocationCallbacks) => {
        if (!isSupported) {
            setState(prev => ({
                ...prev,
                error: 'Geolocation is not supported by your browser.',
            }))
            return
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }))

        navigator.geolocation.getCurrentPosition(
            // Success
            (position: GeolocationPosition) => {
                const location: GeoLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                }
                setState({
                    location,
                    isLoading: false,
                    error: null,
                    isSupported: true,
                })
                callbacks?.onSuccess?.(location)
            },
            // Error
            (err: GeolocationPositionError) => {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: getErrorMessage(err.code),
                }))
            },
            GEO_OPTIONS,
        )
    }, [isSupported])

    // ── clearLocation — reset state ───────────────────────────────────────────

    const clearLocation = useCallback(() => {
        setState({
            location: null,
            isLoading: false,
            error: null,
            isSupported,
        })
    }, [isSupported])

    return {
        ...state,
        getLocation,
        clearLocation,
    }
}
