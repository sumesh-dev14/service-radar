/**
 * Customer Dashboard — Service Radar
 * Ref: §Key Features (Customer Dashboard), §Customer Journey Flow, Phase 15
 *
 * Fetches GET /bookings on mount.
 * Sections:
 *   1. Welcome header + time-of-day greeting
 *   2. Stats cards: Total / Pending / Accepted / Completed
 *   3. Recent bookings (last 5 BookingCards)
 *   4. Quick actions: Search Providers, My Bookings
 */

import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarCheck, Clock, Search, ListChecks, CheckCircle2, Hourglass } from 'lucide-react'
import { useAuth } from '@/hooks'
import { useBookingStore } from '@/store/bookingStore'
import { BookingCard } from '@/components/Booking'

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string
    value: number | string
    icon: React.ReactNode
    accent: string   // CSS color value
    delay?: number
}

function StatCard({ label, value, icon, accent, delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: 'spring', stiffness: 340, damping: 28 }}
            style={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                boxShadow: 'var(--shadow-sm)',
            }}
        >
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: `${accent}18`, border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: accent }}>
                {icon}
            </div>
            <div>
                <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 500 }}>
                    {label}
                </p>
                <p style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-fg)', lineHeight: 1.2 }}>
                    {value}
                </p>
            </div>
        </motion.div>
    )
}

// ── Greeting ──────────────────────────────────────────────────────────────────

function greeting() {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function CustomerDashboard() {
    const { user } = useAuth()
    const { bookings, isLoading, fetchBookings } = useBookingStore()
    
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
        void fetchBookings()
    }, [fetchBookings])

    const total = bookings.length
    const pending = bookings.filter(b => b.status === 'pending').length
    const accepted = bookings.filter(b => b.status === 'accepted').length
    const completed = bookings.filter(b => b.status === 'completed').length

    const firstName = user?.name?.split(' ')[0] ?? 'Customer'

    return (
        <main style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-fg)', padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>

                {/* ── Welcome header ──────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '2rem' }}
                >
                    <p style={{ margin: '0 0 0.25rem', fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                        {greeting()},
                    </p>
                    <h1 style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '2rem', color: 'var(--color-fg)' }}>
                        {firstName} 👋
                    </h1>
                    <p style={{ margin: '0.375rem 0 0', fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', color: 'var(--color-muted)' }}>
                        Here's an overview of your bookings and activity.
                    </p>
                </motion.div>

                {/* ── Stats grid ──────────────────────────────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                    <StatCard label="Total Bookings" value={isLoading ? '—' : total} icon={<CalendarCheck size={22} strokeWidth={1.8} />} accent="var(--color-primary)" delay={0.05} />
                    <StatCard label="Pending" value={isLoading ? '—' : pending} icon={<Clock size={22} strokeWidth={1.8} />} accent="#F59E0B" delay={0.1} />
                    <StatCard label="Accepted" value={isLoading ? '—' : accepted} icon={<Hourglass size={22} strokeWidth={1.8} />} accent="#3B82F6" delay={0.15} />
                    <StatCard label="Completed" value={isLoading ? '—' : completed} icon={<CheckCircle2 size={22} strokeWidth={1.8} />} accent="#22C55E" delay={0.2} />
                </div>

                {/* ── Recent bookings ──────────────────────────────────────────────── */}
                <section style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <h2 style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '1.25rem', color: 'var(--color-fg)' }}>
                            Recent Bookings
                        </h2>
                        {total > 5 && (
                            <Link to="/customer/bookings" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none' }}>
                                View all {total} →
                            </Link>
                        )}
                    </div>

                    {isLoading ? (
                        // Skeleton cards
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ height: 160, background: 'var(--color-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
                            ))}
                        </div>
                    ) : recentBookings.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ padding: '3rem', textAlign: 'center', background: 'var(--color-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}
                        >
                            <CalendarCheck size={40} style={{ color: 'var(--color-muted)', opacity: 0.5, marginBottom: '0.75rem' }} strokeWidth={1.5} />
                            <p style={{ margin: '0 0 1rem', fontFamily: 'Poppins, sans-serif', fontSize: '0.9375rem', color: 'var(--color-muted)' }}>
                                You haven't made any bookings yet.
                            </p>
                            <Link to="/search" className="btn-primary" style={{ fontSize: '0.875rem' }}>
                                Find a Provider
                            </Link>
                        </motion.div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                            {recentBookings.map((booking, i) => (
                                <motion.div
                                    key={booking._id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                >
                                    <BookingCard
                                        booking={booking}
                                        viewerRole="customer"
                                        onCancel={() => { }}
                                        onReview={() => { }}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ── Quick actions ────────────────────────────────────────────────── */}
                <section>
                    <h2 style={{ margin: '0 0 1.25rem', fontFamily: 'Lora, serif', fontSize: '1.25rem', color: 'var(--color-fg)' }}>
                        Quick Actions
                    </h2>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <Link to="/search" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.375rem', borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', color: 'white', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
                            <Search size={16} /> Search Providers
                        </Link>
                        <Link to="/customer/bookings" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.375rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-fg)', fontFamily: 'Poppins, sans-serif', fontWeight: 500, fontSize: '0.875rem', textDecoration: 'none' }}>
                            <ListChecks size={16} /> My Bookings
                        </Link>
                    </div>
                </section>

            </div>
        </main>
    )
}
