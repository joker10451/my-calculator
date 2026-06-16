# Как я сделал финансовый калькулятор с 92/100 Accessibility и 55 Performance на Mobile

## Зачем это нужно

Каждый день люди считают ипотеку, кредиты, НДФЛ и ЖКХ. Большинство калькуляторов в интернете — либо устаревшие, либо с рекламой, либо с ошибками в формулах. Я решил сделать свой: бесплатный, точный, без регистрации.

Результат — **Считай.RU**: 20+ калькуляторов, 31 статья в блоге, 127 URL в sitemap. Всё на React + GitHub Pages.

## Стек технологий

```
React 18 + TypeScript + Vite
├── Tailwind CSS (дизайн-система)
├── Framer Motion (анимации, позже заменил на CSS)
├── React Router (клиентская навигация)
├── Zod (валидация)
├── Vitest + fast-check (тесты)
├── Puppeteer (пререндеринг)
└── GitHub Actions → GitHub Pages
```

## Главная проблема: SPA не видят поисковики

Когда я запустил сайт, Google и Яндекс видели только `<div id="root"></div>`. Весь контент рендерился на клиенте — поисковики не могли проиндексировать калькуляторы.

### Решение: пререндеринг через Puppeteer

Создал скрипт `scripts/prerender.mjs`:
- Запускает headless Chrome
- Блокирует внешние запросы (CBR API, шрифты) для ускорения
- Рендерит 53 маршрута за ~3 минуты
- Генерирует статические HTML с реальным контентом

```javascript
// Упрощённый пример
const page = await browser.newPage();
await page.setRequestInterception(true);
page.on('request', req => {
  if (req.url().startsWith('http://127.0.0.1')) req.continue();
  else req.abort(); // Блокируем внешние запросы
});
await page.goto(url, { waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 3000)); // Гидратация React
const html = await page.content();
```

**До:** index.html = 15KB (пустой `<div id="root">`)
**После:** index.html = 104KB, mortgage = 177KB (полный контент)

## Оптимизация CWV (Core Web Vitals)

### 1. Google Fonts — убрал блокировку FCP

```html
<!-- Было -->
<link href="fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">

<!-- Стало -->
<link rel="preload" href="fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeAmM.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" media="print" onload="this.media='all'">
```

### 2. Удалил @tanstack/react-query (150KB)

Он нигде не вызывался — просто висел в bundle.

### 3. Заменил framer-motion на CSS

В 5 компонентах заменил `AnimatePresence` + `motion.div` на CSS `@keyframes`. CLS: 0.004 ✅

### 4. Lazy-load тяжёлых компонентов

```typescript
const Footer = lazy(() => import('@/components/Footer'));
const CurrencyRatesWidget = lazy(() => import('@/components/CurrencyRatesWidget'));
```

## E-E-A-T: доверие поисковиков

Для финансового сайта критично:

1. **Дисклеймер** на каждом калькуляторе:
   > «Расчёт носит информационный характер. Актуальные ставки уточняйте в НК РФ, ЦБ РФ, СФР.»

2. **Честный /about**: убрал фейковую «команду экспертов» — проект соло-разработчика.

3. **Ссылки на законы**: НК РФ, ЦБ РФ, СФР в Footer и на калькуляторах.

4. **Schema.org**: `WebApplication` на калькуляторах, `BlogPosting` на статьях, `FAQPage` на страницах с вопросами.

## Результаты

| Метрика | Было | Стало |
|---------|------|-------|
| Accessibility (PSI) | 85 | **92** |
| Best Practices | 96 | **96** |
| SEO | 100 | **100** |
| CLS | 0.08 | **0.004** |
| Тесты | — | **2355 ✅** |
| Маршрутов пререндерено | 0 | **53** |

## Что дальше

- Форумы: отвечаю на Банки.ру / ДомКлик с полезными расчётами
- Блог: 31 статья с уникальными формулами и примерами
- Оптимизация Performance mobile: цель — 80+

## Вывод

SPA + GitHub Pages — рабочая связка для SEO-оптимизированного сайта. Ключевые шаги:
1. Пререндеринг через Puppeteer (3 минуты на 53 маршрута)
2. Preload шрифтов + CSS-анимации вместо JS
3. E-E-A-T: дисклеймеры, ссылки на законы, честный /about
4. Schema.org: WebApplication + FAQPage + BlogPosting

Ссылка: [schitay-online.ru](https://schitay-online.ru)
GitHub: [github.com/joker10451/my-calculator](https://github.com/joker10451/my-calculator)
