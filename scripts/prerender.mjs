/**
 * Prerender script — генерация статических HTML из React SPA
 * Блокирует внешние запросы для ускорения загрузки.
 * Запуск: node scripts/prerender.mjs (после vite build)
 */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import handler from 'serve-handler';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '..', 'dist');
const PORT = 4173;

const routes = [
  '/', '/about', '/privacy', '/terms', '/contacts',
  '/all', '/compare', '/favorites', '/banks', '/sitemap',
  '/blog', '/offers', '/jobs', '/widgets',
  '/calculator/mortgage', '/calculator/salary', '/calculator/credit',
  '/calculator/bmi', '/calculator/fuel', '/calculator/tire-size',
  '/calculator/court-fee', '/calculator/utilities', '/calculator/osago',
  '/calculator/vacation', '/calculator/sick-leave', '/calculator/self-employed',
  '/calculator/pension', '/calculator/kasko', '/calculator/investment',
  '/calculator/compound-interest', '/calculator/rent-vs-buy',
  '/calculator/budget', '/calculator/debt-payoff', '/calculator/overpayment',
  '/calculator/tax-deduction', '/calculator/calories',
  '/calculator/maternity-capital', '/calculator/water', '/calculator/alimony',
  '/calculator/refinancing', '/calculator/inflation',
  '/calculator/deposit', '/calculator/deposit-tax', '/calculator/currency',
  '/courier-yandex', '/joy-money', '/tick-insurance',
  '/goldapple', '/ruki-masters',
  '/how-much-you-lose', '/key-rate', '/checklist', '/quiz/financial-literacy',
];

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      return handler(req, res, { public: DIST_DIR, rewrites: [{ source: '**', destination: '/index.html' }] });
    });
    server.listen(PORT, () => resolve(server));
  });
}

async function prerender() {
  console.log(`\n🔨 Prerender: ${routes.length} маршрутов\n`);

  const server = await startServer();
  console.log(`  📡 Сервер запущен на http://127.0.0.1:${PORT}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let success = 0;
  let failed = 0;

  for (const route of routes) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Блокируем все внешние запросы (кроме localhost)
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const url = req.url();
      if (url.startsWith('http://127.0.0.1') || url.startsWith('http://localhost')) {
        req.continue();
      } else {
        req.abort();
      }
    });

    // Перехватываем console.error чтобы не засорять вывод
    page.on('pageerror', () => {});

    try {
      const url = `http://127.0.0.1:${PORT}${route}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      // Даём React время на гидратацию
      await new Promise(r => setTimeout(r, 3000));

      const html = await page.content();

      let filePath;
      if (route === '/') {
        filePath = path.join(DIST_DIR, 'index.html');
      } else {
        filePath = path.join(DIST_DIR, route, 'index.html');
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }
      fs.writeFileSync(filePath, html, 'utf-8');
      console.log(`  ✅ ${route}`);
      success++;
    } catch (err) {
      console.log(`  ❌ ${route}: ${err.message.split('\n')[0]}`);
      failed++;
    }

    await page.close();
  }

  await browser.close();
  server.close();

  console.log(`\n🎉 Готово: ${success} ✅ / ${failed} ❌\n`);
}

prerender();
