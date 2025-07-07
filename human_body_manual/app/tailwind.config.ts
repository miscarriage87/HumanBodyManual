
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Spirituell-bewusste Farbpalette
        terracotta: {
          50: '#fdf4f0',
          100: '#fbe6db',
          200: '#f6cab6',
          300: '#f0a687',
          400: '#e87c56',
          500: '#D2691E', // Hauptfarbe
          600: '#c4571a',
          700: '#a44316',
          800: '#843816',
          900: '#6d2f16',
        },
        forest: {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce5bc',
          300: '#8fd48f',
          400: '#5abd5a',
          500: '#228B22', // Hauptfarbe
          600: '#1e7a1e',
          700: '#1a651a',
          800: '#185018',
          900: '#164216',
        },
        gold: {
          50: '#fffef0',
          100: '#fffadb',
          200: '#fff3b7',
          300: '#ffe888',
          400: '#ffd957',
          500: '#FFD700', // Hauptfarbe
          600: '#e6c200',
          700: '#cc9900',
          800: '#a67c00',
          900: '#856500',
        },
        ocher: {
          50: '#fdf6f0',
          100: '#fae9db',
          200: '#f4d0b6',
          300: '#edb087',
          400: '#e48c56',
          500: '#CC7722', // Hauptfarbe
          600: '#b8661e',
          700: '#975419',
          800: '#7a4417',
          900: '#643816',
        },
        sky: {
          50: '#f0fbff',
          100: '#e0f5ff',
          200: '#b9eaff',
          300: '#7cdbff',
          400: '#36c9ff',
          500: '#87CEEB', // Hauptfarbe angepasst
          600: '#0ea1e6',
          700: '#0c87bf',
          800: '#10719c',
          900: '#135f81',
        },
        copper: {
          50: '#fdf6f0',
          100: '#fae9db',
          200: '#f4d0b6',
          300: '#edb087',
          400: '#e48c56',
          500: '#B87333', // Hauptfarbe
          600: '#a6612b',
          700: '#884f24',
          800: '#6f4020',
          900: '#5a351c',
        },
        cream: {
          50: '#ffffff',
          100: '#fefefe',
          200: '#fdfdfc',
          300: '#fcfbf9',
          400: '#fbf9f6',
          500: '#FDF5E6', // Hauptfarbe
          600: '#f5ead1',
          700: '#e8d5a8',
          800: '#d4bc7a',
          900: '#b89a4a',
        },
        charcoal: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#2F2F2F', // Hauptfarbe
        }
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
        'dancing': ['Dancing Script', 'cursive'],
      },
      aspectRatio: {
        'golden': '1.618',
        'golden-tall': '0.618',
      },
      animation: {
        'spiritual-pulse': 'spiritual-pulse 3s ease-in-out infinite',
        'breathing-glow': 'breathing-glow 4s ease-in-out infinite',
        'progress-shine': 'progress-shine 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'spiritual-pulse': {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
          '50%': {
            transform: 'scale(1.05)',
            opacity: '0.8',
          },
        },
        'breathing-glow': {
          '0%, 100%': {
            transform: 'translate(-50%, -50%) scale(1)',
            opacity: '0.3',
          },
          '50%': {
            transform: 'translate(-50%, -50%) scale(1.2)',
            opacity: '0.6',
          },
        },
        'progress-shine': {
          '0%': {
            transform: 'translateX(-100%)',
          },
          '100%': {
            transform: 'translateX(100%)',
          },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
        'glow': {
          '0%': {
            boxShadow: '0 0 5px rgba(255, 215, 0, 0.5)',
          },
          '100%': {
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'organic': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'organic-hover': '0 15px 40px rgba(0, 0, 0, 0.15)',
        'achievement': '0 4px 15px rgba(255, 215, 0, 0.4)',
        'mystical': '0 0 30px rgba(255, 215, 0, 0.3)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}

export default config
