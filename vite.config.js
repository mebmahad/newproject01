import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  root: 'custom-root',
  build: {
    outDir: 'custom-out-dir',
  },
  plugins: [react()],
})
