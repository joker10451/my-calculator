# Руководство по цветовой системе блога

## Обзор

Цветовая система блога Считай.RU предоставляет полную палитру цветов, градиентов и утилит для создания современного, привлекательного интерфейса.

## Структура

### 1. Primary Colors (Основные цвета)

Основная палитра с 10 оттенками (50-900):

```tsx
// В TypeScript/React
import { colors } from '@/lib/design-system';
const primaryColor = colors.primary[500]; // #667eea

// В Tailwind CSS
<div className="bg-primary-500 text-primary-50">
```

### 2. Category Colors (Цвета категорий)

8 ярких цветов для категорий блога:

- **Finance** (Финансы): `#10b981` - Emerald
- **Taxes** (Налоги): `#f59e0b` - Amber
- **Mortgage** (Ипотека): `#3b82f6` - Blue
- **Utilities** (ЖКХ): `#8b5cf6` - Purple
- **Salary** (Зарплата): `#ec4899` - Pink
- **Insurance** (Страхование): `#06b6d4` - Cyan
- **Investment** (Инвестиции): `#14b8a6` - Teal
- **Savings** (Накопления): `#84cc16` - Lime

Каждый цвет имеет 3 варианта: base, light, dark

```tsx
// В TypeScript/React
import { colors } from '@/lib/design-system';
const financeColor = colors.categories.finance.base;

// В Tailwind CSS
<div className="bg-categories-finance text-white">
<div className="bg-categories-finance-light">
<div className="bg-categories-finance-dark">
```

### 3. Accent Colors (Акцентные цвета)

4 акцентных цвета для UI элементов:

- **Success**: `#22c55e` - Green
- **Warning**: `#f59e0b` - Amber
- **Error**: `#ef4444` - Red
- **Info**: `#3b82f6` - Blue

```tsx
// В Tailwind CSS
<div className="bg-accent-success">
<div className="bg-accent-warning">
<div className="bg-accent-error">
<div className="bg-accent-info">
```

### 4. Neutral Palette (Нейтральная палитра)

10 оттенков серого (50-900):

```tsx
// В Tailwind CSS
<div className="bg-neutral-50">   // Самый светлый
<div className="bg-neutral-500">  // Средний
<div className="bg-neutral-900">  // Самый темный
```

## Градиенты

### Hero Gradients (Градиенты для героя)

```tsx
// Light mode
<div className="bg-hero-light">
  
// Dark mode
<div className="bg-hero-dark">

// CSS переменная
<div className="bg-hero-gradient">
```

### Card Gradients (Градиенты для карточек)

```tsx
// Light mode
<div className="bg-card-light">
  
// Dark mode
<div className="bg-card-dark">

// CSS переменная
<div className="bg-card-gradient">
```

### Category Gradients (Градиенты категорий)

```tsx
<div className="bg-gradient-finance">
<div className="bg-gradient-taxes">
<div className="bg-gradient-mortgage">
<div className="bg-gradient-utilities">
<div className="bg-gradient-salary">
<div className="bg-gradient-insurance">
<div className="bg-gradient-investment">
<div className="bg-gradient-savings">
```

### Accent Gradients (Акцентные градиенты)

```tsx
<div className="bg-gradient-success">
<div className="bg-gradient-warning">
<div className="bg-gradient-error">
<div className="bg-gradient-info">
```

### Primary Gradient (Основной градиент)

```tsx
<div className="bg-gradient-primary">
```

## Text Gradients (Градиентный текст)

```tsx
<h1 className="text-gradient-primary">
  Заголовок с градиентом
</h1>

<h2 className="text-gradient-finance">
  Финансовый заголовок
</h2>

<h3 className="text-gradient-success">
  Успешный заголовок
</h3>
```

## CSS Variables (CSS переменные)

Все градиенты доступны как CSS переменные:

```css
/* Primary */
var(--primary-gradient)

/* Categories */
var(--gradient-finance)
var(--gradient-taxes)
var(--gradient-mortgage)
var(--gradient-utilities)
var(--gradient-salary)
var(--gradient-insurance)
var(--gradient-investment)
var(--gradient-savings)

/* Accents */
var(--gradient-success)
var(--gradient-warning)
var(--gradient-error)
var(--gradient-info)

/* Backgrounds */
var(--bg-hero)
var(--bg-card)
var(--bg-section)
var(--bg-overlay)
```

## Примеры использования

### Карточка с градиентом категории

```tsx
<div className="bg-gradient-mortgage p-8 rounded-2xl shadow-lg text-white">
  <h3 className="text-2xl font-bold mb-4">Ипотечный калькулятор</h3>
  <p className="text-white/90">
    Рассчитайте ежемесячный платеж по ипотеке
  </p>
</div>
```

### Заголовок с градиентным текстом

```tsx
<h1 className="text-5xl font-bold text-gradient-primary">
  Лучшие финансовые калькуляторы
</h1>
```

### Hero секция с градиентным фоном

```tsx
<section className="bg-hero-gradient min-h-screen flex items-center justify-center">
  <div className="text-center text-white">
    <h1 className="text-6xl font-bold mb-4">
      Добро пожаловать
    </h1>
    <p className="text-xl">
      Ваш финансовый помощник
    </p>
  </div>
</section>
```

### Бейдж категории

```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-finance text-white text-sm font-semibold">
  Финансы
</span>
```

## Dark Mode Support

Все градиенты автоматически адаптируются к темной теме через CSS переменные:

```tsx
// Автоматически меняется в зависимости от темы
<div className="bg-hero-gradient">
<div className="bg-card-gradient">
<div className="bg-section-gradient">
```

## Демо-страница

Посмотреть все цвета и градиенты в действии:

```
http://localhost:5173/#/demo/color-system
```

## Требования

Цветовая система соответствует следующим требованиям:

- ✅ **Requirement 3.1**: Primary color with multiple shades (50-900)
- ✅ **Requirement 3.2**: Accent colors for categories and highlights
- ✅ **Requirement 3.3**: Neutral grays for backgrounds and borders
- ✅ **Requirement 3.5**: Distinct colors for each category
- ✅ **Requirement 3.6**: Gradient backgrounds for hero sections
- ✅ **Requirement 3.7**: WCAG AA color contrast compliance (проверяется отдельно)

## Accessibility (Доступность)

Все цветовые комбинации должны соответствовать WCAG AA стандартам:

- Текст на фоне: минимум 4.5:1 контраст
- Крупный текст: минимум 3:1 контраст
- Интерактивные элементы: минимум 3:1 контраст

Используйте инструменты проверки контраста:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Contrast Ratio](https://contrast-ratio.com/)

## Поддержка браузеров

Градиенты поддерживаются во всех современных браузерах:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Для старых браузеров предусмотрены fallback цвета через CSS переменные.
