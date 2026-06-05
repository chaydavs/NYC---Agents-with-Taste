import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Local dev: forward API calls to the standalone handler server.
      // In prod on Vercel, /api is served by the functions directly (no proxy).
      '/api': 'http://localhost:3001',
    },
  },
})
