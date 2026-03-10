/**
 * Navbar — Service Radar
 * Ref: §Component Architecture (Common/), §Navigation & Routes, §Accessibility
 *
 * Features:
 *   - Brand logo with gradient text
 *   - Desktop nav links (Home, Search)
 *   - Theme toggle (sun/moon icon)
 *   - Auth state: logged in → user avatar + name + dropdown (dashboard, logout)
 *                 logged out → Login + Register buttons
 *   - Mobile hamburger → slide-down drawer with all links
 *   - Active route highlight (aria-current="page")
 *   - Scroll detection: adds backdrop blur + shadow on scroll
 */

import { useState, useEffect, useCallback } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Menu,
    X,
    Sun,
    Moon,
    LogOut,
    LayoutDashboard,
    Search,
    User,
    Radar,
} from 'lucide-react'
import { useTheme } from '@/providers/ThemeProvider'
import { useAuth } from '@/hooks'
import { useClickOutside } from '@/hooks'
import { useEscapeKey } from '@/hooks'

// ── Nav link helper ───────────────────────────────────────────────────────────

function NavItem({
    to,
    children,
    onClick,
}: {
    to: string
    children: React.ReactNode
    onClick?: () => void
}) {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            style={({ isActive }: { isActive: boolean }) => ({
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--color-primary)' : 'var(--color-fg)',
                textDecoration: 'none',
                padding: '0.375rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--color-primary)1a' : 'transparent',
                transition: 'all 150ms ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
            })}
        >
            {children}
        </NavLink>
    )
}

// ── Navbar ────────────────────────────────────────────────────────────────────

