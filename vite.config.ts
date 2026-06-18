import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Relative base so assets load over file:// inside the packaged Electron app
  base: './',
  plugins: [
    tailwindcss(),
    react(),
  ],
})
