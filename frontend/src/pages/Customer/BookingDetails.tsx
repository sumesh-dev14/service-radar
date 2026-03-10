/**
 * BookingDetails — Customer Page — Service Radar
 * Ref: §Booking Endpoints, §Review Endpoints, §Customer Journey Flow, Phase 15
 *
 * Fetches GET /bookings/:id (with cache check in bookingStore).
 * Actions:
 *   - Cancel (only for 'pending') → PATCH /bookings/:id/status { cancelled }
 *   - Leave Review (only for 'completed' + no review yet) → opens ReviewForm inline
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronLeft, CalendarClock, DollarSign, User,
    Tag, AlertTriangle, XCircle, CheckCircle2,
} from 'lucide-react'
import { useBookingStore } from '@/store/bookingStore'
import { BookingStatusBadge } from '@/components/Booking'
import { ReviewForm } from '@/components/Review'
import { useToastContext } from '@/components/Common/Toast'
import type { ProviderProfile, PopulatedUser, PopulatedCategory } from '@/types/models'

// ── Type helpers ──────────────────────────────────────────────────────────────

function isPopulatedUser(v: unknown): v is PopulatedUser {
    return typeof v === 'object' && v !== null && 'name' in v
}
function isPopulatedProvider(v: unknown): v is ProviderProfile {
    return typeof v === 'object' && v !== null && 'bio' in v
}
function isPopulatedCategory(v: unknown): v is PopulatedCategory {
    return typeof v === 'object' && v !== null && 'name' in v
}

// ── Detail row ────────────────────────────────────────────────────────────────

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', padding: '0.875rem 0', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }}>{icon}</div>
            <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 0.1rem', fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label}
                </p>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.9375rem', color: 'var(--color-fg)' }}>
                    {value}
                </div>
            </div>
        </div>
    )
}

// ── BookingDetails ────────────────────────────────────────────────────────────

export default function BookingDetails() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const toast = useToastContext()
    const { currentBooking, isLoading, actionLoading, getBookingDetail, updateBookingStatus } = useBookingStore()

    const [showReviewForm, setShowReviewForm] = useState(false)
    const [hasReview, setHasReview] = useState(false)
    const [cancelConfirm, setCancelConfirm] = useState(false)

    useEffect(() => {
        if (id) getBookingDetail(id)
    }, [id, getBookingDetail])

    // Check if review exists for this booking
    useEffect(() => {
        const checkReviewExists = async () => {
            if (!id) return
            try {
                // We'll add a simple API call to check if review exists
                const response = await fetch(`${import.meta.env.VITE_API_URL}/reviews/check/${id}`, {
                    credentials: 'include'
                })
                if (response.ok) {
                    const data = await response.json()
                    setHasReview(data.exists)
                }
            } catch (error) {
                console.error('Failed to check review status:', error)
            }
        }

        if (currentBooking?.status === 'completed') {
            checkReviewExists()
        }
    }, [id, currentBooking?.status])

    // ── Cancel booking ──────────────────────────────────────────────────────────

    const handleCancel = async () => {
        if (!id) return
        try {
            await updateBookingStatus(id, 'cancelled')
            toast.success('Booking cancelled successfully.')
            setCancelConfirm(false)
        } catch {
            toast.error('Failed to cancel booking. Please try again.')
        }
    }

    // ── Loading ─────────────────────────────────────────────────────────────────

    if (isLoading || !currentBooking) {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '2rem 1.5rem' }}>
                <div style={{ maxWidth: 700, margin: '0 auto' }}>
                    <div style={{ height: 20, width: 120, background: 'var(--color-card)', borderRadius: 8, marginBottom: '1.5rem' }} />
                    {[200, 280, 200].map((h, i) => (
                        <div key={i} style={{ height: h, background: 'var(--color-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: '1rem', animation: 'shimmer 1.5s ease-in-out infinite' }} />
                    ))}
                </div>
            </main>
        )
    }

    const booking = currentBooking

    // ── Derived data ──────────────────────────────────────────────────────────

    const providerProfile = isPopulatedProvider(booking.providerId) ? booking.providerId : null
    const providerUser = providerProfile && isPopulatedUser(providerProfile.userId) ? providerProfile.userId : null
    const providerName = providerUser?.name ?? 'Provider'
    const categoryName = isPopulatedCategory(booking.categoryId) ? booking.categoryId.name : 'Service'
    const price = providerProfile?.price ?? null

    const scheduledDate = new Date(booking.scheduledDate)
    const formattedDate = scheduledDate.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const formattedTime = scheduledDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

    const isPending = booking.status === 'pending'
    const isCompleted = booking.status === 'completed'
    const isCancelled = booking.status === 'cancelled'

    return (
        <main style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-fg)', padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: 700, margin: '0 auto' }}>

                {/* ── Navigation ───────────────────────────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem', fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: 'var(--color-muted)', flexWrap: 'wrap' }}>
                    <motion.button onClick={() => navigate('/customer/bookings')} whileHover={{ x: -2 }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontFamily: 'inherit', fontSize: 'inherit', padding: 0 }}>
                        <ChevronLeft size={15} /> My Bookings
                    </motion.button>
                    <span style={{ color: 'var(--color-border)' }}>/</span>
                    <span style={{ color: 'var(--color-fg)', fontWeight: 500 }}>Booking #{booking._id.slice(-6).toUpperCase()}</span>
                </div>

                {/* ── Main card ────────────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                    style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', marginBottom: '1.25rem', boxShadow: 'var(--shadow-md)' }}
                >
                    {/* Header row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                        <div>
                            <h1 style={{ margin: '0 0 0.375rem', fontFamily: 'Lora, serif', fontSize: '1.375rem', color: 'var(--color-fg)' }}>
                                {categoryName} with {providerName}
                            </h1>
                            <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', color: 'var(--color-muted)' }}>
                                Booking ref: #{booking._id.slice(-8).toUpperCase()}
                            </p>
                        </div>
                        <BookingStatusBadge status={booking.status} />
                    </div>

                    {/* Details */}
                    <DetailRow icon={<User size={17} />} label="Provider" value={<strong>{providerName}</strong>} />
                    <DetailRow icon={<Tag size={17} />} label="Service" value={categoryName} />
                    <DetailRow icon={<CalendarClock size={17} />} label="Scheduled Date" value={<>{formattedDate} at <strong>{formattedTime}</strong></>} />
                    {price !== null && (
                        <DetailRow icon={<DollarSign size={17} />} label="Rate" value={<><strong>${price}</strong>/hr</>} />
                    )}
                    <div style={{ borderBottom: 'none' }}>
                        <DetailRow icon={<CheckCircle2 size={17} />} label="Status" value={<BookingStatusBadge status={booking.status} />} />
                    </div>
                </motion.div>

                {/* ── Action buttons ────────────────────────────────────────────────── */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>

                    {/* Cancel (pending only) */}
                    {isPending && !cancelConfirm && (
                        <motion.button
                            onClick={() => setCancelConfirm(true)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-error)', background: 'rgba(249,111,112,0.06)', color: 'var(--color-error)', fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
                        >
                            <XCircle size={15} /> Cancel Booking
                        </motion.button>
                    )}

                    {/* Confirm cancel */}
                    <AnimatePresence>
                        {cancelConfirm && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ overflow: 'hidden', width: '100%' }}
                            >
                                <div style={{ padding: '1rem', background: 'rgba(249,111,112,0.07)', border: '1px solid rgba(249,111,112,0.25)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
                                    <AlertTriangle size={18} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
                                    <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: 'var(--color-fg)', flex: 1 }}>
                                        Are you sure you want to cancel this booking? This action cannot be undone.
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => setCancelConfirm(false)}
                                            style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'none', color: 'var(--color-muted)', fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', cursor: 'pointer' }}
                                        >
                                            Keep it
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={actionLoading}
                                            style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-error)', color: 'white', fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', fontWeight: 600, cursor: actionLoading ? 'wait' : 'pointer', opacity: actionLoading ? 0.7 : 1 }}
                                        >
                                            {actionLoading ? 'Cancelling…' : 'Yes, Cancel'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Leave Review (completed only, toggleable) */}
                    {isCompleted && !hasReview && !showReviewForm && (
                        <motion.button
                            onClick={() => setShowReviewForm(true)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
                        >
                            ★ Leave a Review
                        </motion.button>
                    )}

                    {/* View provider */}
                    {providerProfile && (
                        <Link
                            to={`/provider/${typeof booking.providerId === 'string' ? booking.providerId : providerProfile._id}`}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'none', color: 'var(--color-fg)', fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}
                        >
                            View Provider Profile
                        </Link>
                    )}
                </div>

                {/* ── Review Form (completed + user clicked Leave a Review) ─────────── */}
                <AnimatePresence>
                    {showReviewForm && isCompleted && (
                        <motion.div
                            key="review-form"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{ marginTop: '0.5rem' }}>
                                <ReviewForm
                                    bookingId={booking._id}
                                    providerName={providerName}
                                    onSuccess={() => {
                                        setShowReviewForm(false)
                                        setHasReview(true)
                                        toast.success('Review submitted! Thank you for your feedback.')
                                    }}
                                    onCancel={() => setShowReviewForm(false)}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Cancelled note ────────────────────────────────────────────────── */}
                {isCancelled && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ padding: '1rem', background: 'rgba(249,111,112,0.06)', border: '1px solid rgba(249,111,112,0.2)', borderRadius: 'var(--radius-md)', fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <XCircle size={16} /> This booking has been cancelled.
                    </motion.div>
                )}

            </div>
        </main>
    )
}
