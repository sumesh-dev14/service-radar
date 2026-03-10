/**
 * MyBookings — Customer Page — Service Radar
 * Ref: §Booking Endpoints, §Customer Journey Flow, Phase 15
 *
 * Fetches GET /bookings on mount (via bookingStore).
 * Tab strip: All / Pending / Accepted / Completed / Cancelled
 * Each tab shows filtered BookingCards → click → /customer/bookings/:id
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarCheck, ChevronLeft } from 'lucide-react'
import { useBookingStore } from '@/store/bookingStore'
import { BookingCard } from '@/components/Booking'
import type { BookingStatus } from '@/types/models'

// ── Tabs ──────────────────────────────────────────────────────────────────────

type Tab = 'all' | BookingStatus

const TABS: { id: Tab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
]

// ── MyBookings ────────────────────────────────────────────────────────────────

export default function MyBookings() {
    const navigate = useNavigate()
    const { bookings, isLoading, fetchBookings } = useBookingStore()
    const [activeTab, setActiveTab] = useState<Tab>('all')

    useEffect(() => { fetchBookings() }, [])

    const filtered = activeTab === 'all'
        ? bookings
        : bookings.filter(b => b.status === activeTab)

    // Count badge per tab
    const tabCount = (tab: Tab) =>
        tab === 'all'
            ? bookings.length
            : bookings.filter(b => b.status === tab).length

    return (
        <main style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-fg)', padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>

                {/* ── Header ──────────────────────────────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
                    <motion.button
                        onClick={() => navigate('/customer/dashboard')}
                        whileHover={{ x: -3 }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', padding: 0 }}
                    >
                        <ChevronLeft size={16} /> Dashboard
                    </motion.button>
                    <span style={{ color: 'var(--color-border)' }}>/</span>
                    <h1 style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '1.75rem', color: 'var(--color-fg)' }}>
                        My Bookings
                    </h1>
                </div>

                {/* ── Tab strip ────────────────────────────────────────────────────── */}
                <div
                    role="tablist"
                    aria-label="Filter bookings by status"
                    style={{ display: 'flex', gap: '0.25rem', borderBottom: '2px solid var(--color-border)', marginBottom: '1.75rem', overflowX: 'auto', paddingBottom: '0' }}
                >
                    {TABS.map(tab => {
                        const count = tabCount(tab.id)
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    position: 'relative',
                                    padding: '0.625rem 1rem',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '0.875rem',
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                                    whiteSpace: 'nowrap',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                    transition: 'color 150ms',
                                }}
                            >
                                {tab.label}
                                {count > 0 && (
                                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '0.1rem 0.425rem', borderRadius: 999, background: isActive ? 'var(--color-primary)' : 'var(--color-border)', color: isActive ? 'white' : 'var(--color-muted)' }}>
                                        {count}
                                    </span>
                                )}
                                {/* Active underline */}
                                {isActive && (
                                    <motion.div
                                        layoutId="tab-underline"
                                        style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: 2, background: 'var(--color-primary)', borderRadius: 2 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* ── Content ──────────────────────────────────────────────────────── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                    >
                        {isLoading ? (
                            // Skeleton grid
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} style={{ height: 160, background: 'var(--color-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
                                ))}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div style={{ padding: '3.5rem', textAlign: 'center', background: 'var(--color-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                                <CalendarCheck size={40} style={{ color: 'var(--color-muted)', opacity: 0.45, marginBottom: '0.75rem' }} strokeWidth={1.5} />
                                <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.9375rem', color: 'var(--color-muted)' }}>
                                    {activeTab === 'all'
                                        ? "You haven't made any bookings yet."
                                        : `No ${activeTab} bookings found.`}
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                                {filtered.map((booking, i) => (
                                    <motion.div
                                        key={booking._id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <BookingCard
                                            booking={booking}
                                            viewerRole="customer"
                                            onCancel={() => navigate(`/customer/bookings/${booking._id}`)}
                                            onReview={() => navigate(`/customer/bookings/${booking._id}`)}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

            </div>
        </main>
    )
}
