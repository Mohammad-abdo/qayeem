/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Figma Design System Colors
        primary: {
          50: '#F2EEF6',   // Primary/50
          100: '#E4DEED',   // Primary/100
          400: '#947AB8',   // Primary/400
          500: '#7B5BA8',   // Primary/500 - Main brand color
          600: '#6A4B8F',   // Primary/600 - Darker for dark mode
        },
        black: {
          50: '#F2F2F2',    // Black/50
          100: '#E6E6E6',   // Black/100
          500: '#242424',   // Black/500 - Main text
          600: '#666666',   // Black/600 - Secondary text
          700: '#4D4D4D',   // Black/700
          950: '#0D0D0D',   // Black/950
        },
        bg: '#FCFCFC',      // Background color (light)
        accent: {
          yellow: '#EAB308', // Accent Color/Yellow
        },
      },
      fontFamily: {
        sans: ['var(--font-tajawal)', 'var(--font-inter)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
        tajawal: ['var(--font-tajawal)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

