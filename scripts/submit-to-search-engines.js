/**
 * Скрипт для отправки URL в поисковые системы
 * Генерирует список URL для ручной отправки в Google Search Console и Yandex Webmaster
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://schitay-online.ru';
const OUTPUT_FILE = path.join(__dirname, '..', 'urls-to-submit.txt');

// Загружаем статьи блога
function loadBlogPosts() {
  try {
    const blogDataPath = path.join(__dirname, '..', 'src', 'data', 'blogPosts.ts');
    
    if (fs.existsSync(blogDataPath)) {
      const content = fs.readFileSync(blogDataPath, 'utf8');
      
      // Извлекаем slug'и статей
      const slugMatches = content.matchAll(/slug:\s*['"]([^'"]+)['"]/g);
      const publishedMatches = content.matchAll(/isPublished:\s*(true|false)/g);
      
      const slugs = Array.from(slugMatches).map(m => m[1]);
      const published = Array.from(publishedMatches).map(m => m[1] === 'true');
      
      // Фильтруем только опубликованные статьи
      return slugs.filter((_, index) => published[index] || published.length === 0);
    }
    
    return [];
  } catch (error) {
    console.warn('⚠️  Не удалось загрузить статьи блога:', error.message);
    return [];
  }
}

function generateUrlList() {
  console.log('📝 Генерация списка URL для отправки в поисковые системы');
  console.log('');

  // Основные страницы
  const mainPages = [
    '/',
    '/blog',
    '/all',
    '/about',
    '/contacts',
  ];

  // Категории блога
  const blogCategories = [
    '/blog/category/mortgage-credit',
    '/blog/category/taxes-salary',
    '/blog/category/utilities-housing',
    '/blog/category/auto-transport',
    '/blog/category/health-fitness',
    '/blog/category/investments-deposits',
    '/blog/category/legal-issues',
    '/blog/category/family-children',
  ];

  // Категории калькуляторов
  const calculatorCategories = [
    '/category/financial',
    '/category/personal',
    '/category/transport',
    '/category/utilities',
    '/category/legal',
    '/category/family',
  ];

  // Калькуляторы
  const calculators = [
    '/calculator/mortgage',
    '/calculator/salary',
    '/calculator/credit',
    '/calculator/osago',
    '/calculator/vacation',
    '/calculator/sick-leave',
    '/calculator/self-employed',
    '/calculator/pension',
    '/calculator/kasko',
    '/calculator/investment',
    '/calculator/deposit',
    '/calculator/refinancing',
    '/calculator/bmi',
    '/calculator/fuel',
    '/calculator/utilities',
    '/calculator/maternity-capital',
    '/calculator/calories',
    '/calculator/water',
    '/calculator/alimony',
    '/calculator/currency',
    '/calculator/court-fee',
    '/calculator/tire-size',
  ];

  // Статьи блога
  const blogSlugs = loadBlogPosts();
  const blogPosts = blogSlugs.map(slug => `/blog/${slug}`);

  console.log(`📊 Статистика:`);
  console.log(`   Основных страниц: ${mainPages.length}`);
  console.log(`   Категорий блога: ${blogCategories.length}`);
  console.log(`   Категорий калькуляторов: ${calculatorCategories.length}`);
  console.log(`   Калькуляторов: ${calculators.length}`);
  console.log(`   Статей блога: ${blogPosts.length}`);
  console.log('');

  // Объединяем все URL
  const allUrls = [
    ...mainPages,
    ...blogCategories,
    ...calculatorCategories,
    ...calculators,
    ...blogPosts,
  ];

  // Генерируем полные URL
  const fullUrls = allUrls.map(path => `${SITE_URL}${path}`);

  // Сохраняем в файл
  const content = fullUrls.join('\n');
  fs.writeFileSync(OUTPUT_FILE, content, 'utf8');

  console.log('✅ Список URL создан!');
  console.log(`📍 Путь: ${OUTPUT_FILE}`);
  console.log(`📊 Всего URL: ${fullUrls.length}`);
  console.log('');

  // Генерируем инструкции
  generateInstructions(fullUrls.length, blogPosts.length);
}

function generateInstructions(totalUrls, newArticles) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📋 Инструкции по отправке в поисковые системы');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Google Search Console
  console.log('🔍 Google Search Console');
  console.log('');
  console.log('1. Отправка Sitemap:');
  console.log('   a. Откройте https://search.google.com/search-console');
  console.log('   b. Выберите ваш сайт');
  console.log('   c. Sitemaps → Add new sitemap');
  console.log(`   d. Введите: ${SITE_URL}/sitemap.xml`);
  console.log('   e. Submit');
  console.log('');
  console.log('2. Отправка отдельных URL (для новых статей):');
  console.log('   a. URL Inspection');
  console.log('   b. Введите URL статьи');
  console.log('   c. Request Indexing');
  console.log(`   d. Повторите для ${newArticles} новых статей`);
  console.log('');
  console.log('💡 Совет: Приоритет отдавайте новым статьям блога');
  console.log('');

  // Yandex Webmaster
  console.log('🔍 Yandex Webmaster');
  console.log('');
  console.log('1. Отправка Sitemap:');
  console.log('   a. Откройте https://webmaster.yandex.ru');
  console.log('   b. Выберите ваш сайт');
  console.log('   c. Индексирование → Файлы Sitemap');
  console.log(`   d. Добавьте: ${SITE_URL}/sitemap.xml`);
  console.log('');
  console.log('2. Отправка отдельных URL:');
  console.log('   a. Инструменты → Переобход страниц');
  console.log('   b. Добавьте URL (можно несколько через Enter)');
  console.log('   c. Отправить');
  console.log('');
  console.log('💡 Совет: Yandex индексирует быстрее, если добавить URL вручную');
  console.log('');

  // Bing Webmaster Tools
  console.log('🔍 Bing Webmaster Tools (опционально)');
  console.log('');
  console.log('1. Откройте https://www.bing.com/webmasters');
  console.log('2. Sitemaps → Submit Sitemap');
  console.log(`3. Введите: ${SITE_URL}/sitemap.xml`);
  console.log('');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📝 Дополнительные рекомендации');
  console.log('');
  console.log('1. Проверьте robots.txt:');
  console.log(`   ${SITE_URL}/robots.txt`);
  console.log('');
  console.log('2. Проверьте sitemap.xml:');
  console.log(`   ${SITE_URL}/sitemap.xml`);
  console.log('');
  console.log('3. Мониторьте индексацию:');
  console.log('   - Google: site:schitay-online.ru');
  console.log('   - Yandex: site:schitay-online.ru');
  console.log('');
  console.log('4. Проверяйте статус индексации через 1-2 недели');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
}

// Запускаем генерацию
try {
  generateUrlList();
} catch (error) {
  console.error('❌ Ошибка:', error);
  process.exit(1);
}
