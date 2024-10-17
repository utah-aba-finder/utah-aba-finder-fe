/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/Providers-page/SearchBar.tsx",
  ],
  theme: {
    extend: {
      keyframes: {
        'jump-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'jump-out': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.8)', opacity: '0' },
        },
      },
      animation: {
        'jump-in': 'jump-in 0.3s ease-in-out',
        'jump-out': 'jump-out 0.3s ease-in-out',
      },
      colors: {
        steelblue: {
          DEFAULT: '#4A6FA5',  // Steel Blue RGB(74, 111, 165)
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  variants: {
    extend: {
      opacity: ['responsive', 'hover', 'focus', 'group-hover', 'group-focus'],
    }
  },
  plugins: [],
}

