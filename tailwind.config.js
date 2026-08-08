/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cheesy: {
          yellow: '#F6B21A',
          orange: '#FF9F1C',
          charcoal: '#2C2C2C',
          cream: '#FAF9F6',
          beige: '#F6EFE3',
        },
      },
    },
  },
  plugins: [],
};
