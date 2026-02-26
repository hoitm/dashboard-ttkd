import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert';
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
   
   
  server: {
    
    https: true, // ❗ Thêm dòng này để bắt Vite chạy HTTP
    host: true,   // ⚠️ Bắt buộc nếu muốn test từ mạng ngoài (điện thoại)
    allowedHosts: ['.ngrok-free.app'], // ✅ Cho phép tất cả subdomain của ngrok

  },
  plugins: [react(), mkcert(),


    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,ico,webmanifest}'],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // => 5MB (tùy chỉnh theo nhu cầu bạn)
      },
      includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifestFilename: 'manifest.webmanifest', // ⬅️ fix tên
      manifest: {
        name: 'VNPT Phú Yên',
        short_name: 'VNPTPYN',
        description: 'Ứng dụng nội bộ điểm tin Phú Yên',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }, {
           src: "/images/icon.png",
            sizes: "192x192",
            type: "image/png",    purpose: "any maskable"
        }, 
        {
            src: "/images/icon-192.png",
            sizes: "192x192",
            type: "image/png"  ,  purpose: "any maskable"
        }, 
        {
            src: "/images/badge.png",
            sizes: "72x72",
            type: "image/png" ,   
            purpose: "any maskable"
        }
        ]
      }
    })

  ],
  base: '/', // Quan trọng để hoạt động trên IIS!
  
})
/*
  server: {
    https: true, // 🔒 bật HTTPS
    host: true,  // cho phép LAN IP truy cập
  },
*/