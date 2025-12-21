import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // root: '.', // Remove explicit root to rely on default (current working dir of the script)
  build: {
    outDir: 'dist',
    rollupOptions: {
      // input: 'index.html', // Let Vite discover index.html automatically
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})