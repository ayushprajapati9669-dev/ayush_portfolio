/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#030303',
        charcoal: '#0b0b0b',
        graphite: '#141414',
        alabaster: '#f1eee8',
        stonewarm: '#aaa9a4',
        vermilion: '#ff8c59',
        amberwarm: '#f59e0b',
        sage: '#10b981',
        indigoaccent: '#818cf8',
        cyanglow: '#ff8c59',
        cream: '#e7dcc9'
      },
      fontFamily: {
        display: ['Outfit', 'Space Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: []
};
