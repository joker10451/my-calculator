#!/usr/bin/env node

/**
 * Скрипт для генерации статических HTML файлов для GitHub Pages
 * Создает .html файлы напрямую (без редиректов!)
 */

import fs from 'fs';
import path from 'path';

// Конфигурация маршрутов
const routes = [
  { path: '/', file: 'index', title: 'Считай.RU — Бесплатные онлайн калькуляторы для России и СНГ', description: '🧮 Бесплатные калькуляторы 2026: ипотека, кредит, зарплата, ИМТ, ЖКХ, топливо. Точные расчёты за 10 секунд. Работает офлайн, без регистрации.' },
  { path: '/all', file: 'all', title: 'Все калькуляторы — Каталог онлайн калькуляторов', description: 'Полный каталог бесплатных онлайн калькуляторов: финансы, здоровье, транспорт, ЖКХ. Найдите нужный калькулятор.' },
  { path: '/about', file: 'about', title: 'О проекте Считай.RU — Бесплатные онлайн калькуляторы', description: 'Считай.RU — бесплатный сервис онлайн калькуляторов для России и СНГ. Ипотека, зарплата, налоги, ЖКХ и многое другое.' },
  { path: '/contacts', file: 'contacts', title: 'Контакты — Связаться с Считай.RU', description: 'Контактная информация Считай.RU. Email для связи, предложений и вопросов.' },
  { path: '/privacy', file: 'privacy', title: 'Политика конфиденциальности — Считай.RU', description: 'Политика обработки персональных данных сервиса Считай.RU. Как мы защищаем вашу информацию.' },
  { path: '/terms', file: 'terms', title: 'Условия использования — Считай.RU', description: 'Пользовательское соглашение сервиса Считай.RU. Правила использования бесплатных онлайн калькуляторов.' },
  { path: '/blog', file: 'blog', title: 'Блог — Полезные статьи о финансах и расчетах', description: 'Статьи о том, как правильно рассчитывать ипотеку, налоги, пособия. Советы по финансовому планированию от Считай.RU.' },
  { path: '/calculator/mortgage', file: 'calculator/mortgage', title: 'Ипотечный калькулятор онлайн — Расчет платежа 2025', description: 'Рассчитайте ипотеку онлайн: ежемесячный платеж, переплату, график платежей. Учитываем ставки 2025 года, первоначальный взнос, срок кредита.' },
  { path: '/calculator/salary', file: 'calculator/salary', title: 'Калькулятор зарплаты онлайн — Расчет НДФЛ и на руки', description: 'Рассчитайте зарплату с учетом НДФЛ 13%. Переводим зарплату до вычета налогов в зарплату на руки и наоборот. Актуальные ставки 2025.' },
  { path: '/calculator/credit', file: 'calculator/credit', title: 'Кредитный калькулятор онлайн — Расчет платежей', description: 'Калькулятор потребительского кредита: расчет ежемесячного платежа, процентов, переплаты. Аннуитетные и дифференцированные платежи.' },
  { path: '/calculator/bmi', file: 'calculator/bmi', title: 'Калькулятор ИМТ онлайн — Индекс массы тела', description: 'Рассчитайте индекс массы тела (ИМТ) бесплатно. Узнайте свою норму веса, ожирение или дефицит массы тела по формуле ВОЗ.' },
  { path: '/calculator/fuel', file: 'calculator/fuel', title: 'Калькулятор расхода топлива — Расчет стоимости поездки', description: 'Рассчитайте расход бензина на 100 км и стоимость поездки. Учитываем расход автомобиля, цену топлива, расстояние.' },
  { path: '/calculator/utilities', file: 'calculator/utilities', title: 'Калькулятор ЖКХ онлайн — Расчет коммунальных платежей', description: 'Рассчитайте коммунальные услуги: отопление, вода, электричество, газ. Тарифы ЖКХ 2025 по регионам России.' },
  { path: '/calculator/court-fee', file: 'calculator/court-fee', title: 'Калькулятор госпошлины в суд 2025 — Расчет онлайн', description: 'Рассчитайте госпошлину для суда общей юрисдикции и арбитражного суда. Тарифы 2025, льготы, калькулятор искового заявления.' },
  { path: '/calculator/deposit', file: 'calculator/deposit', title: 'Депозитный калькулятор онлайн — Расчет доходности вклада', description: 'Рассчитайте доходность банковского вклада с капитализацией и без. Проценты, сумма в конце срока, сравнение условий.' },
  { path: '/calculator/currency', file: 'calculator/currency', title: 'Конвертер валют онлайн — Курс ЦБ РФ', description: 'Конвертер валют по курсу Центробанка России. Перевод рублей в доллары, евро, юани и обратно. Актуальный курс на сегодня.' },
  { path: '/calculator/refinancing', file: 'calculator/refinancing', title: 'Калькулятор рефинансирования — Выгодно ли перекредитоваться', description: 'Рассчитайте выгоду от рефинансирования кредита или ипотеки. Сравните старые и новые условия, экономию на процентах.' },
  { path: '/calculator/alimony', file: 'calculator/alimony', title: 'Калькулятор алиментов 2025 — Расчет размера выплат', description: 'Рассчитайте размер алиментов на ребенка в 2025 году. Процент от зарплаты, фиксированная сумма, МРОТ. Онлайн калькулятор.' },
  { path: '/calculator/maternity-capital', file: 'calculator/maternity-capital', title: 'Калькулятор материнского капитала 2025', description: 'Рассчитайте размер материнского капитала в 2025 году. Индексация, региональные выплаты, на что потратить.' },
  { path: '/calculator/calories', file: 'calculator/calories', title: 'Калькулятор калорий онлайн — Суточная норма', description: 'Рассчитайте суточную норму калорий для похудения, набора массы или поддержания веса. Формулы Миффлина-Сан Жеора и Харриса-Бенедикта.' },
  { path: '/calculator/water', file: 'calculator/water', title: 'Калькулятор воды онлайн — Сколько пить воды в день', description: 'Рассчитайте дневную норму воды исходя из веса и активности. Сколько нужно пить воды в день для здоровья.' },
  { path: '/calculator/tire-size', file: 'calculator/tire-size', title: 'Калькулятор размера шин — Подбор шин для авто', description: 'Подберите шины для автомобиля по размеру. Калькулятор совместимости шин, сравнение размеров, расчет клиренса.' },
];

