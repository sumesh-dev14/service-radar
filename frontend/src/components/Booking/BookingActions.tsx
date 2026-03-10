/**
 * BookingActions — Service Radar
 * Ref: §Booking System, §Role-Based Views, §Status Flow
 *
 * Action buttons for a booking, based on:
 *   - Current user's role (customer | provider)
 *   - Booking's current status
 *
 * Action matrix:
 * ┌─────────────┬─────────────────────────────────────────────────┐
 * │ Role/Status │ Available Actions                               │
 * ├─────────────┼─────────────────────────────────────────────────┤
 * │ customer    │ pending   → [Cancel]                            │
 * │             │ accepted  → [Cancel]                            │
 * │             │ completed → [Leave Review] (if !hasReview)      │
 * │             │ cancelled → —                                   │
 * ├─────────────┼─────────────────────────────────────────────────┤
 * │ provider    │ pending   → [Accept] [Decline]                  │
 * │             │ accepted  → [Mark Complete] [Cancel]            │
 * │             │ completed → —                                   │
 * │             │ cancelled → —                                   │
 * └─────────────┴─────────────────────────────────────────────────┘
 *
 * Calls passed-in handlers so the component is fully composable.
 */

import { motion } from 'framer-motion'
import { Check, X, Star, CheckCircle2 } from 'lucide-react'
import type { BookingStatus, UserRole } from '@/types/models'

interface BookingActionsProps {
    status: BookingStatus
    role: UserRole
    isLoading?: boolean
    hasReview?: boolean
    onAccept?: () => void
    onDecline?: () => void
    onComplete?: () => void
    onCancel?: () => void
    onReview?: () => void
}

// ── Tiny action button ────────────────────────────────────────────────────────

function ActionBtn({
    onClick,
    label,
    icon,
    variant = 'outline',
    disabled,
}: {
    onClick?: () => void
    label: string
    icon: React.ReactNode
    variant?: 'primary' | 'outline' | 'danger' | 'success'
    disabled?: boolean
}) {
    const styles: Record<string, React.CSSProperties> = {
        primary: {
            background: 'var(--color-primary)',
            color: 'white',
            border: '1px solid var(--color-primary)',
        },
        success: {
            background: 'var(--color-success)',
            color: 'white',
            border: '1px solid var(--color-success)',
        },
        danger: {
            background: 'transparent',
            color: 'var(--color-error)',
            border: '1px solid var(--color-error)',
        },
        outline: {
            background: 'transparent',
            color: 'var(--color-fg)',
            border: '1px solid var(--color-border)',
        },
    }

    return (
        <motion.button
            whileHover={disabled ? {} : { scale: 1.04 }}
            whileTap={disabled ? {} : { scale: 0.96 }}
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            style={{
                ...styles[variant],
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.4rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                fontSize: '0.8125rem',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.55 : 1,
                transition: 'all 150ms ease',
            }}
        >
            {icon}
            {label}
        </motion.button>
    )
}

// ── BookingActions ────────────────────────────────────────────────────────────

export function BookingActions({
    status,
    role,
    isLoading,
    hasReview,
    onAccept,
    onDecline,
    onComplete,
    onCancel,
    onReview,
}: BookingActionsProps) {
    if (role === 'customer') {
        if (status === 'pending' || status === 'accepted') {
            return (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <ActionBtn
                        onClick={onCancel}
                        label="Cancel Booking"
                        icon={<X size={14} />}
                        variant="danger"
                        disabled={isLoading}
                    />
                </div>
            )
        }
        if (status === 'completed' && !hasReview) {
            return (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <ActionBtn
                        onClick={onReview}
                        label="Leave a Review"
                        icon={<Star size={14} />}
                        variant="primary"
                        disabled={isLoading}
                    />
                </div>
            )
        }
        return null
    }

    // provider role
    if (status === 'pending') {
        return (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <ActionBtn
                    onClick={onAccept}
                    label="Accept"
                    icon={<Check size={14} />}
                    variant="success"
                    disabled={isLoading}
                />
                <ActionBtn
                    onClick={onDecline}
                    label="Decline"
                    icon={<X size={14} />}
                    variant="danger"
                    disabled={isLoading}
                />
            </div>
        )
    }
    if (status === 'accepted') {
        return (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <ActionBtn
                    onClick={onComplete}
                    label="Mark Complete"
                    icon={<CheckCircle2 size={14} />}
                    variant="success"
                    disabled={isLoading}
                />
                <ActionBtn
                    onClick={onCancel}
                    label="Cancel"
                    icon={<X size={14} />}
                    variant="danger"
                    disabled={isLoading}
                />
            </div>
        )
    }

    return null
}
