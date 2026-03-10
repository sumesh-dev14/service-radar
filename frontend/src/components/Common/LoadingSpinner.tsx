/**
 * LoadingSpinner — Service Radar
 * Ref: §Component Architecture (Common/)
 *
 * Centered full-page spinner for route-level loading states.
 * Uses design system primary color via CSS variable.
 *
 * Variants:
 *   full   — fills 100vh (default, for page-level)
 *   inline — fits content area (for section-level)
 *   sm     — small 20px (for buttons)
 */

interface LoadingSpinnerProps {
    variant?: 'full' | 'inline' | 'sm'
    label?: string
}

export function LoadingSpinner({
    variant = 'full',
    label = 'Loading…',
}: LoadingSpinnerProps) {
    const sizes = { full: 40, inline: 32, sm: 18 }
    const size = sizes[variant]

    const wrapperStyle: React.CSSProperties =
        variant === 'full'
            ? {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                gap: '1rem',
                background: 'var(--color-bg)',
            }
            : {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                gap: '0.75rem',
            }

    return (
        <div style={wrapperStyle} role="status" aria-label={label}>
            <div
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    border: `3px solid var(--color-border)`,
                    borderTopColor: 'var(--color-primary)',
                    animation: 'spin 0.7s linear infinite',
                    flexShrink: 0,
                }}
            />
            {variant === 'full' && (
                <p
                    style={{
                        color: 'var(--color-muted)',
                        fontSize: '0.875rem',
                        fontFamily: 'Poppins, sans-serif',
                    }}
                >
                    {label}
                </p>
            )}
            <span className="sr-only">{label}</span>
        </div>
    )
}
