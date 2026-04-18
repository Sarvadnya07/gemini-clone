import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'Gemini Clone',
        short_name: 'Gemini',
        description: 'A production-grade AI chat interface powered by Google Gemini.',
        theme_color: '#1e1f20',
        background_color: '#131314',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Cache static assets aggressively
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Cache API calls for 30 seconds (short TTL; data is dynamic)
            urlPattern: /^https?:\/\/localhost:5000\/api\//i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'gemini-api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 30 },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
    }),
  ],
  build: {
    // Code splitting for optimal chunk sizes
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'motion': ['framer-motion'],
          'markdown': ['react-markdown', 'react-syntax-highlighter'],
          'firebase': ['firebase/app', 'firebase/auth'],
        },
      },
    },
    // Enable minification with terser
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,   // Remove console.log in production
        drop_debugger: true,
      },
    },
    // Warn if any chunk exceeds 500KB
    chunkSizeWarningLimit: 500,
    sourcemap: false, // Disable sourcemaps in production for security
  },
})
