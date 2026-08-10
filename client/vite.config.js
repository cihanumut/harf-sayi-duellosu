import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Harf & Sayı Düellosu',
        short_name: 'Harf&Sayı',
        description: 'Kelime ve sayı turlarıyla zeka yarışması oyunu.',
        lang: 'tr',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Uygulama kabuğunu çevrimdışı önbelleğe al (offline mod internetsiz çalışsın)
        globPatterns: ['**/*.{js,css,html,png,svg,json,woff2}'],
        navigateFallback: '/index.html',
      },
      devOptions: {
        // geliştirme modunda da service worker aktif olsun ki telefonda test edebilelim
        enabled: true,
      },
    }),
  ],
  server: {
    port: 5173,
    host: true, // telefondan aynı ağ üzerinden erişebilmek için LAN'a aç
    allowedHosts: ['.trycloudflare.com'], // HTTPS tünel üzerinden erişime izin ver
  },
});
