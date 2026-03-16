import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Suppress React Router future flag warnings
    'process.env': {}
  },
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  }
})