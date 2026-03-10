/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // ── Color Palette (from Design System) ────────────────────────────
      colors: {
        // Light mode
        primary: '#d04f99',
        secondary: '#8acfd1',
        accent: '#fbe2a7',
        destructive: '#f96f70',
        success: '#10B981',
        warning: '#F59E0B',

        // Neutral (light)
        background: '#f6e6ee',
        foreground: '#5b5b5b',
        card: '#fdedc9',
        border: '#d04f99',
        input: '#e4e4e4',
        muted: '#b0a0a8',

        // Dark mode (accessed via CSS vars, see index.css)
        dark: {
          primary: '#fbe2a7',
          secondary: '#e4a2b1',
          accent: '#c67b96',
          destructive: '#e35ea4',
          bg: '#12242e',
          card: '#1c2e38',
          border: '#324859',
          input: '#20333d',
          foreground: '#f3e3ea',
        },
      },

      // ── Typography ─────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        serif: ['Lora', 'serif'],
        mono: ['Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.4' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.5' }],
        'lg': ['1.25rem', { lineHeight: '1.4' }],
        'xl': ['1.5rem', { lineHeight: '1.3' }],
        '2xl': ['2rem', { lineHeight: '1.2' }],
      },

      // ── Spacing ────────────────────────────────────────────────────────
      spacing: {
        'xs': '0.25rem',  // 4px
        'sm': '0.5rem',   // 8px
        'md': '1rem',     // 16px
        'lg': '1.5rem',   // 24px
        'xl': '2rem',     // 32px
        '2xl': '3rem',     // 48px
      },

      // ── Border Radius ──────────────────────────────────────────────────
      borderRadius: {
        'xs': '0.05rem',
        'sm': '0.35rem',
        'md': '0.4rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        'full': '9999px',
      },

      // ── Box Shadows (pink accent) ──────────────────────────────────────
      boxShadow: {
        '2xs': '3px 3px 0px 0px rgba(208,79,153,0.5)',
        'xs': '3px 3px 0px 0px rgba(208,79,153,1)',
        'sm': '3px 3px 0px 0px rgba(208,79,153,1), 3px 1px 2px 0px rgba(208,79,153,0.3)',
        'md': '3px 3px 0px 0px rgba(208,79,153,1), 3px 2px 4px 0px rgba(208,79,153,0.3)',
        'lg': '3px 3px 0px 0px rgba(208,79,153,1), 3px 4px 6px 0px rgba(208,79,153,0.3)',
        'xl': '3px 3px 0px 0px rgba(208,79,153,1), 3px 8px 10px 0px rgba(208,79,153,0.3)',
        '2xl': '6px 6px 0px 0px rgba(208,79,153,1)',
        // Dark mode shadows (slate-blue)
        'dark-sm': '3px 3px 0px 0px rgba(50,72,89,1)',
        'dark-md': '3px 3px 0px 0px rgba(50,72,89,1), 3px 2px 4px 0px rgba(50,72,89,0.5)',
        'dark-lg': '3px 3px 0px 0px rgba(50,72,89,1), 3px 4px 6px 0px rgba(50,72,89,0.5)',
      },

      // ── Animations ─────────────────────────────────────────────────────
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        fadeIn: 'fadeIn 0.3s ease-out',
        shake: 'shake 0.4s ease-in-out',
        scaleIn: 'scaleIn 0.2s ease-out',
      },

      // ── Transitions ────────────────────────────────────────────────────
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },
    },
  },
  plugins: [],
}