export function Navbar() {
    const { theme, toggleTheme } = useTheme()
    const { user, isAuthenticated, isCustomer, isProvider, logout } = useAuth()
    const navigate = useNavigate()

    const [mobileOpen, setMobileOpen] = useState(false)
    const [userDropOpen, setUserDropOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    // Scroll detection for navbar shadow
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 8)
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close mobile menu on resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setMobileOpen(false)
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Click outside to close user dropdown
    const dropdownRef = useClickOutside<HTMLDivElement>(
        useCallback(() => setUserDropOpen(false), []),
        userDropOpen,
    )

    const handleLogout = async () => {
        setUserDropOpen(false)
        setMobileOpen(false)
        await logout()
        navigate('/')
    }

    // ── Keyboard navigation: Escape closes any open overlay (18.7) ─────────
    useEscapeKey(() => {
        if (userDropOpen) { setUserDropOpen(false); return }
        if (mobileOpen) { setMobileOpen(false) }
    }, userDropOpen || mobileOpen)

    const dashboardPath = isCustomer
        ? '/customer/dashboard'
        : isProvider
            ? '/provider/dashboard'
            : '/'

    const closeMobile = () => setMobileOpen(false)

    // ── Icon button helper ──────────────────────────────────────────────────

    const iconBtnStyle: React.CSSProperties = {
        background: 'none',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        padding: '0.5rem',
        color: 'var(--color-fg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 150ms ease',
    }

    return (
        <>
            {/* ── Main bar ──────────────────────────────────────────────────────── */}
            <header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    height: 64,
                    background: scrolled
                        ? 'var(--color-card)e6'
                        : 'var(--color-bg)',
                    backdropFilter: scrolled ? 'blur(12px)' : 'none',
                    borderBottom: '1px solid var(--color-border)',
                    boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
                    transition: 'all 200ms ease',
                }}
            >
                <nav
                    aria-label="Main navigation"
                    style={{
                        maxWidth: 1280,
                        margin: '0 auto',
                        padding: '0 1.5rem',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                    }}
                >
                    {/* ── Logo ────────────────────────────────────────────────────── */}
                    <Link
                        to="/"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            textDecoration: 'none',
                            flex: '0 0 auto',
                        }}
                        aria-label="Service Radar — Home"
                    >
                        <motion.div
                            whileHover={{ rotate: 20 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            style={{ color: 'var(--color-primary)', display: 'flex' }}
                        >
                            <Radar size={26} strokeWidth={2} />
                        </motion.div>
                        <span
                            style={{
                                fontFamily: 'Lora, serif',
                                fontWeight: 700,
                                fontSize: '1.25rem',
                                background:
                                    'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Service Radar
                        </span>
                    </Link>

                    {/* ── Spacer ──────────────────────────────────────────────────── */}
                    <div style={{ flex: 1 }} />

                    {/* ── Desktop nav links ────────────────────────────────────────── */}
                    <div
                        className="desktop-nav"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                        <NavItem to="/search">
                            <Search size={15} />
                            Search
                        </NavItem>
                        {isAuthenticated && (
                            <NavItem to={dashboardPath}>
                                <LayoutDashboard size={15} />
                                Dashboard
                            </NavItem>
                        )}
                    </div>

                    {/* ── Actions row ─────────────────────────────────────────────── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

                        {/* Theme toggle */}
                        <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.93 }}
                            onClick={toggleTheme}
                            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                            style={iconBtnStyle}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.span
                                    key={theme}
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ display: 'flex' }}
                                    aria-hidden="true"
                                >
                                    {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                                </motion.span>
                            </AnimatePresence>
                        </motion.button>

                        {/* Auth state — desktop */}
                        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {isAuthenticated ? (
                                /* User dropdown */
                                <div ref={dropdownRef} style={{ position: 'relative' }}>
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setUserDropOpen(o => !o)}
                                        aria-expanded={userDropOpen}
                                        aria-haspopup="menu"
                                        aria-controls="user-dropdown-menu"
                                        aria-label={`Account menu for ${user?.name}`}
                                        style={{
                                            ...iconBtnStyle,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            paddingInline: '0.75rem',
                                            background: 'var(--color-primary)15',
                                            borderColor: 'var(--color-primary)40',
                                        }}
                                    >
                                        <div
                                            aria-hidden="true"
                                            style={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: '50%',
                                                background:
                                                    'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <User size={14} color="white" aria-hidden="true" />
                                        </div>
                                        <span
                                            style={{
                                                fontFamily: 'Poppins, sans-serif',
                                                fontSize: '0.8125rem',
                                                fontWeight: 500,
                                                color: 'var(--color-fg)',
                                                maxWidth: 120,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {user?.name}
                                        </span>
                                    </motion.button>

                                    <AnimatePresence>
                                        {userDropOpen && (
                                            <motion.div
                                                id="user-dropdown-menu"
                                                role="menu"
                                                aria-label="Account options"
                                                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                                transition={{ duration: 0.15 }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 'calc(100% + 8px)',
                                                    right: 0,
                                                    minWidth: 180,
                                                    background: 'var(--color-card)',
                                                    border: '1px solid var(--color-border)',
                                                    borderRadius: 'var(--radius-lg)',
                                                    boxShadow: 'var(--shadow-lg)',
                                                    overflow: 'hidden',
                                                    zIndex: 200,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        padding: '0.625rem 1rem',
                                                        borderBottom: '1px solid var(--color-border)',
                                                    }}
                                                >
                                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted)', fontFamily: 'Poppins,sans-serif' }}>
                                                        Signed in as
                                                    </p>
                                                    <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-fg)', fontFamily: 'Poppins,sans-serif', wordBreak: 'break-all' }}>
                                                        {user?.email}
                                                    </p>
                                                </div>

                                                <DropdownItem
                                                    icon={<LayoutDashboard size={15} />}
                                                    label="Dashboard"
                                                    onClick={() => { navigate(dashboardPath); setUserDropOpen(false) }}
                                                />
                                                <DropdownItem
                                                    icon={<LogOut size={15} />}
                                                    label="Sign out"
                                                    onClick={handleLogout}
                                                    danger
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <>
                                    <Link to="/login">
                                        <motion.button
                                            whileHover={{ scale: 1.04 }}
                                            whileTap={{ scale: 0.97 }}
                                            style={{
                                                ...iconBtnStyle,
                                                paddingInline: '0.875rem',
                                                fontFamily: 'Poppins, sans-serif',
                                                fontSize: '0.8125rem',
                                                fontWeight: 500,
                                            }}
                                        >
                                            Login
                                        </motion.button>
                                    </Link>
                                    <Link to="/register">
                                        <motion.button
                                            whileHover={{ scale: 1.04 }}
                                            whileTap={{ scale: 0.97 }}
                                            className="btn-primary"
                                            style={{ fontSize: '0.8125rem' }}
                                        >
                                            Register
                                        </motion.button>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <motion.button
                            className="mobile-menu-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.93 }}
                            onClick={() => setMobileOpen(o => !o)}
                            aria-expanded={mobileOpen}
                            aria-controls="mobile-nav-drawer"
                            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                            style={{ ...iconBtnStyle, display: 'none' }}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.span
                                    key={mobileOpen ? 'close' : 'open'}
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    style={{ display: 'flex' }}
                                    aria-hidden="true"
                                >
                                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                                </motion.span>
                            </AnimatePresence>
                        </motion.button>
                    </div>
                </nav>
            </header>

            {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        key="mobile-drawer"
                        id="mobile-nav-drawer"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Mobile navigation menu"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                        style={{
                            overflow: 'hidden',
                            background: 'var(--color-card)',
                            borderBottom: '1px solid var(--color-border)',
                            position: 'sticky',
                            top: 64,
                            zIndex: 99,
                        }}
                    >
                        <nav
                            aria-label="Mobile navigation"
                            style={{
                                padding: '1rem 1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.375rem',
                            }}
                        >
                            <NavItem to="/search" onClick={closeMobile}>
                                <Search size={15} />
                                Search Providers
                            </NavItem>

                            {isAuthenticated ? (
                                <>
                                    <NavItem to={dashboardPath} onClick={closeMobile}>
                                        <LayoutDashboard size={15} />
                                        Dashboard
                                    </NavItem>
                                    <div style={{ borderTop: '1px solid var(--color-border)', margin: '0.5rem 0', paddingTop: '0.5rem' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontFamily: 'Poppins,sans-serif', marginBottom: '0.375rem', paddingInline: '0.75rem' }}>
                                            {user?.email}
                                        </p>
                                        <button
                                            onClick={handleLogout}
                                            aria-label="Sign out of your account"
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.375rem 0.75rem',
                                                borderRadius: 'var(--radius-md)',
                                                color: 'var(--color-error)',
                                                fontFamily: 'Poppins, sans-serif',
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            <LogOut size={15} aria-hidden="true" />
                                            Sign out
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <Link to="/login" onClick={closeMobile} style={{ flex: 1 }}>
                                        <button style={{ width: '100%' }} className="btn-outline">Login</button>
                                    </Link>
                                    <Link to="/register" onClick={closeMobile} style={{ flex: 1 }}>
                                        <button style={{ width: '100%' }} className="btn-primary">Register</button>
                                    </Link>
                                </div>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Responsive CSS via style tag */}
            <style>{`
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
        </>
    )
}

// ── Dropdown item helper ──────────────────────────────────────────────────────

function DropdownItem({
    icon,
    label,
    onClick,
    danger,
}: {
    icon: React.ReactNode
    label: string
    onClick: () => void
    danger?: boolean
}) {
    return (
        <button
            role="menuitem"
            onClick={onClick}
            style={{
                width: '100%',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.625rem 1rem',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.875rem',
                color: danger ? 'var(--color-error)' : 'var(--color-fg)',
                transition: 'background 150ms',
            }}
            onMouseEnter={e =>
            ((e.currentTarget as HTMLElement).style.background =
                danger ? 'rgba(249,111,112,0.08)' : 'var(--color-bg)')
            }
            onMouseLeave={e =>
                ((e.currentTarget as HTMLElement).style.background = 'none')
            }
        >
            <span style={{ color: danger ? 'var(--color-error)' : 'var(--color-muted)', display: 'flex' }}>
                {icon}
            </span>
            {label}
        </button>
    )
}
