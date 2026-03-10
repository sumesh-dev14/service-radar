/**
 * Provider Dashboard — Service Radar
 * Ref: §Key Features (Provider Management Dashboard), §Provider Journey Flow, Phase 16
 *
 * Fetches on mount (parallel):
 *   - providerStore.loadMyProfile() → profile stats (rating, totalReviews)
 *   - bookingStore.fetchBookings()  → incoming bookings
 *
 * Sections:
 *   1. Welcome + availability toggle
 *   2. Stats cards: total bookings, pending, avg rating, total reviews
 *   3. Incoming bookings preview (last 5)
 *   4. Quick actions: Manage Profile, View All Bookings
 */

import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CalendarCheck, Star, Clock, ListChecks,
    UserCog, ToggleLeft, ToggleRight, Loader2,
} from 'lucide-react'
import { useAuth } from '@/hooks'
import { useProviderStore } from '@/store/providerStore'
import { useBookingStore } from '@/store/bookingStore'
import { BookingCard } from '@/components/Booking'
import { useToastContext } from '@/components/Common/Toast'

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, accent, delay = 0 }: {
    label: string; value: React.ReactNode; icon: React.ReactNode; accent: string; delay?: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: 'spring', stiffness: 340, damping: 28 }}
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}
        >
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: `${accent}18`, border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: accent }}>
                {icon}
            </div>
            <div>
                <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 500 }}>{label}</p>
                <p style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-fg)', lineHeight: 1.2 }}>{value}</p>
            </div>
        </motion.div>
    )
}

