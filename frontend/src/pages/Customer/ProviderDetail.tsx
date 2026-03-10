/**
 * ProviderDetail — Service Radar
 * Ref: §Provider Endpoints, §Booking System, §Review Endpoints, Phase 14
 *
 * Fetches in parallel:
 *   - GET /providers/:id        → provider info
 *   - GET /providers/:id/reviews → reviews + stats
 *
 * Sections:
 *   1. Profile header — avatar, name, category, rating, price, availability, bio
 *   2. Book Now button → opens BookingForm inline (auth-guarded → redirect to login)
 *   3. ReviewList with stats + review cards
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Star, MapPin, DollarSign, CheckCircle, XCircle,
    ChevronLeft, CalendarPlus, MessageSquare,
} from 'lucide-react'
import { useProviderStore } from '@/store/providerStore'
import { useAuthStore } from '@/store/authStore'
import { getProviderReviews } from '@/services/providerService'
import { ProviderList } from '@/components/Provider'
import { ReviewList } from '@/components/Review'
import { BookingForm } from '@/components/Booking'
import type { Review, ReviewStats, ProviderProfile, PopulatedUser, PopulatedCategory } from '@/types/models'

// ── Type guards ───────────────────────────────────────────────────────────────

function isPopulatedUser(v: ProviderProfile['userId']): v is PopulatedUser {
    return typeof v === 'object' && v !== null && 'name' in v
}
function isPopulatedCategory(v: ProviderProfile['categoryId']): v is PopulatedCategory {
    return typeof v === 'object' && v !== null && 'name' in v
}

// ── Star display ──────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
    return (
        <div style={{ display: 'flex', gap: '0.1rem' }} aria-label={`Rating: ${rating.toFixed(1)} out of 5`}>
            {[1, 2, 3, 4, 5].map(n => (
                <Star
                    key={n}
                    size={16}
                    fill={n <= Math.round(rating) ? '#F59E0B' : 'none'}
                    style={{ color: n <= Math.round(rating) ? '#F59E0B' : 'var(--color-border)' }}
                    strokeWidth={1.6}
                />
            ))}
        </div>
    )
}

// ── ProviderDetail ────────────────────────────────────────────────────────────

export default function ProviderDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { currentProvider, isLoading: providerLoading, error: providerError, getProviderDetail } = useProviderStore()

    const [reviews, setReviews] = useState<Review[]>([])
    const [stats, setStats] = useState<ReviewStats>({ count: 0, providerRating: 0, totalReviews: 0 })
    const [reviewsLoading, setReviewsLoading] = useState(true)

    const [showBookingForm, setShowBookingForm] = useState(false)

    useEffect(() => {
        if (!id) return
        // Parallel fetch: provider info + reviews
        getProviderDetail(id)
        getProviderReviews(id)
            .then(data => { setReviews(data.reviews); setStats(data.stats) })
            .catch(() => { })
            .finally(() => setReviewsLoading(false))
    }, [id, getProviderDetail])

    // ── Error / loading states ──────────────────────────────────────────────────

    if (providerLoading) {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '2rem 1.5rem' }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    {/* Back link skeleton */}
                    <div style={{ height: 20, width: 80, background: 'var(--color-card)', borderRadius: 8, marginBottom: '1.5rem' }} />
                    {/* Header card skeleton */}
                    <div style={{ height: 200, background: 'var(--color-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: '1.5rem', animation: 'shimmer 1.5s ease-in-out infinite' }} />
                    {/* Review list skeleton */}
                    <div style={{ height: 140, background: 'var(--color-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
                </div>
            </main>
        )
    }

    if (providerError || !currentProvider) {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--color-fg)', padding: '2rem' }}>
                <XCircle size={48} style={{ color: 'var(--color-error)', opacity: 0.6 }} strokeWidth={1.5} />
                <h1 style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '1.5rem' }}>Provider not found</h1>
                <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', color: 'var(--color-muted)' }}>
                    {providerError ?? 'This provider profile does not exist or has been removed.'}
                </p>
                <Link to="/search" className="btn-primary">Back to Search</Link>
            </main>
        )
    }

    const provider = currentProvider
    const providerName = isPopulatedUser(provider.userId) ? provider.userId.name : 'Provider'
    const categoryName = isPopulatedCategory(provider.categoryId) ? provider.categoryId.name : 'Service'
    const categoryId = isPopulatedCategory(provider.categoryId) ? provider.categoryId._id : String(provider.categoryId)

    const initials = providerName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

    // "Book" handler — auth-guarded
    const handleBook = () => {
        if (!user) {
            navigate('/login', { state: { from: `/provider/${id}` } })
            return
        }
        if (user.role !== 'customer') return // providers can't book themselves
        setShowBookingForm(true)
    }

    const canBook = !showBookingForm && (user?.role === 'customer' || !user)

    return (
        <main style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-fg)', padding: '1.5rem' }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>

                {/* ── Back link ────────────────────────────────────────────────── */}
                <motion.button
                    onClick={() => navigate(-1)}
                    whileHover={{ x: -3 }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', padding: '0 0 1.25rem', marginBottom: '0.25rem' }}
                    aria-label="Go back"
                >
                    <ChevronLeft size={16} /> Back to search
                </motion.button>

                {/* ── Profile header card ───────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-md)' }}
                >
                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>

                        {/* Avatar */}
                        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.375rem', color: 'white', flexShrink: 0 }} aria-hidden="true">
                            {initials}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                                <h1 style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '1.5rem', color: 'var(--color-fg)' }}>
                                    {providerName}
                                </h1>
                                {provider.isAvailable ? (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.625rem', borderRadius: 999, background: '#22c55e18', border: '1px solid #22c55e40', fontFamily: 'Poppins, sans-serif', fontSize: '0.6875rem', fontWeight: 600, color: '#22c55e' }}>
                                        <CheckCircle size={11} /> Available
                                    </span>
                                ) : (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.625rem', borderRadius: 999, background: 'var(--color-border)', fontFamily: 'Poppins, sans-serif', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-muted)' }}>
                                        <XCircle size={11} /> Unavailable
                                    </span>
                                )}
                            </div>

                            {/* Category pill */}
                            <span style={{ display: 'inline-block', padding: '0.2rem 0.625rem', borderRadius: 999, background: 'var(--color-primary)15', border: '1px solid var(--color-primary)30', fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.625rem' }}>
                                {categoryName}
                            </span>

                            {/* Metadata row */}
                            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <Stars rating={provider.rating} />
                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: '#F59E0B' }}>
                                        {provider.rating > 0 ? provider.rating.toFixed(1) : '—'}
                                    </span>
                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                                        ({provider.totalReviews} review{provider.totalReviews !== 1 ? 's' : ''})
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: 'var(--color-fg)' }}>
                                    <DollarSign size={15} style={{ color: 'var(--color-primary)' }} />
                                    <strong>${provider.price}</strong>
                                    <span style={{ color: 'var(--color-muted)' }}>/hr</span>
                                </div>
                                {provider.distance != null && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                                        <MapPin size={14} />
                                        {provider.distance < 1
                                            ? `${Math.round(provider.distance * 1000)}m away`
                                            : `${provider.distance.toFixed(1)} km away`}
                                    </div>
                                )}
                            </div>

                            {/* Bio */}
                            {provider.bio && (
                                <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', color: 'var(--color-fg)', lineHeight: 1.7, opacity: 0.88, maxWidth: 560 }}>
                                    {provider.bio}
                                </p>
                            )}
                        </div>

                        {/* Book Now button */}
                        {canBook && (
                            <motion.button
                                onClick={handleBook}
                                disabled={!provider.isAvailable}
                                whileHover={provider.isAvailable ? { scale: 1.04 } : {}}
                                whileTap={provider.isAvailable ? { scale: 0.97 } : {}}
                                className="btn-primary"
                                style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: provider.isAvailable ? 1 : 0.45, cursor: provider.isAvailable ? 'pointer' : 'not-allowed' }}
                                title={provider.isAvailable ? 'Book this provider' : 'Provider is currently unavailable'}
                            >
                                <CalendarPlus size={16} />
                                {user ? 'Book Now' : 'Sign in to Book'}
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                {/* ── Booking form (inline, appears when Book Now clicked) ───────── */}
                <AnimatePresence>
                    {showBookingForm && id && (
                        <motion.div
                            key="booking-form"
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: '1.5rem' }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{ paddingBottom: '0.25rem' }}>
                                <h2 style={{ fontFamily: 'Lora, serif', fontSize: '1.125rem', color: 'var(--color-fg)', margin: '0 0 1rem' }}>
                                    <MessageSquare size={18} style={{ verticalAlign: 'text-bottom', marginRight: '0.4rem', color: 'var(--color-primary)' }} />
                                    Book {providerName}
                                </h2>
                                <BookingForm
                                    providerId={id}
                                    categoryId={categoryId}
                                    providerName={providerName}
                                    categoryName={categoryName}
                                    price={provider.price}
                                    onCancel={() => setShowBookingForm(false)}
                                    onSuccess={() => setShowBookingForm(false)}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Reviews section ───────────────────────────────────────────── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    aria-label="Reviews"
                >
                    <h2 style={{ fontFamily: 'Lora, serif', fontSize: '1.25rem', color: 'var(--color-fg)', marginBottom: '1.25rem' }}>
                        Customer Reviews
                    </h2>
                    <ReviewList
                        reviews={reviews}
                        stats={stats}
                        isLoading={reviewsLoading}
                    />
                </motion.section>

            </div>
        </main>
    )
}
