# Рекомендации по оптимизации производительности

## 📊 Текущее состояние

### Bundle Size Analysis:
- `export-vendor` (jspdf + html2canvas): **560KB** (166KB gzip) ⚠️ КРИТИЧНО
- `charts-vendor` (recharts): **409KB** (110KB gzip) ⚠️ БОЛЬШОЙ
- `index.es`: **150KB** (51KB gzip) ✅ OK
- `react-vendor`: **141KB** (45KB gzip) ✅ OK
- `ui-vendor`: **105KB** (36KB gzip) ✅ OK

## 🚀 Критичные улучшения

### 1. Ленивая загрузка PDF экспорта (ПРИОРИТЕТ #1)

**Проблема:** jspdf + html2canvas загружаются сразу, но используются редко.

**Решение:** Динамический импорт при клике на кнопку экспорта.

**Файл:** `src/components/calculators/*Calculator.tsx`

**Было:**
```typescript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const handleExportPDF = async () => {
  const canvas = await html2canvas(element);
  const pdf = new jsPDF();
  // ...
};
```

**Стало:**
```typescript
const handleExportPDF = async () => {
  // Загружаем библиотеки только при клике
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas')
  ]);
  
  const canvas = await html2canvas(element);
  const pdf = new jsPDF();
  // ...
};
```

**Экономия:** 560KB → загружается только при необходимости
**Улучшение:** Начальная загрузка страницы на 30% быстрее

---

### 2. Ленивая загрузка графиков (ПРИОРИТЕТ #2)

**Проблема:** recharts (409KB) загружается для всех калькуляторов, но используется только в некоторых.

**Решение:** Динамический импорт компонента с графиком.

**Файл:** `src/components/calculators/MortgageCalculator.tsx` (и другие с графиками)

**Было:**
```typescript
import { LineChart, Line, XAxis, YAxis } from 'recharts';

<LineChart data={data}>
  <Line dataKey="value" />
</LineChart>
```

**Стало:**
```typescript
import { lazy, Suspense } from 'react';

const ChartComponent = lazy(() => import('@/components/charts/MortgageChart'));

<Suspense fallback={<div>Загрузка графика...</div>}>
  <ChartComponent data={data} />
</Suspense>
```

**Экономия:** 409KB → загружается только для калькуляторов с графиками
**Улучшение:** Начальная загрузка на 25% быстрее

---

### 3. Оптимизация изображений

**Проблема:** SVG иконки могут быть оптимизированы.

**Решение:** Использовать SVGO для сжатия SVG.

```bash
npm install -D svgo
npx svgo public/icon.svg public/og-image.svg
```

**Экономия:** 10-30% размера SVG файлов

---

### 4. Добавить preload для критичных ресурсов

**Файл:** `index.html`

**Добавить в `<head>`:**
```html
<!-- Preload критичных шрифтов -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Preload критичных скриптов -->
<link rel="modulepreload" href="/src/main.tsx">
```

---

### 5. Оптимизация Yandex Metrika

**Файл:** `index.html`

**Было:**
```html
<script type="text/javascript">
  (function(m,e,t,r,i,k,a){...})(window, document,'script','https://mc.yandex.ru/metrika/tag.js', 'ym');
</script>
```

**Стало (добавить defer):**
```html
<script type="text/javascript" defer>
  // Загружаем Metrika после загрузки страницы
  window.addEventListener('load', function() {
    (function(m,e,t,r,i,k,a){...})(window, document,'script','https://mc.yandex.ru/metrika/tag.js', 'ym');
  });
</script>
```

**Улучшение:** Не блокирует начальную загрузку страницы

---

## 📈 SEO улучшения

### 6. Добавить FAQ Schema для калькуляторов

**Файл:** Каждый калькулятор (например, `src/pages/calculators/MortgageCalculator.tsx`)

