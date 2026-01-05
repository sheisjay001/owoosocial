/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        text: 'var(--text)',
        primary: 'var(--primary)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)'
      }
    },
  },
  darkMode: 'class',
  plugins: [],
}
