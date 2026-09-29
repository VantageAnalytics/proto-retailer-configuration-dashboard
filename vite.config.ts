import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The project lives under ~/Desktop, where fsevents watching is unreliable.
  server: { watch: { usePolling: true, interval: 300 } },
})
