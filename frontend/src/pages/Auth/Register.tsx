/**
 * Register — Service Radar
 * Ref: §Authentication Flow, §Registration Flow, Phase 12
 *
 * Real implementation — wired to authStore.register() → POST /api/auth/register
 *
 * Flow:
 *   1. User picks role (Customer or Provider)
 *   2. Fills name, email, password, confirm password
 *   3. Submit → authStore.register() → stores JWT + user in localStorage
 *   4. Customer  → /customer/dashboard
 *      Provider  → /provider/dashboard  (then prompted to create profile)
 */

import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Briefcase, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useToastContext } from '@/components/Common/Toast'
import type { UserRole } from '@/types/models'

// ── Field component ───────────────────────────────────────────────────────────

interface FieldProps {
    id: string
    label: string
    type?: string
    value: string
    onChange: (v: string) => void
    placeholder?: string
    error?: string
    autoComplete?: string
    trailing?: React.ReactNode
}

function Field({ id, label, type = 'text', value, onChange, placeholder, error, autoComplete, trailing }: FieldProps) {
    const errorId = error ? `${id}-error` : undefined
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label htmlFor={id} style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-fg)' }}>
                {label}
            </label>
            <div style={{ position: 'relative' }}>
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    aria-required="true"
                    aria-invalid={!!error}
                    aria-describedby={errorId}
                    style={{
                        width: '100%',
                        padding: trailing ? '0.625rem 2.75rem 0.625rem 0.875rem' : '0.625rem 0.875rem',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
                        background: 'var(--color-bg)',
                        color: 'var(--color-fg)',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '0.875rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 150ms',
                    }}
                    onFocus={e => { if (!error) e.target.style.borderColor = 'var(--color-primary)' }}
                    onBlur={e => { e.target.style.borderColor = error ? 'var(--color-error)' : 'var(--color-border)' }}
                />
                {trailing && (
                    <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                        {trailing}
                    </div>
                )}
            </div>
            {error && (
                <p id={errorId} role="alert" style={{ margin: 0, fontSize: '0.6875rem', fontFamily: 'Poppins, sans-serif', color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertCircle size={11} aria-hidden="true" /> {error}
                </p>
            )}
        </div>
    )
}

// ── Register ──────────────────────────────────────────────────────────────────

export default function Register() {
    const navigate = useNavigate()
    const toast = useToastContext()
    const { register, status } = useAuthStore()

    const [role, setRole] = useState<UserRole>('customer')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [serverError, setServerError] = useState('')
    const [shakeForm, setShakeForm] = useState(false)

    const isLoading = status === 'loading'

    // Trigger one shake cycle, then reset so it can fire again on next error
    const triggerShake = useCallback(() => {
        setShakeForm(true)
        setTimeout(() => setShakeForm(false), 450)
    }, [])

    // ── Validation ──────────────────────────────────────────────────────────────

    const errors = {
        name: submitted && name.trim().length < 2 ? 'Name must be at least 2 characters' : '',
        email: submitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email address' : '',
        password: submitted && password.length < 6 ? 'Password must be at least 6 characters' : '',
        confirm: submitted && confirm !== password ? 'Passwords do not match' : '',
    }
    const hasErrors = Object.values(errors).some(Boolean)

    // ── Submit ──────────────────────────────────────────────────────────────────

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitted(true)
        setServerError('')

        if (name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6 || confirm !== password) {
            triggerShake()
            return
        }

        try {
            await register({ name: name.trim(), email: email.trim().toLowerCase(), password, role })
            toast.success(`Welcome, ${name.split(' ')[0]}! Your account is ready.`)
            if (role === 'provider') {
                navigate('/provider/dashboard')
            } else {
                navigate('/customer/dashboard')
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Registration failed'
            setServerError(message)
            triggerShake()
        }
    }

    // ── Role card ───────────────────────────────────────────────────────────────

    const RoleCard = ({ r, icon, title, desc }: { r: UserRole; icon: React.ReactNode; title: string; desc: string }) => (
        <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setRole(r)}
            style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 0.75rem',
                borderRadius: 'var(--radius-lg)',
                border: `2px solid ${role === r ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: role === r ? 'var(--color-primary)10' : 'var(--color-bg)',
                cursor: 'pointer',
                transition: 'all 200ms ease',
            }}
            aria-pressed={role === r}
            aria-label={`Register as ${title}`}
        >
            <span style={{ color: role === r ? 'var(--color-primary)' : 'var(--color-muted)', transition: 'color 200ms' }}>
                {icon}
            </span>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: role === r ? 'var(--color-primary)' : 'var(--color-fg)' }}>
                {title}
            </span>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.6875rem', color: 'var(--color-muted)', textAlign: 'center', lineHeight: 1.4 }}>
                {desc}
            </span>
        </motion.button>
    )

    return (
        <main style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1.5rem 2rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                style={{ width: '100%', maxWidth: 440 }}
            >
                {/* Card */}
                <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                        <h1 style={{ margin: '0 0 0.375rem', fontFamily: 'Lora, serif', fontSize: '1.625rem', color: 'var(--color-fg)' }}>
                            Create Account
                        </h1>
                        <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                            Join Service Radar — find or offer services
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate className={shakeForm ? 'shake' : ''}>

                        {/* Role selector */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ margin: '0 0 0.625rem', fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-fg)' }}>
                                I want to…
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <RoleCard r="customer" icon={<User size={22} />} title="Find Services" desc="Book trusted local providers" />
                                <RoleCard r="provider" icon={<Briefcase size={22} />} title="Offer Services" desc="List your skills and get booked" />
                            </div>
                        </div>

                        {/* Fields */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                            <Field
                                id="reg-name"
                                label="Full Name"
                                value={name}
                                onChange={setName}
                                placeholder="Sarah Johnson"
                                error={errors.name}
                                autoComplete="name"
                            />
                            <Field
                                id="reg-email"
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={setEmail}
                                placeholder="you@example.com"
                                error={errors.email}
                                autoComplete="email"
                            />
                            <Field
                                id="reg-password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={setPassword}
                                placeholder="At least 6 characters"
                                error={errors.password}
                                autoComplete="new-password"
                                trailing={
                                    <button type="button" onClick={() => setShowPassword(s => !s)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', padding: 0, display: 'flex' }}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                }
                            />
                            <Field
                                id="reg-confirm"
                                label="Confirm Password"
                                type={showConfirm ? 'text' : 'password'}
                                value={confirm}
                                onChange={setConfirm}
                                placeholder="Repeat password"
                                error={errors.confirm}
                                autoComplete="new-password"
                                trailing={
                                    <button type="button" onClick={() => setShowConfirm(s => !s)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', padding: 0, display: 'flex' }}
                                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                }
                            />
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
                            disabled={isLoading || (submitted && hasErrors)}
                            whileHover={isLoading ? {} : { scale: 1.02 }}
                            whileTap={isLoading ? {} : { scale: 0.98 }}
                            className="btn-primary"
                            style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                        >
                            {isLoading ? 'Creating account…' : (
                                <>
                                    Create {role === 'provider' ? 'Provider' : 'Customer'} Account
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>

                {/* Login link */}
                <p style={{ textAlign: 'center', marginTop: '1.25rem', fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </main>
    )
}
