/**
 * useToast — Service Radar
 * Ref: §UI/UX Design Patterns, §Notifications
 *
 * Global toast notification manager.
 * Components call useToast() to show success/error/warning/info messages.
 *
 * Toasts auto-dismiss after `duration` ms (default 4000ms).
 * Supports stacking up to MAX_TOASTS at a time.
 *
 * Usage:
 *   const { toasts, showToast, dismissToast } = useToast()
 *   showToast('success', 'Booking confirmed!')
 *   showToast('error', 'Something went wrong', 6000)
 */

import { useState, useCallback } from 'react'
import type { Toast, ToastType } from '@/types/models'

const MAX_TOASTS = 5

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([])

    // ── showToast ─────────────────────────────────────────────────────────────

    const showToast = useCallback(
        (type: ToastType, message: string, duration = 4000) => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
            const toast: Toast = { id, type, message, duration }

            setToasts(prev => {
                // Enforce max stack — drop oldest if at limit
                const next = prev.length >= MAX_TOASTS ? prev.slice(1) : prev
                return [...next, toast]
            })

            // Auto-dismiss
            setTimeout(() => {
                dismissToast(id)
            }, duration)
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    )

    // ── dismissToast ──────────────────────────────────────────────────────────

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    // ── Convenience methods ───────────────────────────────────────────────────

    const success = useCallback(
        (message: string, duration?: number) => showToast('success', message, duration),
        [showToast],
    )

    const error = useCallback(
        (message: string, duration?: number) => showToast('error', message, duration),
        [showToast],
    )

    const warning = useCallback(
        (message: string, duration?: number) => showToast('warning', message, duration),
        [showToast],
    )

    const info = useCallback(
        (message: string, duration?: number) => showToast('info', message, duration),
        [showToast],
    )

    return {
        toasts,
        showToast,
        dismissToast,
        success,
        error,
        warning,
        info,
    }
}
