/* eslint-disable react-refresh/only-export-components -- ThemeProvider + useTheme are a single module API */
/**
 * ThemeProvider — Service Radar
 * Ref: §Design System, §Dark Mode
 *
 * Manages light / dark mode by toggling the `.dark` CSS class
 * on `<html>`. Persists preference to localStorage key `sr_theme`.
 *
 * Provides:
 *   ThemeContext  — { theme: 'light'|'dark', toggleTheme, setTheme }
 *   useTheme()    — hook to consume the context
 *
 * Usage in main.tsx:
 *   <ThemeProvider><App /></ThemeProvider>
 *
 * Usage in component:
 *   const { theme, toggleTheme } = useTheme()
 */

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

type Theme = 'light' | 'dark'

interface ThemeContextValue {
    theme: Theme
    toggleTheme: () => void
    setTheme: (theme: Theme) => void
}

// ── Context ───────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null)

// ── Helpers ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'sr_theme'

function getInitialTheme(): Theme {
    // 1. Prefer stored user preference
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored === 'light' || stored === 'dark') return stored

    // 2. Fall back to OS preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'

    return 'light'
}

function applyTheme(theme: Theme): void {
    const root = document.documentElement
    if (theme === 'dark') {
        root.classList.add('dark')
    } else {
        root.classList.remove('dark')
    }
}

// ── Provider ──────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
    children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(() => {
        // Initialized lazily to avoid SSR issues
        if (typeof window === 'undefined') return 'light'
        return getInitialTheme()
    })

    // Apply CSS class whenever theme changes
    useEffect(() => {
        applyTheme(theme)
        localStorage.setItem(STORAGE_KEY, theme)
    }, [theme])

    // Listen for OS preference changes and follow them
    // (only if user hasn't explicitly set a preference in localStorage)
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

        const handleChange = (e: MediaQueryListEvent) => {
            const stored = localStorage.getItem(STORAGE_KEY)
            // Only auto-follow OS if user hasn't manually changed theme
            if (!stored) {
                setThemeState(e.matches ? 'dark' : 'light')
            }
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [])

    const toggleTheme = () =>
        setThemeState(prev => (prev === 'light' ? 'dark' : 'light'))

    const setTheme = (newTheme: Theme) => setThemeState(newTheme)

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext)
    if (!ctx) {
        throw new Error('useTheme must be used within a <ThemeProvider>')
    }
    return ctx
}
