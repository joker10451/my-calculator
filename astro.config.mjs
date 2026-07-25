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
    '/calculator/ipotechnyj': '/dlya-semi/',
    '/calculator/kreditnyj': '/dlya-semi/',
    '/calculator/ndfl': '/dlya-samozanyatyh/kalkulyator-naloga/',
    '/calculator/zarplata': '/dlya-samozanyatyh/kalkulyator-naloga/',
    '/calculator/zhkh': '/zhkh/',
    '/calculator/osago': '/avto/',
    '/calculator/kasko': '/avto/',
    '/calculator/toplivo': '/avto/',
    '/calculator/alimenty': '/dlya-semi/',
    '/calculator/matkapital': '/dlya-semi/',
  },
  integrations: [
    react(),
    tailwind(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
});
