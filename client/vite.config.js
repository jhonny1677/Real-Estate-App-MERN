import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png'],
      manifest: {
        name: 'EstateHub — Real Estate',
        short_name: 'EstateHub',
        description: 'Find your perfect property with EstateHub',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        id: '/',
        icons: [
          { src: '/favicon.png', sizes: '150x150', type: 'image/png', purpose: 'any' },
          { src: '/logo.png',    sizes: '100x100', type: 'image/png', purpose: 'any' },
        ],
        categories: ['lifestyle', 'business'],
        shortcuts: [],
        screenshots: [
          { src: '/bg.png', sizes: '800x1000', type: 'image/png', form_factor: 'wide',  label: 'EstateHub desktop' },
          { src: '/bg.png', sizes: '800x1000', type: 'image/png', label: 'EstateHub mobile' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,ico}'],
        runtimeCaching: [
          {
            // Cache API responses for property lists
            urlPattern: /\/api\/posts/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-posts',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            // Cache property images
            urlPattern: /^https:\/\/images\.unsplash\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8800',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    'process.env': {},
  },
});
