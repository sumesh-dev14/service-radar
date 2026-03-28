/**
 * Provider Profile — Service Radar
 * Ref: §Provider Endpoints, §Key Features (Provider Management), Phase 16
 *
 * Two modes (auto-detected from providerStore.myProfile):
 *
 * CREATE mode (no profile yet):
 *   Form: bio, category (dropdown from API), price ($/hr), location (geolocation button or manual lat/lng)
 *   → POST /api/providers/profile
 *
 * EDIT mode (profile exists):
 *   Pre-filled form: bio + price only (category/location locked after creation)
 *   → PUT /api/providers/profile
 *
 * Displays current profile card below form when in EDIT mode.
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LocateFixed, Loader2, CheckCircle2, AlertCircle, ChevronLeft, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useProviderStore } from '@/store/providerStore'
import { getCategories } from '@/services/categoryService'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useToastContext } from '@/components/Common/Toast'
import type { Category } from '@/types/models'

// ── Type helpers ──────────────────────────────────────────────────────────────

function isPopulatedCategory(v: unknown): v is { _id: string; name: string } {
    return typeof v === 'object' && v !== null && 'name' in v
}

// ── Input row ─────────────────────────────────────────────────────────────────

function Field({ id, label, children, hint }: { id?: string; label: string; children: React.ReactNode; hint?: string }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label htmlFor={id} style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-fg)' }}>
                {label}
            </label>
            {children}
            {hint && <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.6875rem', color: 'var(--color-muted)', lineHeight: 1.45 }}>{hint}</p>}
        </div>
    )
}

const INPUT_STYLE: React.CSSProperties = {
    padding: '0.625rem 0.875rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg)',
    color: 'var(--color-fg)',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
}

// ── ProviderProfile page ──────────────────────────────────────────────────────

export default function ProviderProfile() {
    const navigate = useNavigate()
    const toast = useToastContext()
    const { myProfile, profileLoading, profileError, loadMyProfile, createMyProfile, updateMyProfile } = useProviderStore()
    const { location, isLoading: geoLoading, error: geoError, getLocation } = useGeolocation()

    const [categories, setCategories] = useState<Category[]>([])
    const [serverError, setServerError] = useState<string | null>(null)

    // Form state
    const [bio, setBio] = useState('')
    const [price, setPrice] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [manualLat, setManualLat] = useState('')
    const [manualLng, setManualLng] = useState('')

    const profileKey = myProfile?._id ?? ''
    const [appliedProfileKey, setAppliedProfileKey] = useState('')

    // Sync form when myProfile appears/changes (or clear when logged-out / no profile)
    if (!myProfile) {
        if (appliedProfileKey !== '') {
            setAppliedProfileKey('')
            setBio('')
            setPrice('')
            setCategoryId('')
            setManualLat('')
            setManualLng('')
        }
    } else if (appliedProfileKey !== profileKey) {
        setAppliedProfileKey(profileKey)
        setBio(myProfile.bio ?? '')
        setPrice(String(myProfile.price ?? ''))
        setCategoryId(isPopulatedCategory(myProfile.categoryId) ? myProfile.categoryId._id : String(myProfile.categoryId))
        setManualLat(String(myProfile.location?.lat ?? ''))
        setManualLng(String(myProfile.location?.lng ?? ''))
    }

    // Load profile + categories on mount
    useEffect(() => {
        getCategories().then(setCategories).catch(() => { })
        void loadMyProfile(true)
    }, [loadMyProfile])

    const isEditMode = !!myProfile

    // ── Validation ──────────────────────────────────────────────────────────────

    const validate = (): string | null => {
        if (bio.trim().length < 20) return 'Bio must be at least 20 characters.'
        const priceNum = Number(price)
        if (!price || isNaN(priceNum) || priceNum <= 0) return 'Please enter a valid hourly rate (e.g. 50).'
        if (!isEditMode && !categoryId) return 'Please select a service category.'
        const lat = Number(manualLat)
        const lng = Number(manualLng)
        if (!isEditMode) {
            if (!manualLat || !manualLng) return 'Location is required. Use the button or enter coordinates manually.'
            if (isNaN(lat) || lat < -90 || lat > 90) return 'Latitude must be between –90 and 90.'
            if (isNaN(lng) || lng < -180 || lng > 180) return 'Longitude must be between –180 and 180.'
        }
        return null
    }

    // ── Submit ──────────────────────────────────────────────────────────────────

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setServerError(null)
        const err = validate()
        if (err) { setServerError(err); return }

        const payload: Parameters<typeof createMyProfile>[0] = {
            bio: bio.trim(),
            price: Number(price),
        }

        if (!isEditMode) {
            payload.categoryId = categoryId
            payload.location = {
                lat: Number(manualLat),
                lng: Number(manualLng),
            }
        }

        try {
            if (isEditMode) {
                await updateMyProfile(payload)
                toast.success('Profile updated successfully!')
            } else {
                await createMyProfile(payload)
                // Force refresh the profile to ensure it's loaded
                await loadMyProfile(true)
                toast.success('Profile created! You are now discoverable by customers.')
                navigate('/provider/dashboard')
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Something went wrong.'
            setServerError(msg)
        }
    }

    const currentCategoryName = myProfile
        ? isPopulatedCategory(myProfile.categoryId)
            ? myProfile.categoryId.name
            : 'Your Category'
        : null

    return (
        <main style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-fg)', padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: 680, margin: '0 auto' }}>

                {/* ── Header ──────────────────────────────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
                    <motion.button onClick={() => navigate('/provider/dashboard')} whileHover={{ x: -3 }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', padding: 0 }}>
                        <ChevronLeft size={16} /> Dashboard
                    </motion.button>
                    <span style={{ color: 'var(--color-border)' }}>/</span>
                    <h1 style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '1.75rem', color: 'var(--color-fg)' }}>
                        {isEditMode ? 'Edit Profile' : 'Create Your Profile'}
                    </h1>
                </div>

                {/* ── Current profile display (edit mode) ─────────────────────────── */}
                {isEditMode && myProfile && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center' }}
                    >
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <p style={{ margin: '0 0 0.25rem', fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current Profile</p>
                            <p style={{ margin: '0 0 0.25rem', fontFamily: 'Lora, serif', fontSize: '1rem', fontWeight: 600, color: 'var(--color-fg)' }}>
                                {currentCategoryName}
                            </p>
                            <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                                ${myProfile.price}/hr · {myProfile.totalReviews} review{myProfile.totalReviews !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <Star size={16} fill="#F59E0B" style={{ color: '#F59E0B' }} />
                            <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#F59E0B' }}>
                                {myProfile.rating > 0 ? myProfile.rating.toFixed(1) : 'No ratings yet'}
                            </span>
                        </div>
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: 999, background: myProfile.isAvailable ? '#22c55e15' : 'var(--color-border)', border: `1px solid ${myProfile.isAvailable ? '#22c55e30' : 'transparent'}`, fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: myProfile.isAvailable ? '#22c55e' : 'var(--color-muted)' }}>
                            {myProfile.isAvailable ? '● Available' : '○ Unavailable'}
                        </span>
                    </motion.div>
                )}

                {/* ── Form ────────────────────────────────────────────────────────── */}
                <motion.form
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.375rem', boxShadow: 'var(--shadow-md)' }}
                    noValidate
                >
                    {/* Server error */}
                    <AnimatePresence>
                        {(serverError ?? profileError) && (
                            <motion.div key="error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                style={{ overflow: 'hidden', display: 'flex', alignItems: 'flex-start', gap: '0.625rem', padding: '0.875rem 1rem', background: 'rgba(249,111,112,0.07)', border: '1px solid rgba(249,111,112,0.25)', borderRadius: 'var(--radius-md)', fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: 'var(--color-error)' }}>
                                <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
                                {serverError ?? profileError}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Category — CREATE only */}
                    {!isEditMode && (
                        <Field id="profile-category" label="Service Category" hint="Cannot be changed after creation.">
                            <select id="profile-category" value={categoryId} onChange={e => setCategoryId(e.target.value)} required
                                style={{ ...INPUT_STYLE, cursor: 'pointer' }}>
                                <option value="">Select a category…</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </Field>
                    )}

                    {/* Bio */}
                    <Field id="profile-bio" label="Professional Bio" hint="Describe your experience, skills, and what makes you stand out (min 20 characters).">
                        <textarea id="profile-bio" value={bio} onChange={e => setBio(e.target.value)} required rows={4} aria-required="true"
                            placeholder="e.g. I'm a licensed electrician with 8+ years of experience in residential wiring…"
                            style={{ ...INPUT_STYLE, resize: 'vertical', minHeight: 100 }} />
                    </Field>

                    {/* Price */}
                    <Field id="profile-price" label="Hourly Rate (USD)" hint="Customers see this rate on your profile card.">
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', pointerEvents: 'none' }}>$</span>
                            <input id="profile-price" type="number" min={1} max={9999} step={1} value={price} onChange={e => setPrice(e.target.value)} required
                                placeholder="50" aria-required="true" style={{ ...INPUT_STYLE, paddingLeft: '1.75rem' }} />
                        </div>
                    </Field>

                    {/* Location — CREATE only */}
                    {!isEditMode && (
                        <Field label="Your Location" hint="Used to show distance to customers. Cannot be changed after creation.">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                <motion.button
                                    type="button"
                                    onClick={() =>
                                        getLocation({
                                            onSuccess: loc => {
                                                setManualLat(String(loc.lat))
                                                setManualLng(String(loc.lng))
                                            },
                                        })
                                    }
                                    disabled={geoLoading}
                                    whileHover={geoLoading ? {} : { scale: 1.02 }} whileTap={geoLoading ? {} : { scale: 0.97 }}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary)', background: 'var(--color-primary)10', color: 'var(--color-primary)', fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', fontWeight: 500, cursor: geoLoading ? 'wait' : 'pointer' }}
                                    aria-label="Detect my location automatically">
                                    {geoLoading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Detecting…</> : <><LocateFixed size={14} /> Use My Location</>}
                                </motion.button>
                                {geoError && <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', color: 'var(--color-error)' }}>{geoError}</p>}
                                <div style={{ display: 'flex', gap: '0.625rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label htmlFor="profile-lat" style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.3rem' }}>Latitude</label>
                                        <input id="profile-lat" type="number" step="any" value={manualLat} onChange={e => setManualLat(e.target.value)} placeholder="e.g. 40.7128" style={INPUT_STYLE} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label htmlFor="profile-lng" style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.3rem' }}>Longitude</label>
                                        <input id="profile-lng" type="number" step="any" value={manualLng} onChange={e => setManualLng(e.target.value)} placeholder="e.g. -74.0060" style={INPUT_STYLE} />
                                    </div>
                                </div>
                                {location && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', color: '#22c55e' }}>
                                        <CheckCircle2 size={13} /> Location detected automatically
                                    </div>
                                )}
                            </div>
                        </Field>
                    )}

                    {/* Submit */}
                    <motion.button
                        type="submit"
                        disabled={profileLoading}
                        whileHover={profileLoading ? {} : { scale: 1.02 }}
                        whileTap={profileLoading ? {} : { scale: 0.97 }}
                        className="btn-primary"
                        style={{ fontSize: '0.9375rem', padding: '0.75rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: profileLoading ? 0.7 : 1, cursor: profileLoading ? 'wait' : 'pointer' }}
                        aria-busy={profileLoading}
                    >
                        {profileLoading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                        {profileLoading
                            ? (isEditMode ? 'Saving…' : 'Creating…')
                            : (isEditMode ? 'Save Changes' : 'Create Profile')
                        }
                    </motion.button>
                </motion.form>

            </div>
        </main>
    )
}
