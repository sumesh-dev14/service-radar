/**
 * Login — Service Radar
 * Ref: §Authentication Flow, §Login Flow, Phase 12
 *
 * Real implementation — wired to authStore.login() → POST /api/auth/login
 *
 * Flow:
 *   1. Email + password form
 *   2. Submit → authStore.login() → stores JWT + user in localStorage
 *   3. Redirects: customer → /customer/dashboard, provider → /provider/dashboard
 */

import { useState, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, AlertCircle, LogIn } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useToastContext } from '@/components/Common/Toast'

// ── Login ─────────────────────────────────────────────────────────────────────

export default function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const toast = useToastContext()
    const { login, status } = useAuthStore()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [serverError, setServerError] = useState('')
    const [shakeForm, setShakeForm] = useState(false)

    const isLoading = status === 'loading'

    // Trigger one shake cycle, then reset so it can fire again on next error
    const triggerShake = useCallback(() => {
        setShakeForm(true)
        setTimeout(() => setShakeForm(false), 450)
    }, [])

    // Redirect to where they came from (e.g. ProtectedRoute sent them here)
    const from = (location.state as { from?: string } | null)?.from ?? null

    // ── Validation ──────────────────────────────────────────────────────────────

    const errors = {
        email: submitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email address' : '',
        password: submitted && password.length < 1 ? 'Password is required' : '',
    }

    // ── Submit ──────────────────────────────────────────────────────────────────

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitted(true)
        setServerError('')

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
            triggerShake()
            return
        }

        try {
            await login({ email: email.trim().toLowerCase(), password })
            // Read the role from updated store state after login
            const user = useAuthStore.getState().user
            toast.success(`Welcome back, ${user?.name?.split(' ')[0] ?? 'there'}!`)

            if (from) {
                navigate(from, { replace: true })
            } else if (user?.role === 'provider') {
                navigate('/provider/dashboard', { replace: true })
            } else {
                navigate('/customer/dashboard', { replace: true })
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Login failed'
            setServerError(message)
            triggerShake()
        }
    }

    const inputStyle = (hasError: boolean): React.CSSProperties => ({
        width: '100%',
        padding: '0.625rem 2.75rem 0.625rem 0.875rem',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${hasError ? 'var(--color-error)' : 'var(--color-border)'}`,
        background: 'var(--color-bg)',
        color: 'var(--color-fg)',
        fontFamily: 'Poppins, sans-serif',
        fontSize: '0.875rem',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 150ms',
    })

    return (
        <main style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1.5rem 2rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                style={{ width: '100%', maxWidth: 420 }}
            >
                {/* Card */}
                <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>
                            <LogIn size={22} color="white" />
                        </div>
                        <h1 style={{ margin: '0 0 0.375rem', fontFamily: 'Lora, serif', fontSize: '1.625rem', color: 'var(--color-fg)' }}>
                            Welcome Back
                        </h1>
                        <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                            Sign in to your Service Radar account
                        </p>
                    </div>

                    {/* "Came from" notice */}
                    {from && (
                        <div style={{ padding: '0.5rem 0.75rem', background: 'var(--color-primary)10', border: '1px solid var(--color-primary)25', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', color: 'var(--color-primary)' }}>
                            Please sign in to continue to that page.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className={shakeForm ? 'shake' : ''}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>

                            {/* Email */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                <label htmlFor="login-email" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-fg)' }}>
                                    Email Address
                                </label>
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    aria-required="true"
                                    aria-invalid={!!errors.email}
                                    aria-describedby={errors.email ? 'login-email-error' : undefined}
                                    style={{ ...inputStyle(!!errors.email), padding: '0.625rem 0.875rem' }}
                                    onFocus={e => { if (!errors.email) e.target.style.borderColor = 'var(--color-primary)' }}
                                    onBlur={e => { e.target.style.borderColor = errors.email ? 'var(--color-error)' : 'var(--color-border)' }}
                                />
                                {errors.email && (
                                    <p id="login-email-error" role="alert" style={{ margin: 0, fontSize: '0.6875rem', fontFamily: 'Poppins, sans-serif', color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <AlertCircle size={11} aria-hidden="true" /> {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                <label htmlFor="login-password" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-fg)' }}>
                                    Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Your password"
                                        autoComplete="current-password"
                                        aria-required="true"
                                        aria-invalid={!!errors.password}
                                        aria-describedby={errors.password ? 'login-password-error' : undefined}
                                        style={inputStyle(!!errors.password)}
                                        onFocus={e => { if (!errors.password) e.target.style.borderColor = 'var(--color-primary)' }}
                                        onBlur={e => { e.target.style.borderColor = errors.password ? 'var(--color-error)' : 'var(--color-border)' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(s => !s)}
                                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', display: 'flex' }}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p id="login-password-error" role="alert" style={{ margin: 0, fontSize: '0.6875rem', fontFamily: 'Poppins, sans-serif', color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <AlertCircle size={11} aria-hidden="true" /> {errors.password}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Server error */}
                        <AnimatePresence>
                            {serverError && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ overflow: 'hidden', marginBottom: '1rem' }}
                                >
                                    <div style={{ padding: '0.625rem 0.875rem', background: 'rgba(249,111,112,0.1)', border: '1px solid rgba(249,111,112,0.25)', borderRadius: 'var(--radius-md)', fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <AlertCircle size={15} /> {serverError}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={isLoading ? {} : { scale: 1.02 }}
                            whileTap={isLoading ? {} : { scale: 0.98 }}
                            className="btn-primary"
                            style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                        >
                            {isLoading ? 'Signing in…' : (
                                <>Sign In <ArrowRight size={16} /></>
                            )}
                        </motion.button>
                    </form>
                </div>

                {/* Register link */}
                <p style={{ textAlign: 'center', marginTop: '1.25rem', fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                        Create one
                    </Link>
                </p>
            </motion.div>
        </main>
    )
}
