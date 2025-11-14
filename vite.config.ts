import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    host: true,
    strictPort: true,
    allowedHosts: [
      'workout-tracker-web-production-0e1e.up.railway.app',
      '.railway.app',
    ],
  },
})

