# Design Document: Blog Typography Redesign

## Overview

Комплексное улучшение типографики блога с фокусом на читаемость, визуальную иерархию и современный дизайн. Решение включает новую типографическую систему, улучшенные отступы, адаптивные размеры и привлекательные визуальные эффекты.

## Architecture

### Типографическая система
```
Typography System
├── Font Stack (Inter + системные fallback)
├── Size Scale (14px → 16px → 20px → 24px → 32px → 40px)
├── Weight Scale (400 → 500 → 600 → 700 → 800)
├── Line Height Scale (1.2 → 1.4 → 1.6 → 1.8)
└── Color Palette (5 уровней контрастности)
```

### Компонентная архитектура
```
Blog Components
├── EnhancedBlogCard (улучшенная типографика)
├── BlogPage (новая типографическая сетка)
├── Typography Components
│   ├── Heading (H1-H6 с правильными размерами)
│   ├── Body Text (оптимизированный для чтения)
│   ├── Caption (метаданные и подписи)
│   └── Label (теги и категории)
└── Responsive Breakpoints (мобильная адаптация)
```

## Components and Interfaces

### 1. Typography Scale System

#### Размеры шрифтов (Desktop / Mobile)
```typescript
const typographyScale = {
  // Заголовки
  'heading-xl': { desktop: '40px', mobile: '32px' },    // Hero заголовки
  'heading-lg': { desktop: '32px', mobile: '28px' },    // Основные заголовки
  'heading-md': { desktop: '24px', mobile: '22px' },    // Подзаголовки
  'heading-sm': { desktop: '20px', mobile: '18px' },    // Мелкие заголовки
  
  // Основной текст
  'body-lg': { desktop: '18px', mobile: '16px' },       // Описания статей
  'body-md': { desktop: '16px', mobile: '16px' },       // Основной текст
  'body-sm': { desktop: '14px', mobile: '14px' },       // Метаданные
  
  // Специальные элементы
  'label': { desktop: '12px', mobile: '12px' },         // Лейблы и теги
}
```

#### Межстрочные интервалы
```typescript
const lineHeights = {
  'tight': 1.2,     // Заголовки
  'normal': 1.4,    // Подзаголовки
  'relaxed': 1.6,   // Основной текст
  'loose': 1.8,     // Длинные тексты
}
```

### 2. Font Stack Configuration

#### Основной шрифт: Inter
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.font-primary {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
               'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
}
```

#### Fallback система
```css
.font-fallback {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
               'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
}
```

### 3. Enhanced Blog Card Typography

#### Структура карточки
```typescript
interface EnhancedBlogCardTypography {
  title: {
    fontSize: 'heading-lg' | 'heading-md',
    fontWeight: 700,
    lineHeight: 'tight',
    color: 'text-primary',
    marginBottom: '12px'
  },
  excerpt: {
    fontSize: 'body-lg',
    fontWeight: 400,
    lineHeight: 'relaxed',
    color: 'text-secondary',
    marginBottom: '16px'
  },
  metadata: {
    fontSize: 'body-sm',
    fontWeight: 500,
    lineHeight: 'normal',
    color: 'text-muted',
    gap: '12px'
  }
}
```

#### Адаптивные размеры
```css
/* Мобильные устройства */
@media (max-width: 768px) {
  .blog-card-title {
    font-size: 22px;
    line-height: 1.3;
    margin-bottom: 8px;
  }
  
  .blog-card-excerpt {
    font-size: 16px;
    line-height: 1.7;
    margin-bottom: 12px;
  }
}

/* Планшеты */
@media (min-width: 769px) and (max-width: 1024px) {
  .blog-card-title {
    font-size: 28px;
    line-height: 1.2;
  }
}

