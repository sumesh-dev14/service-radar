/**
 * Home — Service Radar Landing Page
 * Ref: §Guest Journey Flow, §Provider Discovery, Phase 13
 *
 * Sections:
 *   1. Hero           — tagline + primary CTA (Find a Provider / Offer Your Services)
 *   2. Category Grid  — live from GET /api/categories (clicky tiles → /search?category=id)
 *   3. Featured       — top 6 live providers from GET /providers?limit=6
 *   4. How it works   — 3-step explainer
 *   5. Provider CTA   — join as a provider
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ShieldCheck, CalendarCheck, Wrench, Zap, Brush, Flame, Leaf, Hammer, Star } from 'lucide-react'
import { useProviderStore } from '@/store/providerStore'
import { ProviderList } from '@/components/Provider'
import { getCategories } from '@/services/categoryService'
import type { Category } from '@/types/models'

// ── Category icon map (maps name → Lucide icon) ───────────────────────────────

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    plumbing: <Wrench size={26} strokeWidth={1.7} />,
    electrical: <Zap size={26} strokeWidth={1.7} />,
    cleaning: <Brush size={26} strokeWidth={1.7} />,
    hvac: <Flame size={26} strokeWidth={1.7} />,
    gardening: <Leaf size={26} strokeWidth={1.7} />,
    carpentry: <Hammer size={26} strokeWidth={1.7} />,
    default: <Star size={26} strokeWidth={1.7} />,
}

function categoryIcon(name: string) {
    const key = name.toLowerCase().replace(/\s+/g, '')
    return CATEGORY_ICONS[key] ?? CATEGORY_ICONS.default
}

const CATEGORY_GRADIENTS = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
    'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    'linear-gradient(135deg, #fccb90, #d57eeb)',
    'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
]

// ── How it works steps ────────────────────────────────────────────────────────

const HOW_STEPS = [
    {
        icon: <Search size={28} strokeWidth={1.8} />,
        title: 'Search',
        desc: 'Browse verified local providers by category, rating, or distance.',
    },
    {
        icon: <CalendarCheck size={28} strokeWidth={1.8} />,
        title: 'Book',
        desc: 'Pick a date and time. The provider confirms your booking directly.',
    },
    {
        icon: <ShieldCheck size={28} strokeWidth={1.8} />,
        title: 'Done',
        desc: 'Service completed. Leave a review to help the community.',
    },
]

// ── Home ──────────────────────────────────────────────────────────────────────

export default function Home() {
    const navigate = useNavigate()
    const { providers, isLoading, searchProviders } = useProviderStore()
    const [categories, setCategories] = useState<Category[]>([])
    const [catsLoading, setCatsLoading] = useState(true)

    useEffect(() => {
        // Both fetches run in parallel on mount
        searchProviders({ limit: 6 })
        getCategories()
            .then(setCategories)
            .catch(() => { }) // silently ignore (API may not have categories seeded)
            .finally(() => setCatsLoading(false))
    }, [searchProviders])

    return (
        <main style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-fg)' }}>

            {/* ── Hero ──────────────────────────────────────────────────────────── */}
            <section style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.25rem',
                padding: '7rem 1.5rem 4rem',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div aria-hidden="true" style={{ position: 'absolute', top: '-10%', left: '10%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, var(--color-primary)18 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div aria-hidden="true" style={{ position: 'absolute', bottom: '0%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, var(--color-secondary)14 0%, transparent 70%)', pointerEvents: 'none' }} />

                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                    style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Local Services, Trusted Providers
                </motion.p>

                <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    style={{ margin: 0, fontFamily: 'Lora, serif', fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3.25rem)', lineHeight: 1.2, maxWidth: 620, color: 'var(--color-fg)' }}>
                    Find & Book Trusted Local Service Providers
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '1rem', color: 'var(--color-muted)', maxWidth: 480, lineHeight: 1.65 }}>
                    From plumbing to cleaning — connect with verified professionals in your area. Book in minutes.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link to="/search" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem' }}>
                        <Search size={16} /> Find a Provider
                    </Link>
                    <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.375rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-fg)', fontFamily: 'Poppins, sans-serif', fontWeight: 500, fontSize: '0.9375rem', textDecoration: 'none' }}>
                        Offer Your Services →
                    </Link>
                </motion.div>
            </section>

            {/* ── Category Grid ─────────────────────────────────────────────────── */}
            {(catsLoading || categories.length > 0) && (
                <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
                    <h2 style={{ fontFamily: 'Lora, serif', fontSize: '1.375rem', marginBottom: '1.5rem', color: 'var(--color-fg)' }}>
                        Browse by Category
                    </h2>

                    {catsLoading ? (
                        // Skeleton tiles
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} style={{ height: 120, borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', border: '1px solid var(--color-border)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                            {categories.map((cat, i) => (
                                <motion.button
                                    key={cat._id}
                                    onClick={() => navigate(`/search?category=${cat._id}`)}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ scale: 1.04, y: -3 }}
                                    whileTap={{ scale: 0.97 }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.75rem',
                                        padding: '1.375rem 0.75rem',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--color-border)',
                                        background: 'var(--color-card)',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        boxShadow: 'var(--shadow-sm)',
                                        transition: 'box-shadow 200ms',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
                                    aria-label={`Browse ${cat.name} providers`}
                                >
                                    {/* Icon circle with gradient */}
                                    <div style={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: '50%',
                                        background: CATEGORY_GRADIENTS[i % CATEGORY_GRADIENTS.length],
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        flexShrink: 0,
                                    }}>
                                        {categoryIcon(cat.name)}
                                    </div>
                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--color-fg)', lineHeight: 1.3 }}>
                                        {cat.name}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* ── Featured Providers (live data) ────────────────────────────────── */}
            <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h2 style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '1.375rem', color: 'var(--color-fg)' }}>
                        Featured Providers
                    </h2>
                    <Link to="/search" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none' }}>
                        View all →
                    </Link>
                </div>
                <ProviderList
                    providers={providers}
                    isLoading={isLoading}
                    skeletonCount={6}
                    emptyMessage="No providers have registered yet. Be the first to offer a service!"
                />
            </section>

            {/* ── How it works ──────────────────────────────────────────────────── */}
            <section style={{ background: 'var(--color-card)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '4rem 1.5rem' }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', fontFamily: 'Lora, serif', fontSize: '1.375rem', marginBottom: '2.5rem', color: 'var(--color-fg)' }}>
                        How It Works
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
                        {HOW_STEPS.map((step, i) => (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.875rem', textAlign: 'center' }}
                            >
                                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-primary)15', border: '1px solid var(--color-primary)25', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                                    {step.icon}
                                </div>
                                <div style={{ fontFamily: 'Lora, serif', fontWeight: 600, fontSize: '1rem', color: 'var(--color-fg)' }}>
                                    {i + 1}. {step.title}
                                </div>
                                <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
                                    {step.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Provider CTA ──────────────────────────────────────────────────── */}
            <section style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}
                >
                    <h2 style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '1.625rem', color: 'var(--color-fg)' }}>
                        Are you a service professional?
                    </h2>
                    <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.9375rem', color: 'var(--color-muted)', lineHeight: 1.65 }}>
                        Register as a provider, set up your profile, and start getting booked by customers in your area.
                    </p>
                    <Link to="/register" className="btn-primary" style={{ fontSize: '0.9375rem' }}>
                        Join as a Provider
                    </Link>
                </motion.div>
            </section>

        </main>
    )
}
