import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('phaser')) {
              return 'phaser';
            }
            if (id.includes('framer-motion')) {
              return 'animation';
            }
            if (id.includes('zustand')) {
              return 'state';
            }
          }
        },
      },
    },
    // Increase chunk size warning limit for Phaser
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    // Pre-bundle these dependencies
    include: ['phaser', 'zustand', 'framer-motion'],
  },
})
