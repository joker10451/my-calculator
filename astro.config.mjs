import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://schitay-online.ru',
  base: '/',
  output: 'static',
  trailingSlash: 'always',
  redirects: {
    '/dlya-semi/': '/semia/',
    '/calculator/ipotechnyj': '/semia/',
    '/calculator/kreditnyj': '/semia/',
    '/calculator/ndfl': '/dlya-samozanyatyh/kalkulyator-naloga/',
    '/calculator/zarplata': '/dlya-samozanyatyh/kalkulyator-naloga/',
    '/calculator/zhkh': '/zhkh/',
    '/calculator/osago': '/avto/',
    '/calculator/kasko': '/avto/',
    '/calculator/toplivo': '/avto/',
    '/calculator/alimenty': '/semia/',
    '/calculator/matkapital': '/semia/',
  },
  integrations: [
    react(),
    // базу Tailwind подключает src/styles/global.css (импорт в Layout.astro)
    tailwind({ applyBaseStyles: false }),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
});
