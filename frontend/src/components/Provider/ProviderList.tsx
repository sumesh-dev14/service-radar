/**
 * ProviderList — Service Radar
 * Ref: §Component Architecture (Provider/), §Provider Discovery
 *
 * Renders a responsive grid of ProviderCards with:
 *   - Stagger entrance animation (each card delays by index * 60ms)
 *   - Loading state: SkeletonCard grid
 *   - Empty state: illustrated message with icon
 *   - AnimatePresence for smooth card add/remove transitions
 *
 * Used by:
 *   - SearchProviders page (Phase 14) — full search results grid
 *   - CustomerDashboard (Phase 15) — "Nearby Providers" section
 */

import { AnimatePresence, motion } from 'framer-motion'
import { SearchX } from 'lucide-react'
import { ProviderCard } from './ProviderCard'
import { SkeletonCard } from '@/components/Common/SkeletonCard'
import type { ProviderProfile } from '@/types/models'

// ── Stagger container variants ────────────────────────────────────────────────

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.06,
        },
    },
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ message }: { message?: string }) {
    return (
        <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
                gridColumn: '1 / -1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                padding: '4rem 2rem',
                textAlign: 'center',
                color: 'var(--color-muted)',
            }}
        >
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            >
                <SearchX
                    size={52}
                    style={{ color: 'var(--color-primary)', opacity: 0.4 }}
                    strokeWidth={1.5}
                />
            </motion.div>
            <p
                style={{
                    fontFamily: 'Lora, serif',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: 'var(--color-fg)',
                    margin: 0,
                }}
            >
                No providers found
            </p>
            <p
                style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '0.875rem',
                    margin: 0,
                    maxWidth: 320,
                    lineHeight: 1.6,
                }}
            >
                {message ??
                    'Try adjusting your filters or searching for a different service.'}
            </p>
        </motion.div>
    )
}

// ── ProviderList ──────────────────────────────────────────────────────────────

interface ProviderListProps {
    providers: ProviderProfile[]
    isLoading?: boolean
    skeletonCount?: number
    emptyMessage?: string
    /** Grid column breakpoints. Accepts a CSS grid-template-columns value */
    columns?: string
}

export function ProviderList({
    providers,
    isLoading = false,
    skeletonCount = 6,
    emptyMessage,
    columns = 'repeat(auto-fill, minmax(280px, 1fr))',
}: ProviderListProps) {

    const gridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: columns,
        gap: '1.25rem',
        alignItems: 'start',
    }

    // ── Loading state ─────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div style={gridStyle} aria-busy="true" aria-label="Loading providers">
                <SkeletonCard count={skeletonCount} />
            </div>
        )
    }

    // ── Empty state ────────────────────────────────────────────────────────────
    if (!providers.length) {
        return (
            <div style={gridStyle}>
                <AnimatePresence>
                    <EmptyState message={emptyMessage} />
                </AnimatePresence>
            </div>
        )
    }

    // ── Results grid ───────────────────────────────────────────────────────────
    return (
        <motion.div
            style={gridStyle}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            role="list"
            aria-label={`${providers.length} provider${providers.length !== 1 ? 's' : ''} found`}
        >
            <AnimatePresence mode="popLayout">
                {providers.map(provider => (
                    <div key={provider._id} role="listitem">
                        <ProviderCard provider={provider} />
                    </div>
                ))}
            </AnimatePresence>
        </motion.div>
    )
}
