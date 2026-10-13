/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060b17',
          900: '#0b1329',
          850: '#0e1834',
          800: '#132145',
          700: '#1d2f5e',
          600: '#284180',
        },
        radar: {
          cyan: '#06b6d4',
          teal: '#14b8a6',
          sky: '#38bdf8',
          accent: '#00f2fe'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
