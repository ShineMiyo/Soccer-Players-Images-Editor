/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          750: '#2d2d2d',
          850: '#1a1a1a',
          950: '#0a0a0a',
        }
      }
    },
  },
  plugins: [],
}