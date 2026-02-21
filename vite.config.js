import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  server: {
    // Lock down the port so Chrome always knows where to look
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
    // This tells Vite to allow requests from the Chrome Extension
    cors: {
      origin: '*', 
    }
  }
})