/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vault: {
          bg:          '#080A0F',
          surface:     '#0D1017',
          card:        '#111318',
          cardHover:   '#161920',
          border:      '#1E2130',
          borderLight: '#252838',
          accent:      '#5B7FFF',
          accentDim:   '#3D5ACC',
          accentGlow:  'rgba(91,127,255,0.15)',
          text:        '#E2E5F0',
          subtle:      '#C0C4D6',
          muted:       '#6B7090',
          faint:       '#3A3D52',
          danger:      '#F04747',
          dangerDim:   'rgba(240,71,71,0.12)',
          success:     '#3ECF8E',
          successDim:  'rgba(62,207,142,0.12)',
          warning:     '#F5A623',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        'card':     '0 0 0 1px rgba(255,255,255,0.03), 0 2px 8px rgba(0,0,0,0.4)',
        'cardHover':'0 0 0 1px rgba(91,127,255,0.2), 0 4px 20px rgba(0,0,0,0.5)',
        'modal':    '0 0 0 1px rgba(255,255,255,0.05), 0 32px 64px rgba(0,0,0,0.7)',
        'glow':     '0 0 20px rgba(91,127,255,0.25)',
        'inner':    'inset 0 1px 0 rgba(255,255,255,0.04)',
      },
      backgroundImage: {
        'gradient-vault': 'linear-gradient(135deg, #5B7FFF 0%, #8B5CF6 100%)',
        'gradient-subtle': 'linear-gradient(180deg, rgba(91,127,255,0.06) 0%, transparent 100%)',
        'grid-pattern': `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 40h40M40 0v40' stroke='rgba(255,255,255,0.025)' stroke-width='1'/%3E%3C/svg%3E")`,
      },
      animation: {
        'fade-up':    'fadeUp 0.25s ease-out forwards',
        'fade-in':    'fadeIn 0.2s ease-out forwards',
        'scale-in':   'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'slide-left': 'slideLeft 0.25s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer':    'shimmer 1.8s linear infinite',
      },
      keyframes: {
        fadeUp:    { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.92)' }, to: { opacity: '1', transform: 'scale(1)' } },
        slideLeft: { from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        shimmer:   { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
