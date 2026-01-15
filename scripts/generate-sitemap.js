/**
 * Генератор sitemap.xml с приоритетами
 * Запускается после сборки проекта
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://schitay-online.ru';
const DIST_DIR = path.join(__dirname, '..', 'dist');

// Определяем страницы с приоритетами
const pages = [
  // Главная страница
  { url: '/', priority: 1.0, changefreq: 'daily' },
  
  // Основные страницы
  { url: '/all', priority: 0.9, changefreq: 'weekly' },
  { url: '/about', priority: 0.5, changefreq: 'monthly' },
  { url: '/contacts', priority: 0.5, changefreq: 'monthly' },
  { url: '/blog', priority: 0.8, changefreq: 'weekly' },
  
  // Категории
  { url: '/category/financial', priority: 0.8, changefreq: 'weekly' },
  { url: '/category/personal', priority: 0.8, changefreq: 'weekly' },
  { url: '/category/transport', priority: 0.7, changefreq: 'weekly' },
  { url: '/category/utilities', priority: 0.7, changefreq: 'weekly' },
  { url: '/category/legal', priority: 0.7, changefreq: 'weekly' },
  
  // Калькуляторы (высокий приоритет)
  { url: '/calculator/mortgage', priority: 0.9, changefreq: 'weekly' },
  { url: '/calculator/salary', priority: 0.9, changefreq: 'weekly' },
  { url: '/calculator/credit', priority: 0.9, changefreq: 'weekly' },
  { url: '/calculator/osago', priority: 0.9, changefreq: 'weekly' },
  { url: '/calculator/vacation', priority: 0.9, changefreq: 'weekly' },
  { url: '/calculator/sick-leave', priority: 0.9, changefreq: 'weekly' },
  { url: '/calculator/self-employed', priority: 0.9, changefreq: 'weekly' },
  { url: '/calculator/pension', priority: 0.9, changefreq: 'weekly' },
  { url: '/calculator/kasko', priority: 0.9, changefreq: 'weekly' },
  { url: '/calculator/investment', priority: 0.9, changefreq: 'weekly' },
  { url: '/calculator/deposit', priority: 0.8, changefreq: 'weekly' },
  { url: '/calculator/refinancing', priority: 0.8, changefreq: 'weekly' },
  { url: '/calculator/bmi', priority: 0.8, changefreq: 'monthly' },
  { url: '/calculator/fuel', priority: 0.8, changefreq: 'monthly' },
  { url: '/calculator/utilities', priority: 0.7, changefreq: 'monthly' },
  { url: '/calculator/maternity-capital', priority: 0.8, changefreq: 'monthly' },
  { url: '/calculator/calories', priority: 0.7, changefreq: 'monthly' },
  { url: '/calculator/water', priority: 0.7, changefreq: 'monthly' },
  { url: '/calculator/alimony', priority: 0.7, changefreq: 'monthly' },
  { url: '/calculator/currency', priority: 0.8, changefreq: 'daily' },
  { url: '/calculator/court-fee', priority: 0.7, changefreq: 'monthly' },
  { url: '/calculator/tire-size', priority: 0.6, changefreq: 'monthly' },
  
  // Юридические страницы
  { url: '/privacy', priority: 0.3, changefreq: 'yearly' },
  { url: '/terms', priority: 0.3, changefreq: 'yearly' },
  { url: '/legal', priority: 0.3, changefreq: 'yearly' },
];

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  pages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}${page.url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  // Сохраняем sitemap.xml
  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf8');
  
  console.log('✅ sitemap.xml успешно создан!');
  console.log(`📍 Путь: ${sitemapPath}`);
  console.log(`📊 Страниц в sitemap: ${pages.length}`);
  
  // Создаем robots.txt
  generateRobotsTxt();
}

function generateRobotsTxt() {
  const robotsTxt = `# robots.txt для Считай.RU
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /*.json$
Disallow: /api/

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml

# Yandex
User-agent: Yandex
Allow: /
Crawl-delay: 0.5

# Google
User-agent: Googlebot
Allow: /
Crawl-delay: 0.5

# Bing
User-agent: Bingbot
Allow: /
Crawl-delay: 0.5
`;
  
  const robotsPath = path.join(DIST_DIR, 'robots.txt');
  fs.writeFileSync(robotsPath, robotsTxt, 'utf8');
  
  console.log('✅ robots.txt успешно создан!');
  console.log(`📍 Путь: ${robotsPath}`);
}

// Запускаем генерацию
try {
  generateSitemap();
} catch (error) {
  console.error('❌ Ошибка при генерации sitemap:', error);
  process.exit(1);
}
