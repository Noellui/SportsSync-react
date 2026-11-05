/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B1210',
        surface: '#121C18',
        elevated: '#1A2722',
        line: '#26362F',
        primary: '#B6FF3B',
        'primary-dark': '#8ACF1E',
        'on-primary': '#0B1210',
        secondary: '#2EE6A6',
        text: '#F2F7F4',
        muted: '#9FB3AA',
        success: '#3DDC84',
        warning: '#FFB84D',
        danger: '#FF5C5C',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #B6FF3B 0%, #2EE6A6 100%)',
        'hero-overlay': 'linear-gradient(to bottom, transparent 0%, #0B1210 90%)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
        'hero-zoom': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.8' },
          '70%': { transform: 'scale(1.15)', opacity: '0' },
          '100%': { transform: 'scale(1.15)', opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-5px)' },
          '80%': { transform: 'translateX(5px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.4s infinite linear',
        'hero-zoom': 'hero-zoom 14s ease-in-out infinite alternate',
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
        shake: 'shake 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
};
