/** @type {import('tailwindcss').Config} */

// Lets `bg-primary/10`, `border-border/40`, etc. work against the protea/fynbos
// CSS-var tokens: Tailwind can only inject an opacity value into an `rgb(r g b
// / a)` function, not into a var() holding an opaque hex string, so each
// semantic colour resolves through its `--<token>-rgb` triplet (see index.css).
const withOpacity = (rgbVar) => ({ opacityValue }) =>
  opacityValue === undefined ? `rgb(var(${rgbVar}))` : `rgb(var(${rgbVar}) / ${opacityValue})`

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: withOpacity('--paper-rgb'),
        surface: withOpacity('--paper-rgb'),
        primary: withOpacity('--protea-rgb'),
        'on-primary': 'var(--on-protea)',
        text: withOpacity('--ink-rgb'),
        'text-secondary': withOpacity('--muted-rgb'),
        success: withOpacity('--fynbos-rgb'),
        border: withOpacity('--line-rgb'),
      },
      fontFamily: {
        sans: ['Schibsted Grotesk Variable', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono Variable', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '3.5rem' }],
      },
      spacing: {
        gutter: '1.5rem',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-from-bottom': {
          from: {
            transform: 'translateY(20px)',
            opacity: '0',
          },
          to: {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-from-bottom-8': 'slide-in-from-bottom 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'in': 'fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1), slide-in-from-bottom 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
