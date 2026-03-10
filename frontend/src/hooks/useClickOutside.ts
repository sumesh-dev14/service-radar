/**
 * useClickOutside — Service Radar
 * Ref: §Accessibility Requirements (Escape key / click outside for modals)
 *
 * Calls `handler` when a click is detected outside the referenced element.
 * Used by dropdowns, modals, and drawers to close on outside click.
 *
 * Usage:
 *   const ref = useClickOutside<HTMLDivElement>(() => setOpen(false))
 *   <div ref={ref}>...</div>
 */

import { useEffect, useRef, type RefObject } from 'react'

export function useClickOutside<T extends HTMLElement = HTMLElement>(
    handler: () => void,
    enabled = true,
): RefObject<T | null> {
    const ref = useRef<T | null>(null)

    useEffect(() => {
        if (!enabled) return

        const listener = (event: MouseEvent | TouchEvent) => {
            const el = ref.current
            if (!el || el.contains(event.target as Node)) return
            handler()
        }

        document.addEventListener('mousedown', listener)
        document.addEventListener('touchstart', listener)

        return () => {
            document.removeEventListener('mousedown', listener)
            document.removeEventListener('touchstart', listener)
        }
    }, [handler, enabled])

    return ref
}
