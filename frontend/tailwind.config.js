/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        masters: {
          green: '#006747',
          dark: '#004D35',
          light: '#00854A',
          gold: '#C8A951',
          cream: '#FFF8E7',
          sand: '#F5F0E8',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      }
    },
  },
  plugins: [],
};
