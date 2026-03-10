/**
 * SplitLayout — Service Radar
 * Ref: §Component Architecture (Layout/), §Navigation & Routes
 *
 * Two-panel layout: sticky sidebar on left + scrollable main content.
 * Used by SearchProviders page (Phase 14) for filter sidebar + results.
 *
 * Props:
 *   sidebar        — sidebar content (filters, navigation)
 *   children       — main content area
 *   sidebarWidth   — width of sidebar (default '280px')
 *   showSidebar    — toggle visibility on mobile (controlled externally)
 *   sidebarTitle   — accessible label for sidebar region
 */

import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SplitLayoutProps {
    sidebar: ReactNode
    children: ReactNode
    sidebarWidth?: string
    showSidebar?: boolean
    sidebarTitle?: string
}

export function SplitLayout({
    sidebar,
    children,
    sidebarWidth = '280px',
    showSidebar = true,
    sidebarTitle = 'Filters',
}: SplitLayoutProps) {
    return (
        <div
            style={{
                display: 'flex',
                minHeight: 'calc(100vh - 64px)', // 64px = navbar height
                position: 'relative',
            }}
        >
            {/* ── Sidebar ─────────────────────────────────────────────────────── */}
            <AnimatePresence initial={false}>
                {showSidebar && (
                    <motion.aside
                        key="sidebar"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: sidebarWidth, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 360, damping: 40 }}
                        style={{ overflow: 'hidden', flexShrink: 0 }}
                        aria-label={sidebarTitle}
                    >
                        <div
                            style={{
                                width: sidebarWidth,
                                height: '100%',
                                padding: '1.5rem 1rem 1.5rem 1.5rem',
                                background: 'var(--color-card)',
                                borderRight: '1px solid var(--color-border)',
                                overflowY: 'auto',
                                position: 'sticky',
                                top: 64,
                                maxHeight: 'calc(100vh - 64px)',
                            }}
                        >
                            {sidebar}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* ── Main content ─────────────────────────────────────────────────── */}
            <main
                style={{
                    flex: 1,
                    padding: '1.5rem',
                    minWidth: 0, // prevent flex overflow
                    overflow: 'hidden',
                }}
            >
                {children}
            </main>
        </div>
    )
}