// Получаем entry point файл из assets
function getEntryPoint() {
  const assetsPath = path.join(process.cwd(), 'dist', 'assets');
  const files = fs.readdirSync(assetsPath);
  const indexFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
  return indexFile ? `/assets/${indexFile}` : '/assets/index.js';
}

// Получаем CSS файл
function getCSSFile() {
  const assetsPath = path.join(process.cwd(), 'dist', 'assets');
  const files = fs.readdirSync(assetsPath);
  const cssFile = files.find(f => f.startsWith('index-') && f.endsWith('.css'));
  return cssFile ? `/assets/${cssFile}` : null;
}

// Базовый HTML шаблон
function generateHTML(route) {
  const baseUrl = 'https://schitay-online.ru';
  const fullUrl = `${baseUrl}${route.path}`;
  // Для .html файлов canonical без слэша
  const canonicalUrl = route.path === '/' ? baseUrl : fullUrl;
  const entryPoint = getEntryPoint();
  const cssFile = getCSSFile();
  
  const cssLink = cssFile ? `  <link rel="stylesheet" crossorigin href="${cssFile}">\n` : '';
  
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${route.title}</title>
  <meta name="description" content="${route.description}" />
  <meta name="keywords" content="калькулятор онлайн, расчет, бесплатно, 2025" />
  <meta name="author" content="Считай.RU" />
  <meta name="robots" content="index, follow" />
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${canonicalUrl}" />
  
  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${fullUrl}" />
  <meta property="og:title" content="${route.title}" />
  <meta property="og:description" content="${route.description}" />
  <meta property="og:image" content="${baseUrl}/og-image.svg" />
  <meta property="og:site_name" content="Считай.RU" />
  <meta property="og:locale" content="ru_RU" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${fullUrl}" />
  <meta name="twitter:title" content="${route.title}" />
  <meta name="twitter:description" content="${route.description}" />
  <meta name="twitter:image" content="${baseUrl}/og-image.svg" />
  
  <!-- Favicon -->
  <link rel="icon" href="/favicon.ico" sizes="32x32">
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#3B82F6" />
  
  <!-- Preconnect -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
${cssLink}  
  <!-- SPA Redirect Script -->
  <script type="text/javascript">
    (function(l) {
      if (l.search[1] === '/' ) {
        var decoded = l.search.slice(1).split('&').map(function(s) { 
          return s.replace(/~and~/g, '&')
        }).join('?');
        window.history.replaceState(null, null,
            l.pathname.slice(0, -1) + decoded + l.hash
        );
      }
    }(window.location))
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="${entryPoint}"></script>
  
  <!-- NoScript Content for SEO -->
  <noscript>
    <div style="font-family: system-ui, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px;">
      <h1>${route.title}</h1>
      <p>${route.description}</p>
      <p>Для использования калькулятора необходимо включить JavaScript.</p>
      <p><a href="/" style="color: #3B82F6;">← На главную</a></p>
    </div>
  </noscript>
</body>
</html>`;
}

// Основная функция
function generateStaticFiles() {
  const distPath = path.resolve(process.cwd(), 'dist');
  
  // Проверяем существование dist
  if (!fs.existsSync(distPath)) {
    console.error('❌ Папка dist не найдена. Сначала выполните: npm run build');
    process.exit(1);
  }
  
  console.log('🚀 Генерация статических HTML файлов (.html без редиректов)...\n');
  
  let generatedCount = 0;
  
  routes.forEach(route => {
    const htmlContent = generateHTML(route);
    
    // Создаем .html файл напрямую
    let filePath;
    if (route.file === '.') {
      filePath = path.join(distPath, 'index.html');
    } else {
      filePath = path.join(distPath, `${route.file}.html`);
    }
    
    // Создаем директорию если нужна
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Записываем файл
    fs.writeFileSync(filePath, htmlContent, 'utf8');
    console.log(`✅ ${route.path} → ${path.relative(distPath, filePath)}`);
    generatedCount++;
  });
  
  // Удаляем старые папки с index.html
  routes.forEach(route => {
    if (route.file !== '.') {
      const dirPath = path.join(distPath, route.file);
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`🗑️ Удалена папка: ${path.relative(distPath, dirPath)}`);
      }
    }
  });
  
  console.log(`\n✨ Сгенерировано ${generatedCount} HTML файлов`);
  console.log('📁 Структура: .html файлы (без редиректов!)');
}

// Запуск
console.log('========================================');
console.log('   Генератор статических HTML файлов');
console.log('   (.html без редиректов)');
console.log('========================================\n');

try {
  generateStaticFiles();
} catch (error) {
  console.error('❌ Ошибка:', error.message);
  process.exit(1);
}
