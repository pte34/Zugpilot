import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'ZugPilot',
        short_name: 'ZugPilot',
        description: 'Findet deine gelernten Zugverbindungen mit einem Tap.',
        theme_color: '#1d4ed8',
        background_color: '#0f1115',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // API-Antworten von transport.opendata.ch sind Verbindungen, kein
        // App-Shell-Asset - die werden bewusst NICHT vom Service Worker
        // gecacht, damit immer der aktuelle Fahrplan angezeigt wird.
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      },
    }),
  ],
})