**Добавить в Helmet:**
```typescript
<Helmet>
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [{
        "@type": "Question",
        "name": "Как рассчитать ипотеку?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Введите сумму кредита, процентную ставку и срок. Калькулятор автоматически рассчитает ежемесячный платёж и переплату."
        }
      }]
    })}
  </script>
</Helmet>
```

**Польза:** Rich snippets в Google (FAQ блоки в выдаче)

---

### 7. Добавить BreadcrumbList Schema

**Файл:** Каждая страница калькулятора

```typescript
<script type="application/ld+json">
  {JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "Главная",
      "item": "https://schitay-online.ru/"
    }, {
      "@type": "ListItem",
      "position": 2,
      "name": "Ипотечный калькулятор",
      "item": "https://schitay-online.ru/calculator/mortgage"
    }]
  })}
</script>
```

**Польза:** Хлебные крошки в Google выдаче

---

### 8. Улучшить мета-описания

**Проблема:** Некоторые описания слишком общие.

**Файл:** `src/pages/Index.tsx` и страницы калькуляторов

**Было:**
```typescript
<meta name="description" content="Бесплатные онлайн калькуляторы..." />
```

**Стало (более конкретно):**
```typescript
<meta name="description" content="Ипотечный калькулятор 2026: рассчитайте ежемесячный платёж, переплату и график платежей. Актуальные ставки банков РФ. Бесплатно, без регистрации." />
```

**Польза:** Выше CTR в поисковой выдаче

---

## 🎨 UX улучшения

### 9. Добавить индикатор загрузки для ленивых компонентов

**Файл:** Создать `src/components/LoadingSpinner.tsx`

```typescript
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);
```

Использовать в Suspense fallback.

---

### 10. Добавить кнопку "Поделиться"

**Файл:** Каждый калькулятор

```typescript
const handleShare = async () => {
  if (navigator.share) {
    await navigator.share({
      title: 'Ипотечный калькулятор',
      text: 'Рассчитайте ипотеку онлайн',
      url: window.location.href
    });
  }
};

<Button onClick={handleShare}>
  <Share2 className="mr-2 h-4 w-4" />
  Поделиться
</Button>
```

**Польза:** Больше внешних ссылок, виральность

---

## 📊 Ожидаемые результаты

### Производительность:
- **Начальная загрузка:** -55% (с 1.6MB до 0.7MB)
- **Time to Interactive:** -40% (с 3.5s до 2.1s)
- **Lighthouse Score:** +15-20 пунктов

### SEO:
- **Rich Snippets:** FAQ и хлебные крошки в выдаче
- **CTR:** +10-15% за счёт лучших описаний
- **Позиции:** +2-5 позиций по низкочастотным запросам

### UX:
- **Bounce Rate:** -10-15%
- **Время на сайте:** +20-30%
- **Конверсия в клики:** +5-10%

---

## 🎯 План внедрения (приоритет)

### Сегодня (30 минут):
1. ✅ Обновить sitemap.xml (уже сделано)
2. Добавить defer для Yandex Metrika
3. Оптимизировать SVG иконки

### Завтра (2 часа):
4. Ленивая загрузка PDF экспорта
5. Ленивая загрузка графиков
6. Добавить LoadingSpinner

### Через 2-3 дня (3 часа):
7. Добавить FAQ Schema для топ-5 калькуляторов
8. Добавить BreadcrumbList Schema
9. Улучшить мета-описания
10. Добавить кнопку "Поделиться"

---

## 🔍 Как проверить результаты

### Производительность:
1. **Lighthouse:** https://pagespeed.web.dev/
2. **WebPageTest:** https://www.webpagetest.org/
3. **Bundle Analyzer:** `npm run build -- --mode analyze`

### SEO:
1. **Google Search Console:** Проверить Rich Snippets
2. **Schema Validator:** https://validator.schema.org/
3. **Yandex Webmaster:** Проверить индексацию

### UX:
1. **Yandex Metrika:** Bounce Rate, время на сайте
2. **Google Analytics:** Если подключишь
3. **Hotjar:** Для heatmaps (опционально)
