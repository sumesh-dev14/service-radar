/**
 * NotFound — 404 Page — Service Radar
 * Ref: §Navigation & Routes, Phase 13
 *
 * Shown for any unmatched route.
 * Features:
 *   - Animated 404 number with glitch pulse
 *   - Helpful links: Home, Search, Login
 *   - Framer Motion entrance
 */

import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    const navigate = useNavigate()

    return (
        <main
            style={{
                minHeight: '100vh',
                background: 'var(--color-bg)',
                color: 'var(--color-fg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background blobs */}
            <div aria-hidden="true" style={{ position: 'absolute', top: '15%', left: '10%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, var(--color-primary)15 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div aria-hidden="true" style={{ position: 'absolute', bottom: '10%', right: '8%', width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, var(--color-secondary)12 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* 404 numeral */}
            <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
                <motion.h1
                    animate={{ opacity: [1, 0.85, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        margin: '0 0 0.25rem',
                        fontFamily: 'Lora, serif',
                        fontWeight: 700,
                        fontSize: 'clamp(6rem, 18vw, 10rem)',
                        lineHeight: 1,
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                    aria-label="Error 404"
                >
                    404
                </motion.h1>
            </motion.div>

            {/* Text */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}
            >
                <h2 style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-fg)' }}>
                    Page not found
                </h2>
                <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.9375rem', color: 'var(--color-muted)', maxWidth: 360, lineHeight: 1.65 }}>
                    The page you're looking for doesn't exist or may have been moved. Here are some helpful links:
                </p>
            </motion.div>

            {/* Action buttons */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', justifyContent: 'center' }}
            >
                <motion.button
                    onClick={() => navigate(-1)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.625rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        background: 'transparent',
                        color: 'var(--color-fg)',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                    }}
                    aria-label="Go back"
                >
                    <ArrowLeft size={15} /> Go Back
                </motion.button>

                <Link
                    to="/"
                    className="btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
                >
                    <Home size={15} /> Home
                </Link>

                <Link
                    to="/search"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.625rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        background: 'transparent',
                        color: 'var(--color-fg)',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        textDecoration: 'none',
                    }}
                >
                    <Search size={15} /> Search Providers
                </Link>
            </motion.div>
        </main>
    )
}
