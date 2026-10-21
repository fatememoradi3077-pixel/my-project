/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          base: '#101114',
          panel: '#17191D',
          card: '#202226',
          raised: '#27292D',
        },
        ink: {
          DEFAULT: '#F5F5F5',
          muted: '#A5A7AD',
          faint: '#6E7076',
        },
        line: {
          DEFAULT: '#34363B',
          soft: '#26282C',
        },
        brand: {
          DEFAULT: '#FF6A00',
          hover: '#FF8533',
          glow: 'rgba(255, 106, 0, 0.16)',
        },
        sale: '#FF5A22',
        success: '#35C98A',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Manrope', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        shell: '1320px',
      },
      boxShadow: {
        card: '0 18px 40px -28px rgba(0, 0, 0, 0.9)',
        glow: '0 0 0 1px rgba(255, 106, 0, 0.35), 0 12px 30px -14px rgba(255, 106, 0, 0.55)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.28)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-420px 0' },
          '100%': { backgroundPosition: '420px 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out both',
        'slide-in': 'slide-in 0.32s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-in-left': 'slide-in-left 0.32s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-down': 'slide-down 0.18s ease-out both',
        pop: 'pop 0.32s ease-out',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};
