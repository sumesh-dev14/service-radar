/**
 * BookingStatusBadge — Service Radar
 * Ref: §Booking System, §Status Flow (pending → accepted → completed | cancelled)
 *
 * Visual pill badge for booking status.
 *
 * Status → colour mapping:
 *   pending   → amber   (waiting for provider response)
 *   accepted  → blue    (provider confirmed)
 *   completed → green   (service done)
 *   cancelled → grey    (cancelled by either party)
 *
 * Usage:
 *   <BookingStatusBadge status="pending" />
 *   <BookingStatusBadge status="completed" size="lg" />
 */

import { Clock, CheckCircle, XCircle, ThumbsUp } from 'lucide-react'
import type { BookingStatus } from '@/types/models'

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
    BookingStatus,
    {
        label: string
        icon: typeof Clock
        color: string
        bg: string
        border: string
    }
> = {
    pending: {
        label: 'Pending',
        icon: Clock,
        color: '#F59E0B',
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.28)',
    },
    accepted: {
        label: 'Accepted',
        icon: ThumbsUp,
        color: '#3B82F6',
        bg: 'rgba(59, 130, 246, 0.12)',
        border: 'rgba(59, 130, 246, 0.28)',
    },
    completed: {
        label: 'Completed',
        icon: CheckCircle,
        color: 'var(--color-success)',
        bg: 'rgba(16, 185, 129, 0.12)',
        border: 'rgba(16, 185, 129, 0.28)',
    },
    cancelled: {
        label: 'Cancelled',
        icon: XCircle,
        color: 'var(--color-muted)',
        bg: 'rgba(120, 120, 140, 0.10)',
        border: 'rgba(120, 120, 140, 0.22)',
    },
}

// ── Component ─────────────────────────────────────────────────────────────────

interface BookingStatusBadgeProps {
    status: BookingStatus
    size?: 'sm' | 'md' | 'lg'
    showIcon?: boolean
}

export function BookingStatusBadge({
    status,
    size = 'md',
    showIcon = true,
}: BookingStatusBadgeProps) {
    const cfg = STATUS_CONFIG[status]
    const Icon = cfg.icon

    const padMap = { sm: '0.15rem 0.5rem', md: '0.25rem 0.625rem', lg: '0.35rem 0.9rem' }
    const fontMap = { sm: '0.6875rem', md: '0.75rem', lg: '0.8125rem' }
    const iconMap = { sm: 11, md: 13, lg: 15 }

    return (
        <span
            aria-label={`Status: ${cfg.label}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: padMap[size],
                borderRadius: 999,
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                fontSize: fontMap[size],
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                color: cfg.color,
                letterSpacing: '0.02em',
                flexShrink: 0,
                whiteSpace: 'nowrap',
            }}
        >
            {showIcon && <Icon size={iconMap[size]} strokeWidth={2.2} />}
            {cfg.label}
        </span>
    )
}
