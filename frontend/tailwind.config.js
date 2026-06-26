/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'ui-rounded', 'sans-serif'],
      },
      colors: {
        // Legacy alias — keeps existing brand-* classes working
        brand: {
          50:  '#e8f7fd',
          100: '#c2ebf9',
          500: '#0095c8',
          600: '#007aaa',
          700: '#005e87',
        },
        doraemon: {
          50:  '#e8f7fd',
          100: '#c2ebf9',
          200: '#8dd8f4',
          300: '#4cbfe8',
          400: '#1aadd9',
          500: '#0095c8',
          600: '#007aaa',
          700: '#005e87',
          800: '#004265',
          900: '#002844',
        },
        accent: {
          red:    '#ff4757',
          yellow: '#ffd32a',
          white:  '#ffffff',
        },
        surface: '#f0f9ff',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        card:       '0 4px 20px rgba(0, 149, 200, 0.12)',
        'card-hover': '0 8px 32px rgba(0, 149, 200, 0.22)',
        btn:        '0 4px 12px rgba(0, 149, 200, 0.35)',
        modal:      '0 16px 48px rgba(0, 42, 101, 0.18)',
      },
    },
  },
  plugins: [],
}
