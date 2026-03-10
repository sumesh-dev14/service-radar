/**
 * BookingForm — Service Radar
 * Ref: §Booking System, §User Journey Flows (Booking Phase), §Booking Endpoints
 *
 * Multi-step booking form shown on the ProviderDetail page (Phase 14).
 *
 * Steps:
 *   1. Confirm  — shows provider name, category, price/hr; user confirms
 *   2. Schedule — date + time picker for `scheduledAt` (ISO string)
 *   3. Review   — summary of all details before submitting
 *
 * On submit: calls POST /api/bookings → on success: navigate to /customer/bookings
 *
 * Props:
 *   providerId   — ProviderProfile._id
 *   categoryId   — category _id string
 *   providerName — display name
 *   categoryName — display name
 *   price        — hourly rate
 *   onSuccess?   — optional callback after booking is created
 *   onCancel?    — optional close handler (e.g. close a modal)
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Calendar, Check, User, Tag, DollarSign } from 'lucide-react'
import { useToastContext } from '@/components/Common/Toast'
import { createBooking } from '@/services/bookingService'
import { useEscapeKey } from '@/hooks'

// ── Total steps ───────────────────────────────────────────────────────────────

const STEPS = ['Confirm', 'Schedule', 'Review'] as const
type Step = 0 | 1 | 2

// ── Progress bar ──────────────────────────────────────────────────────────────

function StepProgress({ current }: { current: Step }) {
    return (
        <div role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={3} aria-label="Booking progress">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '1.5rem' }}>
                {STEPS.map((label, i) => {
                    const done = i < current
                    const active = i === current
                    return (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
                            {/* Step dot */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                <motion.div
                                    animate={{
                                        background: done
                                            ? 'var(--color-success)'
                                            : active
                                                ? 'var(--color-primary)'
                                                : 'var(--color-border)',
                                        scale: active ? 1.15 : 1,
                                    }}
                                    transition={{ duration: 0.25 }}
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: done || active ? 'white' : 'var(--color-muted)',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                    }}
                                >
                                    {done ? <Check size={14} /> : i + 1}
                                </motion.div>
                                <span style={{
                                    fontSize: '0.625rem',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontWeight: active ? 600 : 400,
                                    color: active ? 'var(--color-primary)' : 'var(--color-muted)',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {label}
                                </span>
                            </div>
                            {/* Connector line */}
                            {i < STEPS.length - 1 && (
                                <motion.div
                                    animate={{ background: done ? 'var(--color-primary)' : 'var(--color-border)' }}
                                    transition={{ duration: 0.3 }}
                                    style={{ flex: 1, height: 2, marginBottom: 18 }}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ── Step panels ───────────────────────────────────────────────────────────────

const panelVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 50 : -50, opacity: 0 }),
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-primary)', display: 'flex', flexShrink: 0 }} aria-hidden="true">{icon}</span>
            <span style={{ fontSize: '0.8125rem', fontFamily: 'Poppins, sans-serif', color: 'var(--color-muted)', flex: 1 }}>{label}</span>
            <span style={{ fontSize: '0.8125rem', fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: 'var(--color-fg)' }}>{value}</span>
        </div>
    )
}

// ── BookingForm ───────────────────────────────────────────────────────────────

interface BookingFormProps {
    providerId: string
    categoryId: string
    providerName: string
    categoryName: string
    price: number
    onSuccess?: () => void
    onCancel?: () => void
}