function greeting() {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

// ── ProviderDashboard ─────────────────────────────────────────────────────────

export default function ProviderDashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const toast = useToastContext()

    const {
        myProfile, profileLoading,
        loadMyProfile, toggleMyAvailability,
    } = useProviderStore()

    const { bookings, isLoading: bookingsLoading, fetchBookings } = useBookingStore()
    
    // Memoize the recent bookings calculation to prevent infinite loops
    const recentBookings = useMemo(() => {
        return [...bookings]
            .sort((a, b) => {
                const dateA = new Date(a.createdAt ?? 0).getTime()
                const dateB = new Date(b.createdAt ?? 0).getTime()
                return dateB - dateA
            })
            .slice(0, 5)
    }, [bookings])

    useEffect(() => {
        // Parallel fetches
        loadMyProfile()
        fetchBookings()
    }, [])

    const total = bookings.length
    const pending = bookings.filter(b => b.status === 'pending').length
    const accepted = bookings.filter(b => b.status === 'accepted').length
    const completed = bookings.filter(b => b.status === 'completed').length

    const avgRating = myProfile?.rating ?? 0
    const totalReviews = myProfile?.totalReviews ?? 0
    const isAvailable = myProfile?.isAvailable ?? false
    const firstName = user?.name?.split(' ')[0] ?? 'Provider'

    const handleToggle = async () => {
        try {
            await toggleMyAvailability()
            toast.success(isAvailable ? 'You are now unavailable for bookings.' : 'You are now available for bookings!')
        } catch {
            toast.error('Failed to update availability. Please try again.')
        }
    }

    return (
        <main style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-fg)', padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>

                {/* ── Welcome + availability toggle ────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}
                >
                    <div>
                        <p style={{ margin: '0 0 0.25rem', fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                            {greeting()},
                        </p>
                        <h1 style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '2rem', color: 'var(--color-fg)' }}>
                            {firstName} 👋
                        </h1>
                        {myProfile
                            ? <p style={{ margin: '0.375rem 0 0', fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                                Your provider dashboard — manage bookings and your profile.
                            </p>
                            : <p style={{ margin: '0.5rem 0 0', fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: '#F59E0B' }}>
                                ⚠️ Profile not set up yet.{' '}
                                <Link to="/provider/profile" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Create your profile →</Link>
                            </p>
                        }
                    </div>

                    {/* Availability toggle */}
                    <motion.button
                        onClick={handleToggle}
                        disabled={profileLoading || !myProfile}
                        whileHover={myProfile ? { scale: 1.04 } : {}}
                        whileTap={myProfile ? { scale: 0.97 } : {}}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.625rem',
                            padding: '0.625rem 1.25rem',
                            borderRadius: 'var(--radius-md)',
                            border: `1px solid ${isAvailable ? '#22c55e40' : 'var(--color-border)'}`,
                            background: isAvailable ? '#22c55e12' : 'var(--color-card)',
                            color: isAvailable ? '#22c55e' : 'var(--color-muted)',
                            fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem',
                            cursor: myProfile ? 'pointer' : 'not-allowed',
                            opacity: !myProfile ? 0.5 : 1,
                            transition: 'all 200ms',
                        }}
                        title={myProfile ? (isAvailable ? 'Click to go offline' : 'Click to go online') : 'Create your profile first'}
                        aria-pressed={isAvailable}
                        aria-label="Toggle availability"
                    >
                        {profileLoading
                            ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            : isAvailable
                                ? <ToggleRight size={20} />
                                : <ToggleLeft size={20} />
                        }
                        {isAvailable ? 'Available' : 'Unavailable'}
                    </motion.button>
                </motion.div>

                {/* ── Stats ───────────────────────────────────────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                    <StatCard label="Total Bookings" value={bookingsLoading ? '—' : total} icon={<CalendarCheck size={22} strokeWidth={1.8} />} accent="var(--color-primary)" delay={0.05} />
                    <StatCard label="Pending" value={bookingsLoading ? '—' : pending} icon={<Clock size={22} strokeWidth={1.8} />} accent="#F59E0B" delay={0.1} />
                    <StatCard label="Avg Rating" value={avgRating > 0 ? avgRating.toFixed(1) : '—'} icon={<Star size={22} strokeWidth={1.8} />} accent="#A78BFA" delay={0.15} />
                    <StatCard label="Total Reviews" value={totalReviews} icon={<Star size={22} strokeWidth={1.8} fill="#A78BFA" />} accent="#A78BFA" delay={0.2} />
                </div>

                {/* ── Incoming bookings preview ────────────────────────────────────── */}
                <section style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <h2 style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '1.25rem', color: 'var(--color-fg)' }}>
                            Incoming Bookings
                        </h2>
                        {total > 5 && (
                            <Link to="/provider/bookings" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none' }}>
                                View all {total} →
                            </Link>
                        )}
                    </div>

                    {bookingsLoading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                            {[1, 2, 3].map(i => <div key={i} style={{ height: 160, background: 'var(--color-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', animation: 'shimmer 1.5s ease-in-out infinite' }} />)}
                        </div>
                    ) : recentBookings.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ padding: '3rem', textAlign: 'center', background: 'var(--color-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                            <CalendarCheck size={40} style={{ color: 'var(--color-muted)', opacity: 0.45, marginBottom: '0.75rem' }} strokeWidth={1.5} />
                            <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.9375rem', color: 'var(--color-muted)' }}>
                                No incoming bookings yet.
                            </p>
                        </motion.div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                            {recentBookings.map((booking, i) => (
                                <motion.div key={booking._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                                    <BookingCard
                                        booking={booking}
                                        viewerRole="provider"
                                        onAccept={() => navigate('/provider/bookings')}
                                        onComplete={() => navigate('/provider/bookings')}
                                        onCancel={() => navigate('/provider/bookings')}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ── Quick actions ──────────────────────────────────────────────────── */}
                <section>
                    <h2 style={{ margin: '0 0 1.25rem', fontFamily: 'Lora, serif', fontSize: '1.25rem', color: 'var(--color-fg)' }}>
                        Quick Actions
                    </h2>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <Link to="/provider/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.375rem', borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', color: 'white', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
                            <UserCog size={16} /> {myProfile ? 'Edit Profile' : 'Create Profile'}
                        </Link>
                        <Link to="/provider/bookings" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.375rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-fg)', fontFamily: 'Poppins, sans-serif', fontWeight: 500, fontSize: '0.875rem', textDecoration: 'none' }}>
                            <ListChecks size={16} /> Manage Bookings
                        </Link>
                    </div>
                </section>

            </div>
        </main>
    )
}
