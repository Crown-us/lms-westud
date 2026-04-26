import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three')) return 'three-vendor';
            if (id.includes('framer-motion')) return 'framer-vendor';
            if (id.includes('@supabase')) return 'supabase-vendor';
            if (id.includes('@tanstack')) return 'tanstack-vendor';
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})
