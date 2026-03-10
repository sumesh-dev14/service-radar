/**
 * SkeletonCard — Service Radar
 * Ref: §Component Architecture (Common/), §Animations & Transitions
 *
 * Shimmer placeholder shown while provider cards are loading.
 * Matches the layout of ProviderCard (Phase 9) to prevent layout shift.
 *
 * Uses `.skeleton` CSS class from index.css (animated gradient sweep).
 */

interface SkeletonCardProps {
    count?: number
}

function SingleSkeletonCard() {
    return (
        <div
            style={{
                background: 'var(--color-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
            }}
            aria-hidden="true"
        >
            {/* Avatar + title row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                    className="skeleton"
                    style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0 }}
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div className="skeleton" style={{ height: 16, width: '60%', borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 4 }} />
                </div>
            </div>

            {/* Bio lines */}
            <div className="skeleton" style={{ height: 12, width: '100%', borderRadius: 4 }} />
            <div className="skeleton" style={{ height: 12, width: '85%', borderRadius: 4 }} />

            {/* Rating + price row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <div className="skeleton" style={{ height: 20, width: 100, borderRadius: 12 }} />
                <div className="skeleton" style={{ height: 20, width: 70, borderRadius: 4 }} />
            </div>

            {/* CTA button */}
            <div className="skeleton" style={{ height: 38, width: '100%', borderRadius: 8, marginTop: '0.25rem' }} />
        </div>
    )
}

export function SkeletonCard({ count = 1 }: SkeletonCardProps) {
    return (
        <>
            {Array.from({ length: count }, (_, i) => (
                <SingleSkeletonCard key={i} />
            ))}
        </>
    )
}
