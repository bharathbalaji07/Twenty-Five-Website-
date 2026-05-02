export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        tomato: {
          50: '#fff1f0',
          100: '#ffe0dd',
          200: '#ffc4bf',
          400: '#ff6b62',
          500: '#ef3f37',
          600: '#dc2d25',
          700: '#b91f18'
        },
        ink: '#16151a'
      },
      boxShadow: {
        soft: '0 18px 50px rgba(21, 17, 28, 0.10)'
      },
      keyframes: {
        rise: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        pulseSoft: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' }
        }
      },
      animation: {
        rise: 'rise 420ms ease-out both',
        pulseSoft: 'pulseSoft 1.8s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
