import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forward API calls to FastAPI during development, so no CORS setup is needed
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