export function BookingForm({
    providerId,
    categoryId,
    providerName,
    categoryName,
    price,
    onSuccess,
    onCancel,
}: BookingFormProps) {
    const navigate = useNavigate()
    const toast = useToastContext()

    const [step, setStep] = useState<Step>(0)
    const [direction, setDirection] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Step 2 state
    const [date, setDate] = useState('')
    const [time, setTime] = useState('09:00')

    // ── Validation ──────────────────────────────────────────────────────────────

    const canAdvance = step !== 1 || (date !== '' && time !== '')

    // ── Navigation ──────────────────────────────────────────────────────────────

    const goNext = () => {
        if (!canAdvance) return
        setDirection(1)
        setStep(s => (s + 1) as Step)
    }

    const goPrev = () => {
        setDirection(-1)
        setStep(s => (s - 1) as Step)
    }

    // ── Submit ──────────────────────────────────────────────────────────────────

    // Escape key closes the form at step 0 (18.7 keyboard navigation)
    useEscapeKey(() => {
        if (step === 0 && onCancel) onCancel()
    }, step === 0 && !isSubmitting)

    const handleSubmit = async () => {
        if (!date || !time) return
        setIsSubmitting(true)
        try {
            // Combine date + time into ISO string
            const scheduledAt = new Date(`${date}T${time}:00`).toISOString()
            await createBooking({ providerId, categoryId, scheduledAt })
            toast.success('Booking created! The provider will confirm shortly.')
            if (onSuccess) onSuccess()
            else navigate('/customer/bookings')
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create booking'
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    // ── Formatted scheduled date for review step ────────────────────────────────

    const formattedScheduled = date
        ? new Date(`${date}T${time}:00`).toLocaleString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : '—'

    // ── Today minimum for date picker ─────────────────────────────────────────

    const today = new Date().toISOString().split('T')[0]

    // ── Input style ────────────────────────────────────────────────────────────

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.625rem 0.875rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
        color: 'var(--color-fg)',
        fontFamily: 'Poppins, sans-serif',
        fontSize: '0.875rem',
        outline: 'none',
        boxSizing: 'border-box',
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Book a service"
            style={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                maxWidth: 480,
                width: '100%',
                boxShadow: 'var(--shadow-md)',
            }}
        >
            {/* Header */}
            <h2 style={{ margin: '0 0 1.5rem', fontFamily: 'Lora, serif', fontSize: '1.25rem', color: 'var(--color-fg)' }}>
                Book a Service
            </h2>

            {/* Step progress */}
            <StepProgress current={step} />

            {/* Step panels */}
            <div style={{ overflow: 'hidden', minHeight: 200, position: 'relative' }}>
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={panelVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: 'spring', stiffness: 400, damping: 38 }}
                    >
                        {/* ── Step 0: Confirm provider ─────────────────────────────── */}
                        {step === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
                                    You are about to book a service. Please review the details below.
                                </p>
                                <div style={{ padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                                    <SummaryRow icon={<User size={15} />} label="Provider" value={providerName} />
                                    <SummaryRow icon={<Tag size={15} />} label="Service" value={categoryName} />
                                    <SummaryRow icon={<DollarSign size={15} />} label="Rate" value={`$${price}/hr`} />
                                </div>
                            </div>
                        )}

                        {/* ── Step 1: Schedule ─────────────────────────────────────── */}
                        {step === 1 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                                    Choose your preferred date and time.
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                    <label htmlFor="booking-date" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-fg)' }}>
                                        Date *
                                    </label>
                                    <input
                                        id="booking-date"
                                        type="date"
                                        value={date}
                                        min={today}
                                        onChange={e => setDate(e.target.value)}
                                        style={inputStyle}
                                        required
                                        aria-required="true"
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                    <label htmlFor="booking-time" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-fg)' }}>
                                        Time *
                                    </label>
                                    <input
                                        id="booking-time"
                                        type="time"
                                        value={time}
                                        onChange={e => setTime(e.target.value)}
                                        style={inputStyle}
                                        required
                                        aria-required="true"
                                    />
                                </div>
                                {date === '' && (
                                    <p style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'Poppins, sans-serif', color: 'var(--color-error)' }}>
                                        Please select a date to continue.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* ── Step 2: Review & confirm ─────────────────────────────── */}
                        {step === 2 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
                                    Review your booking before confirming.
                                </p>
                                <div style={{ padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                                    <SummaryRow icon={<User size={15} />} label="Provider" value={providerName} />
                                    <SummaryRow icon={<Tag size={15} />} label="Service" value={categoryName} />
                                    <SummaryRow icon={<DollarSign size={15} />} label="Rate" value={`$${price}/hr`} />
                                    <SummaryRow icon={<Calendar size={15} />} label="Scheduled" value={formattedScheduled} />
                                </div>
                                <div style={{ padding: '0.75rem', background: 'rgba(245,158,11,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245,158,11,0.25)' }}>
                                    <p style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'Poppins, sans-serif', color: '#B45309', lineHeight: 1.5 }}>
                                        ⚠️ The provider must <strong>accept</strong> your booking before it is confirmed.
                                        You will see the status update in your bookings page.
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── Navigation buttons ───────────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.75rem', gap: '0.75rem' }}>
                {/* Back / Cancel */}
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={step === 0 ? onCancel : goPrev}
                    disabled={isSubmitting}
                    style={{
                        background: 'none',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.6rem 1.25rem',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        color: 'var(--color-fg)',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        opacity: isSubmitting ? 0.5 : 1,
                    }}
                >
                    {step > 0 && <ChevronLeft size={15} />}
                    {step === 0 ? 'Cancel' : 'Back'}
                </motion.button>

                {/* Next / Submit */}
                <motion.button
                    whileHover={!canAdvance || isSubmitting ? {} : { scale: 1.03 }}
                    whileTap={!canAdvance || isSubmitting ? {} : { scale: 0.97 }}
                    onClick={step === 2 ? handleSubmit : goNext}
                    disabled={!canAdvance || isSubmitting}
                    className="btn-primary"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        opacity: !canAdvance || isSubmitting ? 0.55 : 1,
                        cursor: !canAdvance || isSubmitting ? 'not-allowed' : 'pointer',
                    }}
                >
                    {step === 2 ? (
                        isSubmitting ? 'Booking…' : (
                            <><Check size={15} /> Confirm Booking</>
                        )
                    ) : (
                        <>Next <ChevronRight size={15} /></>
                    )}
                </motion.button>
            </div>
        </div>
    )
}
