/**
 * ReviewList — Service Radar
 * Ref: §Component Architecture (Review/), §Review Endpoints, §Rating System
 *
 * Renders the list of reviews for a provider, with aggregate stats header.
 *
 * Features:
 *   - Stats bar: average rating (large number), star display, review count,
 *     mini distribution bar chart (5★→1★ percentages)
 *   - Each review card: reviewer name (initials avatar), star rating, date,
 *     comment text
 *   - Loading skeleton state
 *   - Empty state with prompt icon
 *   - Stagger entrance animation
 *
 * Used by: ProviderDetail page (Phase 14)
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Star, MessageSquare } from 'lucide-react'
import { SkeletonCard } from '@/components/Common/SkeletonCard'
import {
    type Review,
    type ReviewStats,
    isPopulatedBookingUser,
} from '@/types/models'

// ── Static star row ───────────────────────────────────────────────────────────

function StaticStars({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <div style={{ display: 'flex', gap: '0.1rem' }} aria-hidden="true">
            {[1, 2, 3, 4, 5].map(n => (
                <Star
                    key={n}
                    size={size}
                    style={{ color: n <= Math.round(rating) ? '#F59E0B' : 'var(--color-border)' }}
                    fill={n <= Math.round(rating) ? '#F59E0B' : 'none'}
                    strokeWidth={1.6}
                />
            ))}
        </div>
    )
}

// ── Aggregate stats header ────────────────────────────────────────────────────

interface StatsHeaderProps {
    stats: ReviewStats
    reviews: Review[]
}

function StatsHeader({ stats, reviews }: StatsHeaderProps) {
    // Compute distribution
    const dist = [5, 4, 3, 2, 1].map(n => ({
        star: n,
        count: reviews.filter(r => Math.round(r.rating) === n).length,
        pct: reviews.length > 0
            ? (reviews.filter(r => Math.round(r.rating) === n).length / reviews.length) * 100
            : 0,
    }))

    return (
        <div
            style={{
                display: 'flex',
                gap: '2rem',
                padding: '1.25rem',
                background: 'var(--color-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                alignItems: 'center',
            }}
        >
            {/* Big average score */}
            <div style={{ textAlign: 'center', minWidth: 80 }}>
                <p style={{
                    margin: 0,
                    fontFamily: 'Lora, serif',
                    fontWeight: 700,
                    fontSize: '3rem',
                    lineHeight: 1,
                    color: 'var(--color-fg)',
                }}>
                    {stats.providerRating > 0 ? stats.providerRating.toFixed(1) : '—'}
                </p>
                <StaticStars rating={stats.providerRating} size={16} />
                <p style={{
                    margin: '0.25rem 0 0',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '0.75rem',
                    color: 'var(--color-muted)',
                }}>
                    {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Distribution bars */}
            <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {dist.map(({ star, count, pct }) => (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.6875rem', color: 'var(--color-muted)', width: 10, textAlign: 'right', flexShrink: 0 }}>
                            {star}
                        </span>
                        <Star size={11} fill="#F59E0B" style={{ color: '#F59E0B', flexShrink: 0 }} />
                        <div style={{ flex: 1, height: 6, background: 'var(--color-border)', borderRadius: 999, overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6, delay: (5 - star) * 0.08, ease: 'easeOut' }}
                                style={{ height: '100%', background: 'var(--color-warning)', borderRadius: 999 }}
                            />
                        </div>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.6875rem', color: 'var(--color-muted)', width: 18, flexShrink: 0 }}>
                            {count}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ── Single review card ────────────────────────────────────────────────────────

function ReviewCard({ review, index }: { review: Review; index: number }) {
    const reviewerName = isPopulatedBookingUser(review.customerId)
        ? review.customerId.name
        : 'Anonymous'

    const initials = reviewerName
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    const timeAgo = (() => {
        const diff = Date.now() - new Date(review.createdAt).getTime()
        const days = Math.floor(diff / 86400000)
        if (days === 0) return 'Today'
        if (days === 1) return 'Yesterday'
        if (days < 30) return `${days} days ago`
        const months = Math.floor(days / 30)
        if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`
        return `${Math.floor(months / 12)} year${Math.floor(months / 12) > 1 ? 's' : ''} ago`
    })()

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, type: 'spring', stiffness: 400, damping: 35 }}
            style={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.125rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
            }}
        >
            {/* Header: avatar + name + date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                    aria-hidden="true"
                    style={{
                        width: 38,
                        height: 38,
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
                    {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontFamily: 'Lora, serif', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-fg)' }}>
                        {reviewerName}
                    </p>
                    <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.6875rem', color: 'var(--color-muted)' }}>
                        {timeAgo}
                    </p>
                </div>
                {/* Stars */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <StaticStars rating={review.rating} size={13} />
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.75rem', color: '#F59E0B' }}>
                        {review.rating.toFixed(1)}
                    </span>
                </div>
            </div>

            {/* Comment */}
            <p style={{
                margin: 0,
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.875rem',
                color: 'var(--color-fg)',
                lineHeight: 1.65,
                opacity: 0.9,
            }}>
                {review.comment}
            </p>
        </motion.div>
    )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyReviews() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '3rem 2rem',
                color: 'var(--color-muted)',
                textAlign: 'center',
            }}
        >
            <MessageSquare size={44} style={{ color: 'var(--color-primary)', opacity: 0.35 }} strokeWidth={1.5} />
            <p style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '1rem', fontWeight: 600, color: 'var(--color-fg)' }}>
                No reviews yet
            </p>
            <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', maxWidth: 260, lineHeight: 1.6 }}>
                Be the first to share your experience with this provider.
            </p>
        </motion.div>
    )
}

// ── ReviewList ────────────────────────────────────────────────────────────────

interface ReviewListProps {
    reviews: Review[]
    stats: ReviewStats
    isLoading?: boolean
}

export function ReviewList({ reviews, stats, isLoading = false }: ReviewListProps) {
    if (isLoading) {
        return (
            <div aria-busy="true" aria-label="Loading reviews">
                {/* Stats skeleton */}
                <div style={{ height: 120, background: 'var(--color-card)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', border: '1px solid var(--color-border)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <SkeletonCard count={3} />
                </div>
            </div>
        )
    }

    return (
        <section aria-label={`Reviews (${stats.totalReviews})`}>
            {/* Stats header — always shown */}
            <StatsHeader stats={stats} reviews={reviews} />

            {/* Review cards or empty state */}
            <AnimatePresence mode="wait">
                {reviews.length === 0 ? (
                    <EmptyReviews />
                ) : (
                    <div
                        style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
                        role="list"
                        aria-label="Customer reviews"
                    >
                        {reviews.map((review, i) => (
                            <div key={review._id} role="listitem">
                                <ReviewCard review={review} index={i} />
                            </div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </section>
    )
}
