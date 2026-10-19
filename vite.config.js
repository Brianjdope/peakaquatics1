import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      base,
      workbox: {
        // Precache only the app shell; photos and the lazy three.js chunk are cached on demand
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        globIgnores: ['**/BusinessCard3D-*.js', 'offline.html'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ request, sameOrigin }) => sameOrigin && request.destination === 'image',
            handler: 'CacheFirst',
            options: { cacheName: 'image-cache', expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
          {
            urlPattern: /\/assets\/BusinessCard3D-.*\.js$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'lazy-chunk-cache', expiration: { maxEntries: 4 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/images\.squarespace-cdn\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'squarespace-img-cache', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
        ],
      },
      manifest: {
        name: 'Peak Aquatic Sports',
        short_name: 'Peak Aquatics',
        description: 'Elite swimming coaching & collegiate recruitment consulting.',
        theme_color: '#030303',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: base,
        scope: base,
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  base,
})
