/**
 * BookingCard — Service Radar
 * Ref: §Component Architecture (Booking/), §Booking System
 *
 * Displays a single booking summary card.
 * Used in: MyBookings (customer), AvailableBookings (provider)
 *
 * Shows:
 *   - Status badge (BookingStatusBadge)
 *   - Provider name (customer view) OR Customer name (provider view)
 *   - Category service type
 *   - Scheduled date + time (formatted)
 *   - Booking ID (short, for reference)
 *   - Action buttons (BookingActions)
 *   - "View Details" link → /customer/bookings/:id
 *
 * Animation: fade/slide entrance, hover lift
 */

import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Calendar, Hash, ChevronRight, User } from 'lucide-react'
import { BookingStatusBadge } from './BookingStatusBadge'
import { BookingActions } from './BookingActions'
import {
    type Booking,
    type UserRole,
    isPopulatedBookingUser,
    isPopulatedProvider,
    isPopulatedCategory,
} from '@/types/models'

// ── Date formatter ────────────────────────────────────────────────────────────

function formatBookingDate(isoString: string): { date: string; time: string } {
    const d = new Date(isoString)
    const date = d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
    const time = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    })
    return { date, time }
}

// ── BookingCard ───────────────────────────────────────────────────────────────

interface BookingCardProps {
    booking: Booking
    viewerRole: UserRole
    isActionLoading?: boolean
    hasReview?: boolean
    onAccept?: () => void
    onDecline?: () => void
    onComplete?: () => void
    onCancel?: () => void
    onReview?: () => void
}

export function BookingCard({
    booking,
    viewerRole,
    isActionLoading,
    hasReview,
    onAccept,
    onDecline,
    onComplete,
    onCancel,
    onReview,
}: BookingCardProps) {
    const navigate = useNavigate()

    // Resolve display name (what the viewer sees as "the other party")
    let counterpartName = 'Unknown'
    if (viewerRole === 'customer') {
        // Show provider's name
        if (isPopulatedProvider(booking.providerId)) {
            if (isPopulatedBookingUser(booking.providerId.userId)) {
                counterpartName = booking.providerId.userId.name
            }
        }
    } else {
        // Provider sees customer's name
        if (isPopulatedBookingUser(booking.customerId)) {
            counterpartName = booking.customerId.name
        }
    }

    const categoryName = isPopulatedCategory(booking.categoryId)
        ? booking.categoryId.name
        : 'Service'

    const { date, time } = formatBookingDate(booking.scheduledDate)
    const shortId = booking._id.slice(-6).toUpperCase()

    const goToDetail = () => {
        if (viewerRole === 'customer') {
            navigate(`/customer/bookings/${booking._id}`)
        }
        // Provider detail navigates to their booking management view
    }

    const initials = counterpartName
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            style={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: 'var(--shadow-sm)',
            }}
            aria-label={`Booking with ${counterpartName} — ${booking.status}`}
        >
            {/* ── Top row: status badge + booking ID ─────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <BookingStatusBadge status={booking.status} />
                <span
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.6875rem',
                        fontFamily: 'Poppins, sans-serif',
                        color: 'var(--color-muted)',
                    }}
                >
                    <Hash size={11} />
                    {shortId}
                </span>
            </div>

            {/* ── Middle: avatar + counterpart name + category ────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                {/* Avatar */}
                <div
                    aria-hidden="true"
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        color: 'white',
                        flexShrink: 0,
                    }}
                >
                    {initials || <User size={16} />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Role label */}
                    <p style={{
                        margin: 0,
                        fontSize: '0.6875rem',
                        fontFamily: 'Poppins, sans-serif',
                        color: 'var(--color-muted)',
                        marginBottom: '0.125rem',
                    }}>
                        {viewerRole === 'customer' ? 'Provider' : 'Customer'}
                    </p>
                    {/* Name */}
                    <h3 style={{
                        margin: 0,
                        fontFamily: 'Lora, serif',
                        fontWeight: 600,
                        fontSize: '1rem',
                        color: 'var(--color-fg)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}>
                        {counterpartName}
                    </h3>
                    {/* Category */}
                    <span style={{
                        display: 'inline-block',
                        marginTop: '0.2rem',
                        fontSize: '0.6875rem',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 500,
                        color: 'var(--color-primary)',
                        background: 'var(--color-primary)15',
                        padding: '0.1rem 0.45rem',
                        borderRadius: 999,
                        border: '1px solid var(--color-primary)25',
                    }}>
                        {categoryName}
                    </span>
                </div>
            </div>

            {/* ── Scheduled date/time ─────────────────────────────────────────── */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem 0.875rem',
                    background: 'var(--color-bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                }}
            >
                <Calendar size={15} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <div>
                    <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-fg)' }}>
                        {date}
                    </p>
                    <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                        at {time}
                    </p>
                </div>
            </div>

            {/* ── Divider ────────────────────────────────────────────────────── */}
            <div style={{ height: 1, background: 'var(--color-border)' }} />

            {/* ── Footer: actions + view details ─────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <BookingActions
                    status={booking.status}
                    role={viewerRole}
                    isLoading={isActionLoading}
                    hasReview={hasReview}
                    onAccept={onAccept}
                    onDecline={onDecline}
                    onComplete={onComplete}
                    onCancel={onCancel}
                    onReview={onReview}
                />

                {/* View details link */}
                <motion.button
                    onClick={goToDetail}
                    whileHover={{ x: 3 }}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: 'var(--color-primary)',
                        padding: 0,
                        marginLeft: 'auto',
                    }}
                    aria-label="View booking details"
                >
                    Details
                    <ChevronRight size={15} />
                </motion.button>
            </div>
        </motion.article>
    )
}
