/**
 * ReviewForm — Service Radar
 * Ref: §Component Architecture (Review/), §Review Endpoints, §Rating System
 *
 * Interactive form for submitting a review after a completed booking.
 * Should only be rendered when booking.status === 'completed'.
 *
 * Features:
 *   - Interactive 1–5 star rating widget (hover preview + click to lock)
 *   - Comment textarea (min 10 chars, max 500 chars, live char counter)
 *   - Submit → POST /api/reviews with { bookingId, rating, comment }
 *   - Success: toast + onSuccess() callback
 *   - Error: toast.error
 *   - Framer Motion entrance + star hover animations
 *
 * Props:
 *   bookingId   — required to associate review with a booking
 *   providerId  — displayed for context (provider being reviewed)
 *   providerName
 *   onSuccess?  — called after successful submission
 *   onCancel?   — dismiss handler
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Send, MessageSquare } from 'lucide-react'
import { useToastContext } from '@/components/Common/Toast'
import { createReview } from '@/services/reviewService'

// ── Star labels ────────────────────────────────────────────────────────────────

const STAR_LABELS: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
}

// ── Interactive star widget ────────────────────────────────────────────────────

interface StarWidgetProps {
    value: number
    onChange: (v: number) => void
}

function StarWidget({ value, onChange }: StarWidgetProps) {
    const [hovered, setHovered] = useState(0)
    const display = hovered || value

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div
                role="group"
                aria-label="Star rating"
                style={{ display: 'flex', gap: '0.375rem' }}
            >
                {[1, 2, 3, 4, 5].map(n => (
                    <motion.button
                        key={n}
                        type="button"
                        aria-label={`Rate ${n} star${n > 1 ? 's' : ''}: ${STAR_LABELS[n]}`}
                        aria-pressed={value === n}
                        onMouseEnter={() => setHovered(n)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => onChange(n)}
                        whileHover={{ scale: 1.25 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.125rem',
                            lineHeight: 1,
                        }}
                    >
                        <motion.div
                            animate={{
                                color: n <= display ? '#F59E0B' : 'var(--color-border)',
                            }}
                            transition={{ duration: 0.12 }}
                        >
                            <Star
                                size={32}
                                fill={n <= display ? '#F59E0B' : 'none'}
                                strokeWidth={1.8}
                            />
                        </motion.div>
                    </motion.button>
                ))}
            </div>

            {/* Label under stars */}
            <AnimatePresence mode="wait">
                {display > 0 && (
                    <motion.p
                        key={display}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            margin: 0,
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: '#F59E0B',
                        }}
                    >
                        {STAR_LABELS[display]}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    )
}

// ── ReviewForm ────────────────────────────────────────────────────────────────

interface ReviewFormProps {
    bookingId: string
    providerName: string
    onSuccess?: () => void
    onCancel?: () => void
}

const MIN_COMMENT = 10
const MAX_COMMENT = 500

export function ReviewForm({
    bookingId,
    providerName,
    onSuccess,
    onCancel,
}: ReviewFormProps) {
    const toast = useToastContext()

    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isValid = rating > 0 && comment.trim().length >= MIN_COMMENT
    const charsLeft = MAX_COMMENT - comment.length

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isValid || isSubmitting) return

        setIsSubmitting(true)
        try {
            await createReview({ bookingId, rating, comment: comment.trim() })
            toast.success('Review submitted — Thank you for your feedback!')
            onSuccess?.()
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to submit review'
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.5rem' }}>
                <span
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <MessageSquare size={16} color="white" />
                </span>
                <div>
                    <h2 style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '1.125rem', color: 'var(--color-fg)' }}>
                        Leave a Review
                    </h2>
                    <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                        for {providerName}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
                {/* Star rating */}
                <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-fg)', marginBottom: '0.625rem' }}>
                        Rating *
                    </label>
                    <StarWidget value={rating} onChange={setRating} />
                    {rating === 0 && (
                        <p style={{ margin: '0.375rem 0 0', fontSize: '0.75rem', fontFamily: 'Poppins, sans-serif', color: 'var(--color-muted)' }}>
                            Click a star to rate
                        </p>
                    )}
                </div>

                {/* Comment textarea */}
                <div style={{ marginBottom: '1.375rem' }}>
                    <label
                        htmlFor="review-comment"
                        style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-fg)', marginBottom: '0.4rem' }}
                    >
                        Comment *
                    </label>
                    <textarea
                        id="review-comment"
                        value={comment}
                        onChange={e => setComment(e.target.value.slice(0, MAX_COMMENT))}
                        placeholder={`Share your experience with ${providerName}…`}
                        required
                        rows={4}
                        style={{
                            width: '100%',
                            padding: '0.625rem 0.875rem',
                            borderRadius: 'var(--radius-md)',
                            border: `1px solid ${comment.trim().length > 0 && comment.trim().length < MIN_COMMENT ? 'var(--color-error)' : 'var(--color-border)'}`,
                            background: 'var(--color-bg)',
                            color: 'var(--color-fg)',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.875rem',
                            lineHeight: 1.6,
                            resize: 'vertical',
                            outline: 'none',
                            boxSizing: 'border-box',
                            transition: 'border-color 150ms',
                        }}
                        onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                        onBlur={e => (e.target.style.borderColor = comment.trim().length > 0 && comment.trim().length < MIN_COMMENT ? 'var(--color-error)' : 'var(--color-border)')}
                        aria-describedby="comment-hint"
                    />
                    <div id="comment-hint" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                        {comment.trim().length > 0 && comment.trim().length < MIN_COMMENT ? (
                            <span style={{ fontSize: '0.6875rem', fontFamily: 'Poppins, sans-serif', color: 'var(--color-error)' }}>
                                At least {MIN_COMMENT} characters required
                            </span>
                        ) : (
                            <span />
                        )}
                        <span style={{
                            fontSize: '0.6875rem',
                            fontFamily: 'Poppins, sans-serif',
                            color: charsLeft < 50 ? 'var(--color-warning)' : 'var(--color-muted)',
                            marginLeft: 'auto',
                        }}>
                            {charsLeft} / {MAX_COMMENT}
                        </span>
                    </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
                    {onCancel && (
                        <motion.button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
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
                                opacity: isSubmitting ? 0.5 : 1,
                            }}
                        >
                            Cancel
                        </motion.button>
                    )}

                    <motion.button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        whileHover={!isValid || isSubmitting ? {} : { scale: 1.03 }}
                        whileTap={!isValid || isSubmitting ? {} : { scale: 0.97 }}
                        className="btn-primary"
                        style={{
                            marginLeft: onCancel ? 0 : 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            opacity: !isValid || isSubmitting ? 0.55 : 1,
                            cursor: !isValid || isSubmitting ? 'not-allowed' : 'pointer',
                        }}
                    >
                        <Send size={14} />
                        {isSubmitting ? 'Submitting…' : 'Submit Review'}
                    </motion.button>
                </div>
            </form>
        </motion.div>
    )
}
