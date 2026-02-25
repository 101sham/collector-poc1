import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/listings': { target: 'http://localhost:3002', rewrite: path => path.replace('/api/listings', '/listings'), changeOrigin: true },
      '/api/auth': { target: 'http://localhost:3001', rewrite: path => path.replace('/api/auth', '/auth'), changeOrigin: true },
    },
  },
})
