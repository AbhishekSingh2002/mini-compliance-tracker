import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/clients': 'http://localhost:5000',
      '/tasks':   'http://localhost:5000',
      '/stats':   'http://localhost:5000',   // ← was missing before this fix
    }
  }
})