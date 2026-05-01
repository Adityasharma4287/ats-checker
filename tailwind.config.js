/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0D0D0D',
          soft: '#1A1A1A',
          muted: '#3D3D3D',
        },
        paper: {
          DEFAULT: '#F7F4EE',
          warm: '#EDE9E0',
          card: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#C84B31',
          hover: '#A83825',
          light: '#F5E8E4',
        },
        success: {
          DEFAULT: '#2D6A4F',
          light: '#D8F3DC',
        },
        warn: {
          DEFAULT: '#B5451B',
          light: '#FFE8D6',
        },
        info: {
          DEFAULT: '#1B4F72',
          light: '#D6EAF8',
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'score-fill': 'scoreFill 1.2s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scoreFill: {
          '0%': { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: 'var(--offset)' },
        }
      }
    },
  },
  plugins: [],
}