/* Десктоп */
@media (min-width: 1025px) {
  .blog-card-title {
    font-size: 32px;
    line-height: 1.2;
  }
}
```

### 4. Color System for Typography

#### Цветовая палитра
```typescript
const typographyColors = {
  // Основные цвета текста
  'text-primary': '#1a1a1a',      // Заголовки
  'text-secondary': '#4a4a4a',    // Основной текст
  'text-muted': '#6a6a6a',        // Метаданные
  'text-accent': '#3b82f6',       // Ссылки и акценты
  
  // Темная тема
  'dark-text-primary': '#ffffff',
  'dark-text-secondary': '#e5e5e5',
  'dark-text-muted': '#a3a3a3',
  'dark-text-accent': '#60a5fa',
}
```

#### Контрастность
```typescript
const contrastRatios = {
  'text-primary': 15.8,    // Отличная контрастность
  'text-secondary': 9.2,   // Хорошая контрастность
  'text-muted': 4.6,       // Минимальная WCAG AA
  'text-accent': 4.8,      // Соответствует стандартам
}
```

### 5. Spacing System

#### Отступы для типографики
```typescript
const typographySpacing = {
  // Внутренние отступы карточек
  'card-padding': {
    mobile: '20px',
    tablet: '24px',
    desktop: '32px'
  },
  
  // Отступы между элементами
  'element-spacing': {
    'title-to-excerpt': '12px',
    'excerpt-to-meta': '16px',
    'meta-items': '8px',
    'cards-gap': { mobile: '24px', desktop: '32px' }
  },
  
  // Отступы для чтения
  'reading-spacing': {
    'line-height': 1.6,
    'paragraph-spacing': '16px',
    'section-spacing': '32px'
  }
}
```

## Data Models

### Typography Configuration
```typescript
interface TypographyConfig {
  fontFamily: string;
  fontSize: {
    mobile: string;
    tablet?: string;
    desktop: string;
  };
  fontWeight: 400 | 500 | 600 | 700 | 800;
  lineHeight: number;
  color: string;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

interface ResponsiveTypography {
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  scales: {
    [key: string]: TypographyConfig;
  };
}
```

### Blog Card Typography Props
```typescript
interface BlogCardTypographyProps {
  variant: 'default' | 'featured' | 'hero';
  titleLevel: 'h1' | 'h2' | 'h3';
  showExcerpt: boolean;
  truncateLines: number;
  animateOnHover: boolean;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Typography Scale Consistency
*For any* blog card component, all text elements should use sizes from the defined typography scale and maintain consistent proportions across different screen sizes.
**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Contrast Compliance
*For any* text element in the blog, the contrast ratio with its background should be at least 4.5:1 to meet WCAG AA standards.
**Validates: Requirements 1.4, 8.5**

### Property 3: Responsive Typography Scaling
*For any* screen size, typography should scale appropriately with mobile sizes being 10-20% smaller than desktop sizes while maintaining readability.
**Validates: Requirements 6.1, 6.2, 6.4**

### Property 4: Font Loading Performance
*For any* page load, system fonts should display immediately while web fonts load with font-display: swap to prevent layout shift.
**Validates: Requirements 10.1, 10.2, 10.3**

### Property 5: Visual Hierarchy Consistency
*For any* blog card, the visual hierarchy should follow the pattern: title (largest) > excerpt (medium) > metadata (smallest) with consistent spacing.
**Validates: Requirements 3.1, 3.2, 3.4**

### Property 6: Touch Target Accessibility
*For any* interactive text element on mobile, the minimum touch target size should be 44x44px to ensure accessibility.
**Validates: Requirements 5.5, 6.3**

### Property 7: Animation Performance
*For any* typography animation, transitions should complete within 200-300ms and respect prefers-reduced-motion settings.
**Validates: Requirements 7.1, 7.2, 7.4**

### Property 8: Line Length Optimization
*For any* text block, the line length should be optimized for readability (45-75 characters) across different screen sizes.
**Validates: Requirements 2.5**

## Error Handling

### Font Loading Failures
- Graceful fallback to system fonts
- No layout shift during font swapping
- Timeout handling for slow connections

### Responsive Breakpoint Issues
- Smooth transitions between breakpoints
- No text overflow or clipping
- Consistent spacing at all sizes

### Accessibility Failures
- High contrast mode support
- Screen reader compatibility
- Keyboard navigation support

## Testing Strategy

### Unit Tests
- Typography scale calculations
- Color contrast validation
- Responsive breakpoint behavior
- Font loading states

### Property-Based Tests
- Typography consistency across components
- Contrast ratio compliance
- Responsive scaling behavior
- Animation performance
- Touch target accessibility

### Visual Regression Tests
- Typography rendering across browsers
- Font loading behavior
- Responsive layout consistency
- Dark mode typography

### Performance Tests
- Font loading metrics
- Layout shift measurements
- Animation frame rates
- Memory usage optimization

Each property test should run minimum 100 iterations and be tagged with:
**Feature: blog-typography-redesign, Property {number}: {property_text}**