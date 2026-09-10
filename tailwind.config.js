/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          light: '#2d8a4e',
          dark: '#247541',
          line: 'rgba(255, 255, 255, 0.85)',
          wood: '#d4a373',
          futsalBlue: '#1e3a8a',
          futsalLightBlue: '#2563eb',
        },
      },
    },
  },
  plugins: [],
}

