/**
 * Генератор sitemap.xml с приоритетами
 * Запускается после сборки проекта
 * Обновлено для поддержки статей блога
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://schitay-online.ru';
const DIST_DIR = path.join(__dirname, '..', 'dist');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Загружаем статьи блога
function loadBlogPosts() {
  try {
    // Читаем все файлы с данными блога
    const blogFiles = [
      'src/data/blogPosts.ts',
      'src/data/blogPostsNew3.ts',
      'src/data/blogPostsNew4.ts', 
      'src/data/blogPostsNew5.ts',
      'src/data/blogArticlesGenerated.ts',
      'src/data/blogArticlesGenerated2.ts'
    ];
    
    const allSlugs = [];
    
    for (const filePath of blogFiles) {
      const fullPath = path.join(__dirname, '..', filePath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Извлекаем slug'и из каждого файла
        const slugMatches = content.matchAll(/slug:\s*['"]([^'"]+)['"]/g);
        const slugs = Array.from(slugMatches).map(m => m[1]);
        allSlugs.push(...slugs);
      }
    }
    
    // Убираем дубликаты
    return [...new Set(allSlugs)];
  } catch (error) {
    console.warn('⚠️  Не удалось загрузить статьи блога:', error.message);
    return [];
  }
}

// Определяем страницы с приоритетами
const pages = [
  // Главная страница
  { url: '/', priority: 1.0, changefreq: 'daily' },
  
  // Основные страницы
  { url: '/all', priority: 0.9, changefreq: 'weekly' },
  { url: '/about', priority: 0.5, changefreq: 'monthly' },
  { url: '/contacts', priority: 0.5, changefreq: 'monthly' },
  { url: '/blog', priority: 0.8, changefreq: 'weekly' },
  
  // Категории блога
  { url: '/blog/category/mortgage-credit', priority: 0.7, changefreq: 'weekly' },
  { url: '/blog/category/taxes-salary', priority: 0.7, changefreq: 'weekly' },
  { url: '/blog/category/utilities-housing', priority: 0.7, changefreq: 'weekly' },
  { url: '/blog/category/auto-transport', priority: 0.7, changefreq: 'weekly' },
  { url: '/blog/category/health-fitness', priority: 0.7, changefreq: 'weekly' },
  { url: '/blog/category/investments-deposits', priority: 0.7, changefreq: 'weekly' },
  { url: '/blog/category/legal-issues', priority: 0.7, changefreq: 'weekly' },
  { url: '/blog/category/family-children', priority: 0.7, changefreq: 'weekly' },
  
  // Категории калькуляторов
  { url: '/category/financial', priority: 0.8, changefreq: 'weekly' },
  { url: '/category/personal', priority: 0.8, changefreq: 'weekly' },
  { url: '/category/transport', priority: 0.7, changefreq: 'weekly' },
  { url: '/category/utilities', priority: 0.7, changefreq: 'weekly' },
  { url: '/category/legal', priority: 0.7, changefreq: 'weekly' },
  { url: '/category/family', priority: 0.8, changefreq: 'weekly' },
  
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
  
  // Загружаем статьи блога
  const blogSlugs = loadBlogPosts();
  console.log(`📝 Найдено статей блога: ${blogSlugs.length}`);
  
  // Добавляем статьи блога к страницам
  const blogPages = blogSlugs.map(slug => ({
    url: `/blog/${slug}`,
    priority: 0.7,
    changefreq: 'monthly'
  }));
  
  const allPages = [...pages, ...blogPages];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  allPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}${page.url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  // Сохраняем sitemap.xml в dist
  const sitemapDistPath = path.join(DIST_DIR, 'sitemap.xml');
  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.writeFileSync(sitemapDistPath, xml, 'utf8');
  
  // Также сохраняем в public для разработки
  const sitemapPublicPath = path.join(PUBLIC_DIR, 'sitemap.xml');
  fs.writeFileSync(sitemapPublicPath, xml, 'utf8');
  
  console.log('✅ sitemap.xml успешно создан!');
  console.log(`📍 Путь (dist): ${sitemapDistPath}`);
  console.log(`📍 Путь (public): ${sitemapPublicPath}`);
  console.log(`📊 Всего страниц в sitemap: ${allPages.length}`);
  console.log(`   - Статических страниц: ${pages.length}`);
  console.log(`   - Статей блога: ${blogSlugs.length}`);
  
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
Disallow: /dist/
Disallow: /node_modules/

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/sitemap-blog.xml

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
  
  // Сохраняем в dist
  const robotsDistPath = path.join(DIST_DIR, 'robots.txt');
  fs.writeFileSync(robotsDistPath, robotsTxt, 'utf8');
  
  // Также сохраняем в public
  const robotsPublicPath = path.join(PUBLIC_DIR, 'robots.txt');
  fs.writeFileSync(robotsPublicPath, robotsTxt, 'utf8');
  
  console.log('✅ robots.txt успешно создан!');
  console.log(`📍 Путь (dist): ${robotsDistPath}`);
  console.log(`📍 Путь (public): ${robotsPublicPath}`);
}

// Запускаем генерацию
try {
  generateSitemap();
} catch (error) {
  console.error('❌ Ошибка при генерации sitemap:', error);
  process.exit(1);
}
