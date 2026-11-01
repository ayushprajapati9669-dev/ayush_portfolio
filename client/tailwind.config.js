/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // VSLFlow Black-Gold Design System
        obsidian: '#000000',
        charcoal: '#0a0a0a',
        graphite: '#0d0d0d',
        alabaster: '#ffffff',
        stonewarm: '#a0a0a0',
        vermilion: '#d4af37',   // remapped to gold
        amberwarm: '#d4af37',   // remapped to gold
        gold: '#d4af37',
        'gold-light': '#e8c84a',
        'gold-dark': '#b8960e',
        sage: '#4ade80',
        cyanglow: '#d4af37',    // remapped to gold

        // Override yellow scale to use our gold palette
        // so text-yellow-400, bg-yellow-500 etc. all resolve to gold tones
        yellow: {
          50:  '#fdf6e3',
          100: '#faecc8',
          200: '#f5d98a',
          300: '#edc94e',
          400: '#d4af37',   // <-- our core gold
          500: '#d4af37',   // <-- our core gold
          600: '#b8960e',   // <-- darker gold
          700: '#9a7c0a',
          800: '#7a6108',
          900: '#5c4906',
          950: '#3d3004',
        },
      },
      fontFamily: {
        // VSLFlow: Cormorant Garamond (display) + Jost (UI/body)
        display: ['Cormorant Garamond', 'Georgia', 'Times New Roman', 'serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Jost', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      }
    }
  },
  plugins: []
};
