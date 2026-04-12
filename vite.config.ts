import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import type { IncomingMessage, ServerResponse } from "http";
import type { ViteDevServer } from "vite";

// Middleware для настройки HTTP заголовков favicon файлов
const faviconHeadersMiddleware = () => {
  return {
    name: 'favicon-headers',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse<IncomingMessage>, next: () => void) => {
        const url = req.url;

        // Настройка заголовков для favicon файлов
        if (url === '/favicon.ico') {
          res.setHeader('Content-Type', 'image/x-icon');
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 год
          res.setHeader('Vary', 'Accept-Encoding');
        } else if (url === '/icon.svg') {
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 год
          res.setHeader('Vary', 'Accept-Encoding');
        } else if (url === '/apple-touch-icon.png') {
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 год
          res.setHeader('Vary', 'Accept-Encoding');
        } else if (url === '/icon-192.png' || url === '/icon-512.png') {
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 год
          res.setHeader('Vary', 'Accept-Encoding');
        } else if (url === '/manifest.json') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 день (может изменяться чаще)
          res.setHeader('Vary', 'Accept-Encoding');
        }

        // Добавляем заголовки безопасности для всех favicon файлов
        if (url && url.match(/\/(favicon\.ico|icon\.svg|apple-touch-icon\.png|icon-\d+\.png|manifest\.json)$/)) {
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        }

        next();
      });
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  base: "/",
  plugins: [
    react(),
    faviconHeadersMiddleware(), // Добавляем middleware для favicon заголовков
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      workbox: {
        maximumFileSizeToCacheInBytes: 4000000, // 4MB
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 год
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Считай.RU',
        short_name: 'Считай.RU',
        description: 'Бесплатные онлайн калькуляторы для России и СНГ',
        theme_color: '#3B82F6',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '48x48',
            type: 'image/x-icon'
          },
          {
            src: 'icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'framer-motion'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'pdf-vendor': ['jspdf', 'html2canvas'],
          'chart-vendor': ['recharts'],
          'supabase-vendor': ['@supabase/supabase-js'],
        },
        chunkFileNames: (_chunkInfo) => {
          return `assets/[name]-[hash].js`;
        }
      },
    },
    chunkSizeWarningLimit: 500,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/shared": path.resolve(__dirname, "./src/shared"),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'recharts',
      'jspdf',
      'html2canvas',
      'clsx',
      'tailwind-merge'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  }
}));
