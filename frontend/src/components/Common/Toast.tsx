/* eslint-disable react-refresh/only-export-components -- ToastProvider + useToastContext belong together */
/**
 * Toast Notification System — Service Radar
 * Ref: §UI/UX Design Patterns, §Accessibility Requirements (aria-live)
 *
 * Two exports:
 *   <ToastContainer /> — fixed top-right container, renders all active toasts
 *                        Place once in App.tsx (inside <ToastProvider>)
 *   ToastProvider      — provides useToastContext() across the tree
 *   useToastContext()  — hook to call showToast() from any component
 *
 * Toast types:
 *   success → green   (#10B981 / --color-success)
 *   error   → red     (#f96f70 / --color-error)
 *   warning → amber   (#F59E0B / --color-warning)
 *   info    → teal    (#8acfd1 / --color-secondary)
 *
 * Animations use Framer Motion (slide-in from right, fade-out).
 */

import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import type { Toast, ToastType } from '@/types/models'

// ── Toast appearance config ───────────────────────────────────────────────────

const TOAST_CONFIG: Record<
    ToastType,
    { icon: typeof CheckCircle; color: string; bg: string }
> = {
    success: {
        icon: CheckCircle,
        color: 'var(--color-success)',
        bg: 'rgba(16, 185, 129, 0.1)',
    },
    error: {
        icon: XCircle,
        color: 'var(--color-error)',
        bg: 'rgba(249, 111, 112, 0.1)',
    },
    warning: {
        icon: AlertTriangle,
        color: 'var(--color-warning)',
        bg: 'rgba(245, 158, 11, 0.1)',
    },
    info: {
        icon: Info,
        color: 'var(--color-secondary)',
        bg: 'rgba(138, 207, 209, 0.1)',
    },
}

// ── Context ───────────────────────────────────────────────────────────────────

interface ToastContextValue {
    toasts: Toast[]
    showToast: (type: ToastType, message: string, duration?: number) => void
    dismissToast: (id: string) => void
    success: (message: string, duration?: number) => void
    error: (message: string, duration?: number) => void
    warning: (message: string, duration?: number) => void
    info: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const MAX_TOASTS = 5

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const showToast = useCallback(
        (type: ToastType, message: string, duration = 4000) => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
            const toast: Toast = { id, type, message, duration }

            setToasts(prev => {
                const next = prev.length >= MAX_TOASTS ? prev.slice(1) : prev
                return [...next, toast]
            })

            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id))
            }, duration)
        },
        [],
    )

    const success = useCallback(
        (m: string, d?: number) => showToast('success', m, d),
        [showToast],
    )
    const error = useCallback(
        (m: string, d?: number) => showToast('error', m, d),
        [showToast],
    )
    const warning = useCallback(
        (m: string, d?: number) => showToast('warning', m, d),
        [showToast],
    )
    const info = useCallback(
        (m: string, d?: number) => showToast('info', m, d),
        [showToast],
    )

    return (
        <ToastContext.Provider
            value={{ toasts, showToast, dismissToast, success, error, warning, info }}
        >
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useToastContext(): ToastContextValue {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToastContext must be used inside <ToastProvider>')
    return ctx
}

// ── Individual Toast item ─────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    const config = TOAST_CONFIG[toast.type]
    const Icon = config.icon

    return (
        <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            role="alert"
            aria-live="polite"
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                background: 'var(--color-card)',
                border: `1px solid ${config.color}40`,
                borderLeft: `4px solid ${config.color}`,
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                maxWidth: 360,
                width: '100%',
                backdropFilter: 'blur(8px)',
            }}
        >
            {/* Icon */}
            <Icon
                size={20}
                style={{ color: config.color, flexShrink: 0, marginTop: 1 }}
            />

            {/* Message */}
            <p
                style={{
                    flex: 1,
                    fontSize: '0.875rem',
                    fontFamily: 'Poppins, sans-serif',
                    color: 'var(--color-fg)',
                    lineHeight: 1.5,
                    margin: 0,
                }}
            >
                {toast.message}
            </p>

            {/* Dismiss */}
            <button
                onClick={onDismiss}
                aria-label="Dismiss notification"
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.125rem',
                    color: 'var(--color-muted)',
                    flexShrink: 0,
                    lineHeight: 1,
                    transition: 'color 150ms',
                }}
                onMouseEnter={e =>
                    ((e.currentTarget as HTMLButtonElement).style.color = 'var(--color-fg)')
                }
                onMouseLeave={e =>
                    ((e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)')
                }
            >
                <X size={16} />
            </button>
        </motion.div>
    )
}

// ── Container (fixed top-right) ───────────────────────────────────────────────

function ToastContainer() {
    const { toasts, dismissToast } = useToastContext()

    return (
        <div
            aria-live="polite"
            aria-atomic="false"
            style={{
                position: 'fixed',
                top: '1.25rem',
                right: '1.25rem',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
                pointerEvents: 'none',
            }}
        >
            <AnimatePresence mode="popLayout">
                {toasts.map(toast => (
                    <div key={toast.id} style={{ pointerEvents: 'auto' }}>
                        <ToastItem
                            toast={toast}
                            onDismiss={() => dismissToast(toast.id)}
                        />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    )
}
