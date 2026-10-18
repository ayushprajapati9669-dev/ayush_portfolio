/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#080B14',
        charcoal: '#0E1322',
        graphite: '#141B2D',
        alabaster: '#F8FAFC',
        stonewarm: '#94A3B8',
        vermilion: '#FF6B4A',
        amberwarm: '#F59E0B',
        sage: '#10B981',
        indigoaccent: '#6366F1',
        cyanglow: '#00D4FF'
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
