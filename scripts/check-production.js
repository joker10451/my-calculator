/**
 * Скрипт для проверки production после деплоя
 * Проверяет доступность сайта, основных страниц и функциональности
 */

import https from 'https';
import http from 'http';

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://schitay-online.ru';
const TIMEOUT = 10000; // 10 секунд

// Список страниц для проверки
const pagesToCheck = [
  { path: '/', name: 'Главная страница' },
  { path: '/blog', name: 'Блог' },
  { path: '/all', name: 'Все калькуляторы' },
  { path: '/calculator/mortgage', name: 'Калькулятор ипотеки' },
  { path: '/calculator/salary', name: 'Калькулятор зарплаты' },
  { path: '/sitemap.xml', name: 'Sitemap' },
  { path: '/robots.txt', name: 'Robots.txt' },
];

// Список статей блога для проверки
const blogPostsToCheck = [
  { path: '/blog/ipoteka-2026-novye-usloviya', name: 'Статья: Ипотека 2026' },
  { path: '/blog/ndfl-2026-progressivnaya-shkala', name: 'Статья: НДФЛ 2026' },
];

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

async function checkUrl(url, name) {
  return new Promise((resolve) => {
    totalChecks++;
    
    const protocol = url.startsWith('https') ? https : http;
    const startTime = Date.now();
    
    const req = protocol.get(url, { timeout: TIMEOUT }, (res) => {
      const loadTime = Date.now() - startTime;
      
      if (res.statusCode === 200) {
        passedChecks++;
        console.log(`✅ ${name}`);
        console.log(`   URL: ${url}`);
        console.log(`   Статус: ${res.statusCode}`);
        console.log(`   Время загрузки: ${loadTime}ms`);
        console.log('');
        resolve({ success: true, statusCode: res.statusCode, loadTime });
      } else {
        failedChecks++;
        console.log(`❌ ${name}`);
        console.log(`   URL: ${url}`);
        console.log(`   Статус: ${res.statusCode}`);
        console.log(`   Ожидался: 200`);
        console.log('');
        resolve({ success: false, statusCode: res.statusCode, loadTime });
      }
    });
    
    req.on('error', (error) => {
      failedChecks++;
      console.log(`❌ ${name}`);
      console.log(`   URL: ${url}`);
      console.log(`   Ошибка: ${error.message}`);
      console.log('');
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      failedChecks++;
      req.destroy();
      console.log(`❌ ${name}`);
      console.log(`   URL: ${url}`);
      console.log(`   Ошибка: Timeout (${TIMEOUT}ms)`);
      console.log('');
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

async function checkSitemap() {
  return new Promise((resolve) => {
    totalChecks++;
    const url = `${PRODUCTION_URL}/sitemap.xml`;
    
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          // Проверяем что это валидный XML
          if (data.includes('<?xml') && data.includes('<urlset')) {
            // Подсчитываем количество URL
            const urlCount = (data.match(/<url>/g) || []).length;
            
            passedChecks++;
            console.log(`✅ Sitemap валиден`);
            console.log(`   URL: ${url}`);
            console.log(`   Количество страниц: ${urlCount}`);
            console.log('');
            resolve({ success: true, urlCount });
          } else {
            failedChecks++;
            console.log(`❌ Sitemap невалиден`);
            console.log(`   URL: ${url}`);
            console.log(`   Проблема: Не является валидным XML`);
            console.log('');
            resolve({ success: false });
          }
        } else {
          failedChecks++;
          console.log(`❌ Sitemap недоступен`);
          console.log(`   URL: ${url}`);
          console.log(`   Статус: ${res.statusCode}`);
          console.log('');
          resolve({ success: false, statusCode: res.statusCode });
        }
      });
    });
    
    req.on('error', (error) => {
      failedChecks++;
      console.log(`❌ Sitemap недоступен`);
      console.log(`   URL: ${url}`);
      console.log(`   Ошибка: ${error.message}`);
      console.log('');
      resolve({ success: false, error: error.message });
    });
  });
}

async function checkRobotsTxt() {
  return new Promise((resolve) => {
    totalChecks++;
    const url = `${PRODUCTION_URL}/robots.txt`;
    
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          // Проверяем что содержит необходимые директивы
          const hasUserAgent = data.includes('User-agent:');
          const hasSitemap = data.includes('Sitemap:');
          
          if (hasUserAgent && hasSitemap) {
            passedChecks++;
            console.log(`✅ Robots.txt валиден`);
            console.log(`   URL: ${url}`);
            console.log(`   Содержит User-agent: ${hasUserAgent}`);
            console.log(`   Содержит Sitemap: ${hasSitemap}`);
            console.log('');
            resolve({ success: true });
          } else {
            failedChecks++;
            console.log(`❌ Robots.txt невалиден`);
            console.log(`   URL: ${url}`);
            console.log(`   Содержит User-agent: ${hasUserAgent}`);
            console.log(`   Содержит Sitemap: ${hasSitemap}`);
            console.log('');
            resolve({ success: false });
          }
        } else {
          failedChecks++;
          console.log(`❌ Robots.txt недоступен`);
          console.log(`   URL: ${url}`);
          console.log(`   Статус: ${res.statusCode}`);
          console.log('');
          resolve({ success: false, statusCode: res.statusCode });
        }
      });
    });
    
    req.on('error', (error) => {
      failedChecks++;
      console.log(`❌ Robots.txt недоступен`);
      console.log(`   URL: ${url}`);
      console.log(`   Ошибка: ${error.message}`);
      console.log('');
      resolve({ success: false, error: error.message });
    });
  });
}

async function runChecks() {
  console.log('🔍 Проверка production после деплоя');
  console.log(`🌐 URL: ${PRODUCTION_URL}`);
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Проверяем основные страницы
  console.log('📄 Проверка основных страниц:');
  console.log('');
  
  for (const page of pagesToCheck) {
    await checkUrl(`${PRODUCTION_URL}${page.path}`, page.name);
  }

  // Проверяем статьи блога
  console.log('📝 Проверка статей блога:');
  console.log('');
  
  for (const post of blogPostsToCheck) {
    await checkUrl(`${PRODUCTION_URL}${post.path}`, post.name);
  }

  // Проверяем sitemap
  console.log('🗺️  Проверка SEO файлов:');
  console.log('');
  
  await checkSitemap();
  await checkRobotsTxt();

  // Итоговая статистика
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📊 Итоговая статистика:');
  console.log(`   Всего проверок: ${totalChecks}`);
  console.log(`   ✅ Успешно: ${passedChecks}`);
  console.log(`   ❌ Ошибок: ${failedChecks}`);
  console.log('');

  if (failedChecks === 0) {
    console.log('🎉 Все проверки пройдены успешно!');
    console.log('✅ Production готов к использованию');
    process.exit(0);
  } else {
    console.log('⚠️  Обнаружены проблемы!');
    console.log('❌ Требуется исправление');
    process.exit(1);
  }
}

// Запускаем проверки
runChecks().catch((error) => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});
