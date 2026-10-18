/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}",
    "./templates/**/*.html",
    "./dist/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E3000F',
          dark: '#B8000C',
          light: '#FF1F2F',
        },
      },
      fontFamily: {
        sans: ['Archivo', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
