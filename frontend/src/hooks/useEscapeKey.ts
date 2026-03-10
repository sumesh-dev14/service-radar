/**
 * useEscapeKey — Service Radar
 * Ref: §Accessibility Requirements (keyboard navigation, Escape key), Phase 18
 *
 * Fires `handler` whenever the user presses the Escape key.
 * Used to close modals, drawers, dropdowns, and any overlay.
 *
 * Convention:
 *   - Pass `enabled = false` to temporarily disable (e.g. during loading)
 *   - Multiple listeners stack correctly — innermost should call event.stopPropagation()
 *     if you want to prevent parent overlays from also closing.
 *
 * Usage:
 *   useEscapeKey(() => setOpen(false), isOpen)
 */

import { useEffect } from 'react'

export function useEscapeKey(handler: () => void, enabled = true): void {
    useEffect(() => {
        if (!enabled) return

        const listener = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handler()
            }
        }

        document.addEventListener('keydown', listener)
        return () => document.removeEventListener('keydown', listener)
    }, [handler, enabled])
}
