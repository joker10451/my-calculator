#!/usr/bin/env node

/**
 * Скрипт для генерации статических HTML файлов для GitHub Pages
 * Создает папки с index.html (URL со слэшем)
 */

import fs from 'fs';
import path from 'path';

// Конфигурация маршрутов
const routes = [
  { path: '/', folder: '.', title: 'Считай.RU — Бесплатные онлайн калькуляторы для России и СНГ', description: '🧮 Бесплатные калькуляторы 2026: ипотека, кредит, зарплата, ИМТ, ЖКХ, топливо. Точные расчёты за 10 секунд. Работает офлайн, без регистрации.' },
  { path: '/all/', folder: 'all', title: 'Все калькуляторы — Каталог онлайн калькуляторов', description: 'Полный каталог бесплатных онлайн калькуляторов: финансы, здоровье, транспорт, ЖКХ. Найдите нужный калькулятор.' },
  { path: '/about/', folder: 'about', title: 'О проекте Считай.RU — Бесплатные онлайн калькуляторы', description: 'Считай.RU — бесплатный сервис онлайн калькуляторов для России и СНГ. Ипотека, зарплата, налоги, ЖКХ и многое другое.' },
  { path: '/contacts/', folder: 'contacts', title: 'Контакты — Связаться с Считай.RU', description: 'Контактная информация Считай.RU. Email для связи, предложений и вопросов.' },
  { path: '/privacy/', folder: 'privacy', title: 'Политика конфиденциальности — Считай.RU', description: 'Политика обработки персональных данных сервиса Считай.RU. Как мы защищаем вашу информацию.' },
  { path: '/terms/', folder: 'terms', title: 'Условия использования — Считай.RU', description: 'Пользовательское соглашение сервиса Считай.RU. Правила использования бесплатных онлайн калькуляторов.' },
  { path: '/blog/', folder: 'blog', title: 'Блог — Полезные статьи о финансах и расчетах', description: 'Статьи о том, как правильно рассчитывать ипотеку, налоги, пособия. Советы по финансовому планированию от Считай.RU.' },
  { path: '/sitemap/', folder: 'sitemap', title: 'Карта сайта — Все калькуляторы | Считай.RU', description: 'Полный список всех калькуляторов и страниц сайта Считай.RU. Ипотека, кредит, зарплата, налоги, ЖКХ и другие.' },
  { path: '/calculator/mortgage/', folder: 'calculator/mortgage', title: 'Ипотечный калькулятор онлайн — Расчет платежа 2026', description: 'Рассчитайте ипотеку онлайн: ежемесячный платеж, переплату, график платежей. Учитываем ставки 2026 года, первоначальный взнос, срок кредита.' },
  { path: '/calculator/salary/', folder: 'calculator/salary', title: 'Калькулятор зарплаты онлайн — Расчет НДФЛ и на руки', description: 'Рассчитайте зарплату с учетом НДФЛ 13%. Переводим зарплату до вычета налогов в зарплату на руки и наоборот. Актуальные ставки 2026.' },
  { path: '/calculator/credit/', folder: 'calculator/credit', title: 'Кредитный калькулятор онлайн — Расчет платежей', description: 'Калькулятор потребительского кредита: расчет ежемесячного платежа, процентов, переплаты. Аннуитетные и дифференцированные платежи.' },
  { path: '/calculator/bmi/', folder: 'calculator/bmi', title: 'Калькулятор ИМТ онлайн — Индекс массы тела', description: 'Рассчитайте индекс массы тела (ИМТ) бесплатно. Узнайте свою норму веса, ожирение или дефицит массы тела по формуле ВОЗ.' },
  { path: '/calculator/fuel/', folder: 'calculator/fuel', title: 'Калькулятор расхода топлива — Расчет стоимости поездки', description: 'Рассчитайте расход бензина на 100 км и стоимость поездки. Учитываем расход автомобиля, цену топлива, расстояние.' },
  { path: '/calculator/utilities/', folder: 'calculator/utilities', title: 'Калькулятор ЖКХ онлайн — Расчет коммунальных платежей', description: 'Рассчитайте коммунальные услуги: отопление, вода, электричество, газ. Тарифы ЖКХ 2026 по регионам России.' },
  { path: '/calculator/court-fee/', folder: 'calculator/court-fee', title: 'Калькулятор госпошлины в суд 2026 — Расчет онлайн', description: 'Рассчитайте госпошлину для суда общей юрисдикции и арбитражного суда. Тарифы 2026, льготы, калькулятор искового заявления.' },
  { path: '/calculator/deposit/', folder: 'calculator/deposit', title: 'Депозитный калькулятор онлайн — Расчет доходности вклада', description: 'Рассчитайте доходность банковского вклада с капитализацией и без. Проценты, сумма в конце срока, сравнение условий.' },
  { path: '/calculator/currency/', folder: 'calculator/currency', title: 'Конвертер валют онлайн — Курс ЦБ РФ', description: 'Конвертер валют по курсу Центробанка России. Перевод рублей в доллары, евро, юани и обратно. Актуальный курс на сегодня.' },
  { path: '/calculator/refinancing/', folder: 'calculator/refinancing', title: 'Калькулятор рефинансирования — Выгодно ли перекредитоваться', description: 'Рассчитайте выгоду от рефинансирования кредита или ипотеки. Сравните старые и новые условия, экономию на процентах.' },
  { path: '/calculator/alimony/', folder: 'calculator/alimony', title: 'Калькулятор алиментов 2026 — Расчет размера выплат', description: 'Рассчитайте размер алиментов на ребенка в 2026 году. Процент от зарплаты, фиксированная сумма, МРОТ. Онлайн калькулятор.' },
  { path: '/calculator/maternity-capital/', folder: 'calculator/maternity-capital', title: 'Калькулятор материнского капитала 2026', description: 'Рассчитайте размер материнского капитала в 2026 году. Индексация, региональные выплаты, на что потратить.' },
  { path: '/calculator/calories/', folder: 'calculator/calories', title: 'Калькулятор калорий онлайн — Суточная норма', description: 'Рассчитайте суточную норму калорий для похудения, набора массы или поддержания веса. Формулы Миффлина-Сан Жеора и Харриса-Бенедикта.' },
  { path: '/calculator/water/', folder: 'calculator/water', title: 'Калькулятор воды онлайн — Сколько пить воды в день', description: 'Рассчитайте дневную норму воды исходя из веса и активности. Сколько нужно пить воды в день для здоровья.' },
  { path: '/calculator/tire-size/', folder: 'calculator/tire-size', title: 'Калькулятор размера шин — Подбор шин для авто', description: 'Подберите шины для автомобиля по размеру. Калькулятор совместимости шин, сравнение размеров, расчет клиренса.' },
  { path: '/calculator/overpayment/', folder: 'calculator/overpayment', title: 'Калькулятор переплаты по ипотеке — узнайте реальную стоимость кредита', description: 'Рассчитайте реальную переплату по ипотеке. Узнайте сколько подарите банку за весь срок. Сравните ставки банков и найдите способ сэкономить до сотен тысяч рублей.' },
  { path: '/calculator/self-employed/', folder: 'calculator/self-employed', title: 'Калькулятор налогов для самозанятых и ИП 2026', description: 'Рассчитайте налоги для самозанятых, ИП на УСН и патенте. Сравните режимы налогообложения и узнайте чистый доход после уплаты налогов.' },
  { path: '/calculator/osago/', folder: 'calculator/osago', title: 'Калькулятор ОСАГО онлайн — Расчет стоимости полиса 2026', description: 'Рассчитайте стоимость ОСАГО онлайн. Учитываем класс водителя, регион, мощность двигателя, КБМ. Актуальные тарифы 2026.' },
  { path: '/calculator/kasko/', folder: 'calculator/kasko', title: 'Калькулятор КАСКО онлайн — Расчет стоимости полиса', description: 'Рассчитайте стоимость КАСКО для вашего автомобиля. Сравните предложения разных страховых компаний.' },
  { path: '/calculator/investment/', folder: 'calculator/investment', title: 'Калькулятор доходности инвестиций — Расчет прибыли', description: 'Рассчитайте доходность инвестиций с учетом сложного процента, инфляции и налогов. Планируйте финансовую независимость.' },
  { path: '/compare-banks/', folder: 'compare-banks', title: 'Сравнение банков — ставки по ипотеке, вкладам, кредитам 2026', description: 'Сравните ставки и условия банков России в одной таблице. Найдите лучшее предложение по ипотеке, вкладам, кредитам и дебетовым картам.' },
  { path: '/courier-yandex/', folder: 'courier-yandex', title: 'Курьер Яндекс.Еда / Яндекс.Лавка — доход до 8 500 ₽/день', description: 'Станьте курьером Яндекс.Еда или Яндекс.Лавка. Доход до 8 500 ₽ в день, свободное расписание, ежедневные выплаты.' },
  { path: '/joy-money/', folder: 'joy-money', title: 'JoyMoney — займ за 5 минут, первый займ 0% до 30 000 ₽', description: 'Получите займ в JoyMoney за 5 минут. Первый займ под 0% до 30 000 ₽. Без справок, поручителей и визитов в офис.' },
  { path: '/widgets/', folder: 'widgets', title: 'Виджеты калькуляторов для встраивания на сайт', description: 'Встройте наши калькуляторы на свой сайт. Бесплатные виджеты для ипотеки, кредитов, вкладов и других расчётов.' },
  { path: '/quiz/financial-literacy/', folder: 'quiz/financial-literacy', title: 'Тест на финансовую грамотность — проверьте свои знания', description: 'Пройдите бесплатный тест на финансовую грамотность. 10 вопросов по кредитам, инвестициям, налогам и сбережениям.' },
  // Blog posts
  { path: '/blog/ipoteka-2026-novye-usloviya/', folder: 'blog/ipoteka-2026-novye-usloviya', title: 'Ипотека 2026: новые условия и ставки | Считай.RU', description: 'Обзор изменений в ипотечном кредитовании 2026 года. Новые ставки, условия, льготные программы.' },
  { path: '/blog/ndfl-2026-progressivnaya-shkala/', folder: 'blog/ndfl-2026-progressivnaya-shkala', title: 'НДФЛ 2026: прогрессивная шкала | Считай.RU', description: 'Как изменился НДФЛ в 2026 году. Прогрессивная шкала налогообложения, новые ставки, примеры расчёта.' },
  { path: '/blog/tarify-zhkh-2026-kak-ekonomit/', folder: 'blog/tarify-zhkh-2026-kak-ekonomit', title: 'Тарифы ЖКХ 2026: как экономить | Считай.RU', description: 'Актуальные тарифы ЖКХ 2026 года. Советы по экономии на коммунальных платежах.' },
  { path: '/blog/alimenty-2026-razmery-poryadok-vzyskaniya/', folder: 'blog/alimenty-2026-razmery-poryadok-vzyskaniya', title: 'Алименты 2026: размеры и порядок взыскания | Считай.RU', description: 'Размеры алиментов в 2026 году. Порядок взыскания, изменения в законодательстве.' },
  { path: '/blog/osago-2026-stoimost-kak-oformit/', folder: 'blog/osago-2026-stoimost-kak-oformit', title: 'ОСАГО 2026: стоимость и оформление | Считай.RU', description: 'Как оформить ОСАГО в 2026 году. Стоимость полиса, изменения в тарифах.' },
  { path: '/blog/kasko-2026-chto-pokryvaet-stoit-li-oformlyat/', folder: 'blog/kasko-2026-chto-pokryvaet-stoit-li-oformlyat', title: 'КАСКО 2026: что покрывает и стоит ли оформлять | Считай.RU', description: 'Обзор КАСКО 2026. Что покрывает полис, стоимость, стоит ли оформлять.' },
  { path: '/blog/otpusknye-2026-raschet-sroki-vyplaty/', folder: 'blog/otpusknye-2026-raschet-sroki-vyplaty', title: 'Отпускные 2026: расчёт, сроки, выплаты | Считай.RU', description: 'Как рассчитать отпускные в 2026 году. Сроки выплат, формулы, примеры расчёта.' },
  { path: '/blog/bolnichnyj-2026-raschet-oformlenie/', folder: 'blog/bolnichnyj-2026-raschet-oformlenie', title: 'Больничный 2026: расчёт и оформление | Считай.RU', description: 'Как рассчитать больничный в 2026 году. Порядок оформления, сроки выплат.' },
  { path: '/blog/imt-2026-norma-kak-rasschitat/', folder: 'blog/imt-2026-norma-kak-rasschitat', title: 'ИМТ 2026: норма и как рассчитать | Считай.RU', description: 'Индекс массы тела 2026. Нормы ВОЗ, формула расчёта, интерпретация результатов.' },
  { path: '/blog/vklady-2026-luchshie-predlozheniya/', folder: 'blog/vklady-2026-luchshie-predlozheniya', title: 'Банковские вклады 2026: лучшие предложения | Считай.RU', description: 'Лучшие банковские вклады 2026 года. Сравнение ставок, условий, надёжность банков.' },
  { path: '/blog/investicii-2026-kuda-vlozhit-dengi/', folder: 'blog/investicii-2026-kuda-vlozhit-dengi', title: 'Инвестиции 2026: куда вложить деньги | Считай.RU', description: 'Куда инвестировать в 2026 году. Обзор инструментов, стратегии, риски.' },
  { path: '/blog/gosposhliny-2026-razmery-kak-rasschitat/', folder: 'blog/gosposhliny-2026-razmery-kak-rasschitat', title: 'Госпошлины 2026: размеры и расчёт | Считай.RU', description: 'Размеры госпошлин 2026 года. Как рассчитать, льготы, порядок оплаты.' },
  { path: '/blog/kreditnye-karty-2026-luchshie-predlozheniya/', folder: 'blog/kreditnye-karty-2026-luchshie-predlozheniya', title: 'Кредитные карты 2026: лучшие предложения | Считай.RU', description: 'Лучшие кредитные карты 2026 года. Сравнение условий, льготных периодов, кэшбэка.' },
  { path: '/blog/materinskij-kapital-2026-razmer-kak-poluchit/', folder: 'blog/materinskij-kapital-2026-razmer-kak-poluchit', title: 'Материнский капитал 2026: размер и как получить | Считай.RU', description: 'Материнский капитал 2026. Размер выплат, порядок получения, на что потратить.' },
  { path: '/blog/refinansirovanie-kreditov-2026-kak-snizit-stavku/', folder: 'blog/refinansirovanie-kreditov-2026-kak-snizit-stavku', title: 'Рефинансирование кредитов 2026: как снизить ставку | Считай.RU', description: 'Рефинансирование кредитов в 2026 году. Как снизить ставку, условия банков, выгода.' },
  { path: '/blog/raschet-kalorij-2026-norma-dlya-pokhudeniya/', folder: 'blog/raschet-kalorij-2026-norma-dlya-pokhudeniya', title: 'Расчёт калорий 2026: норма для похудения | Считай.RU', description: 'Как рассчитать суточную норму калорий в 2026 году. Формулы, примеры, советы.' },
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
  <meta name="keywords" content="калькулятор онлайн, расчет ипотеки, калькулятор зарплаты, НДФЛ, ЖКХ, алименты, бесплатно, 2026" />
  <meta name="author" content="Считай.RU" />
  <meta name="robots" content="index, follow" />
  
  <!-- Canonical URL (со слэшем для GitHub Pages) -->
  <link rel="canonical" href="${canonicalUrl}" />
  
  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${fullUrl}" />
  <meta property="og:title" content="${route.title}" />
  <meta property="og:description" content="${route.description}" />
  <meta property="og:image" content="${baseUrl}/og-image.png" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Считай.RU" />
  <meta property="og:locale" content="ru_RU" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${fullUrl}" />
  <meta name="twitter:title" content="${route.title}" />
  <meta name="twitter:description" content="${route.description}" />
  <meta name="twitter:image" content="${baseUrl}/og-image.png" />
  
  <!-- Favicon & PWA -->
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.json">
  
  <!-- Apple Touch Icon Settings -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="Считай.RU">
  
  <!-- Safari Pin Tab -->
  <link rel="mask-icon" href="/icon.svg" color="#3B82F6">
  
  <!-- Theme Color -->
  <meta name="theme-color" content="#3B82F6" />
  
  <!-- Additional PNG Icons for Desktop -->
  <link rel="icon" type="image/png" sizes="32x32" href="/icon-192.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico">
  
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
  
  <!-- Rich SEO Content for Search Engines -->
  <noscript>
    <div style="font-family: system-ui, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px;">
      <h1>${route.title}</h1>
      <p>${route.description}</p>
      <nav>
        <h2>Популярные калькуляторы</h2>
        <ul>
          <li><a href="/calculator/mortgage/">Ипотечный калькулятор — расчет платежа 2026</a></li>
          <li><a href="/calculator/salary/">Калькулятор зарплаты — НДФЛ, на руки</a></li>
          <li><a href="/calculator/credit/">Кредитный калькулятор — аннуитет и дифференцированный</a></li>
          <li><a href="/calculator/bmi/">Калькулятор ИМТ — индекс массы тела</a></li>
          <li><a href="/calculator/utilities/">Калькулятор ЖКХ — коммунальные платежи 2026</a></li>
          <li><a href="/calculator/alimony/">Калькулятор алиментов 2026</a></li>
          <li><a href="/calculator/court-fee/">Калькулятор госпошлины в суд</a></li>
          <li><a href="/calculator/fuel/">Калькулятор расхода топлива</a></li>
          <li><a href="/calculator/deposit/">Калькулятор вкладов — доходность депозита</a></li>
          <li><a href="/calculator/maternity-capital/">Калькулятор материнского капитала 2026</a></li>
          <li><a href="/calculator/osago/">Калькулятор ОСАГО онлайн</a></li>
          <li><a href="/calculator/calories/">Калькулятор калорий — суточная норма</a></li>
        </ul>
        <h2>Разделы</h2>
        <ul>
          <li><a href="/blog/">Блог — финансовые статьи 2026</a></li>
          <li><a href="/all/">Все калькуляторы</a></li>
          <li><a href="/about/">О проекте</a></li>
        </ul>
      </nav>
      <p>© 2026 Считай.RU — Бесплатные онлайн калькуляторы для России и СНГ. Все расчёты без регистрации.</p>
    </div>
  </noscript>
  
  <!-- Schema.org Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Считай.RU",
    "alternateName": "Schitay Online",
    "url": "https://schitay-online.ru",
    "description": "Бесплатные онлайн калькуляторы для России и СНГ: ипотека, кредит, зарплата, ЖКХ, налоги",
    "inLanguage": "ru",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://schitay-online.ru/all?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }
  </script>
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
  
  console.log('🚀 Генерация статических HTML файлов (со слэшем)...\n');
  
  let generatedCount = 0;
  
  routes.forEach(route => {
    const htmlContent = generateHTML(route);
    
    // Создаем папку с index.html
    let dirPath;
    if (route.folder === '.') {
      dirPath = distPath;
    } else {
      dirPath = path.join(distPath, route.folder);
    }
    
    // Создаем директорию
    fs.mkdirSync(dirPath, { recursive: true });
    
    // Путь к index.html
    const filePath = path.join(dirPath, 'index.html');
    
    // Записываем файл
    fs.writeFileSync(filePath, htmlContent, 'utf8');
    console.log(`✅ ${route.path} → ${path.relative(distPath, filePath)}`);
    generatedCount++;
  });
  
  // Удаляем старые .html файлы
  routes.forEach(route => {
    if (route.folder !== '.') {
      const htmlFile = path.join(distPath, `${route.folder}.html`);
      if (fs.existsSync(htmlFile)) {
        fs.unlinkSync(htmlFile);
        console.log(`🗑️ Удалён .html: ${path.relative(distPath, htmlFile)}`);
      }
    }
  });
  
  console.log(`\n✨ Сгенерировано ${generatedCount} HTML файлов`);
  console.log('📁 Структура: папка/index.html (URL со слэшем)');
}

// Запуск
console.log('========================================');
console.log('   Генератор статических HTML файлов');
console.log('   (папки с index.html - URL со слэшем)');
console.log('========================================\n');

try {
  generateStaticFiles();
} catch (error) {
  console.error('❌ Ошибка:', error.message);
  process.exit(1);
}
