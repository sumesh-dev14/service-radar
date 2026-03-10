/**
 * ProviderCard — Service Radar
 * Ref: §Component Architecture (Provider/), §Provider Discovery, §UI/UX Design Patterns
 *
 * Displays a single provider in the search results grid.
 *
 * Shows:
 *   - Provider name (from populated userId.name)
 *   - Category badge (from populated categoryId.name)
 *   - Availability pill (green = available, red = unavailable)
 *   - Bio excerpt (2 lines clamped)
 *   - Star rating + total reviews
 *   - Price per hour
 *   - Distance (if lat/lng was provided to search API)
 *   - "Book Now" CTA (navigates to /provider/:id)
 *
 * Animations:
 *   - Scale + shadow on hover (Framer Motion)
 *   - Button scale on press
 *   - Stagger animation applied by parent (ProviderList)
 */

import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Star, MapPin, Clock, DollarSign } from 'lucide-react'
import {
    type ProviderProfile,
    isPopulatedUser,
    isPopulatedCategory,
} from '@/types/models'

// ── Star Rating ───────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
    return (
        <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}
            aria-label={`Rating: ${rating.toFixed(1)} out of 5`}
        >
            {[1, 2, 3, 4, 5].map(n => {
                const filled = n <= Math.floor(rating)
                const partial = !filled && n === Math.ceil(rating) && rating % 1 >= 0.5
                return (
                    <Star
                        key={n}
                        size={13}
                        style={{
                            color:
                                filled || partial
                                    ? 'var(--color-warning)'
                                    : 'var(--color-border)',
                            fill:
                                filled
                                    ? 'var(--color-warning)'
                                    : partial
                                        ? 'var(--color-warning)'
                                        : 'none',
                            transition: 'all 150ms',
                        }}
                    />
                )
            })}
        </div>
    )
}

// ── ProviderCard ──────────────────────────────────────────────────────────────

interface ProviderCardProps {
    provider: ProviderProfile
}

export function ProviderCard({ provider }: ProviderCardProps) {
    const navigate = useNavigate()

    // Safely unwrap populated vs string fields
    const name = isPopulatedUser(provider.userId) ? provider.userId.name : 'Provider'
    const categoryName = isPopulatedCategory(provider.categoryId)
        ? provider.categoryId.name
        : 'Service'

    const initials = name
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    const handleView = () => navigate(`/provider/${provider._id}`)

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            style={{
                background: 'var(--color-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
                transition: 'box-shadow 200ms ease',
            }}
            onHoverStart={e => {
                const el = e.target as HTMLElement
                const card = el.closest('article') as HTMLElement
                if (card) card.style.boxShadow = 'var(--shadow-lg)'
            }}
            onHoverEnd={e => {
                const el = e.target as HTMLElement
                const card = el.closest('article') as HTMLElement
                if (card) card.style.boxShadow = 'var(--shadow-sm)'
            }}
            onClick={handleView}
            role="article"
            aria-label={`${name}, ${categoryName}`}
        >
            {/* Decorative gradient accent top-right */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: -24,
                    right: -24,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background:
                        'radial-gradient(circle, var(--color-primary)22 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />

            {/* ── Header row: avatar + name + availability ───────────────────── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                {/* Avatar initials */}
                <div
                    aria-hidden="true"
                    style={{
                        width: 46,
                        height: 46,
                        borderRadius: '50%',
                        background:
                            'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        color: 'white',
                        letterSpacing: '0.05em',
                    }}
                >
                    {initials}
                </div>

                {/* Name + category */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                        style={{
                            margin: 0,
                            fontFamily: 'Lora, serif',
                            fontWeight: 600,
                            fontSize: '1rem',
                            color: 'var(--color-fg)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {name}
                    </h3>

                    <span
                        style={{
                            display: 'inline-block',
                            marginTop: '0.25rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: 999,
                            background: 'var(--color-primary)18',
                            border: '1px solid var(--color-primary)30',
                            fontSize: '0.6875rem',
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 500,
                            color: 'var(--color-primary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                        }}
                    >
                        {categoryName}
                    </span>
                </div>

                {/* Availability pill */}
                <span
                    aria-label={provider.isAvailable ? 'Available' : 'Unavailable'}
                    style={{
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.25rem 0.625rem',
                        borderRadius: 999,
                        background: provider.isAvailable
                            ? 'rgba(16,185,129,0.12)'
                            : 'rgba(249,111,112,0.12)',
                        border: `1px solid ${provider.isAvailable ? 'rgba(16,185,129,0.25)' : 'rgba(249,111,112,0.25)'}`,
                        fontSize: '0.6875rem',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 500,
                        color: provider.isAvailable ? 'var(--color-success)' : 'var(--color-error)',
                    }}
                >
                    <Clock size={11} />
                    {provider.isAvailable ? 'Open' : 'Busy'}
                </span>
            </div>

            {/* ── Bio excerpt ────────────────────────────────────────────────── */}
            <p
                style={{
                    margin: 0,
                    fontSize: '0.8125rem',
                    fontFamily: 'Poppins, sans-serif',
                    color: 'var(--color-muted)',
                    lineHeight: 1.55,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}
            >
                {provider.bio || 'No bio provided.'}
            </p>

            {/* ── Stats row: rating + price + distance ───────────────────────── */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                }}
            >
                {/* Star rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <StarRating rating={provider.rating} />
                    <span
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            color: 'var(--color-fg)',
                        }}
                    >
                        {provider.rating > 0 ? provider.rating.toFixed(1) : '—'}
                    </span>
                    {provider.totalReviews > 0 && (
                        <span
                            style={{
                                fontSize: '0.6875rem',
                                fontFamily: 'Poppins, sans-serif',
                                color: 'var(--color-muted)',
                            }}
                        >
                            ({provider.totalReviews})
                        </span>
                    )}
                </div>

                <div style={{ flex: 1 }} />

                {/* Distance (if available) */}
                {typeof provider.distance === 'number' && (
                    <span
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            fontSize: '0.75rem',
                            fontFamily: 'Poppins, sans-serif',
                            color: 'var(--color-muted)',
                        }}
                    >
                        <MapPin size={11} />
                        {provider.distance < 1
                            ? `${(provider.distance * 1000).toFixed(0)}m`
                            : `${provider.distance.toFixed(1)}km`}
                    </span>
                )}
            </div>

            {/* ── Divider ────────────────────────────────────────────────────── */}
            <div style={{ height: 1, background: 'var(--color-border)' }} />

            {/* ── Footer: price + CTA ────────────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                    <DollarSign size={14} style={{ color: 'var(--color-primary)', marginBottom: -1 }} />
                    <span
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 700,
                            fontSize: '1.125rem',
                            color: 'var(--color-fg)',
                        }}
                    >
                        {provider.price}
                    </span>
                    <span
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.6875rem',
                            color: 'var(--color-muted)',
                        }}
                    >
                        /hr
                    </span>
                </div>

                {/* CTA Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={e => {
                        e.stopPropagation()
                        handleView()
                    }}
                    className="btn-primary"
                    style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                    aria-label={`View ${name}'s profile and book`}
                >
                    Book Now
                </motion.button>
            </div>
        </motion.article>
    )
}
