# Руководство по использованию официальных баннеров ПСБ

## Обзор

В конфигурации карты ПСБ (`src/config/psbCard.ts`) доступны официальные баннеры от партнерской программы банка ПСБ. Эти баннеры оптимизированы для разных устройств и вариантов отображения.

## Доступные баннеры

### 1. Compact (370x200)
**Путь:** `/blog/Creative/_370x200.gif`
**Использование:** Компактный вариант карточки, списки продуктов, боковые панели
**Размер:** 370x200 пикселей
**Формат:** Анимированный GIF

### 2. Full (600x600)
**Путь:** `/blog/Creative/_600x600.gif`
**Использование:** Полный вариант карточки, основной контент
**Размер:** 600x600 пикселей (квадратный)
**Формат:** Анимированный GIF

### 3. Mobile (370x200)
**Путь:** `/blog/Creative/_370x200.gif`
**Использование:** Мобильные устройства (< 768px)
**Размер:** 370x200 пикселей
**Формат:** Анимированный GIF

### 4. Desktop (800x525)
**Путь:** `/blog/Creative/_800x525.gif`
**Использование:** Десктопные устройства (> 1024px)
**Размер:** 800x525 пикселей (широкий)
**Формат:** Анимированный GIF

## Использование в компонентах

### Базовый пример

```typescript
import { PSB_CARD_DATA } from '@/config/psbCard';

function PSBCardWidget({ variant = 'full' }) {
  const bannerUrl = variant === 'compact' 
    ? PSB_CARD_DATA.banners.compact 
    : PSB_CARD_DATA.banners.full;

  return (
    <div className="psb-card">
      <img 
        src={bannerUrl} 
        alt={PSB_CARD_DATA.name}
        className="w-full h-auto rounded-lg"
        loading="lazy"
      />
    </div>
  );
}
```

### Адаптивный выбор баннера

```typescript
import { PSB_CARD_DATA } from '@/config/psbCard';
import { useMediaQuery } from '@/hooks/use-mobile';

function PSBCardWidget({ variant = 'full' }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Выбор баннера в зависимости от устройства и варианта
  const getBannerUrl = () => {
    if (isMobile) {
      return PSB_CARD_DATA.banners.mobile;
    }
    
    if (variant === 'compact') {
      return PSB_CARD_DATA.banners.compact;
    }
    
    if (isDesktop) {
      return PSB_CARD_DATA.banners.desktop;
    }
    
    return PSB_CARD_DATA.banners.full;
  };

  return (
    <div className="psb-card">
      <img 
        src={getBannerUrl()} 
        alt={PSB_CARD_DATA.name}
        className="w-full h-auto rounded-lg"
        loading="lazy"
      />
    </div>
  );
}
```

## Оптимизация производительности

### 1. Lazy Loading

Всегда используйте `loading="lazy"` для баннеров:

```tsx
<img 
  src={bannerUrl} 
  alt={PSB_CARD_DATA.name}
  loading="lazy"
/>
```

### 2. Responsive Images

Используйте `srcset` для разных разрешений экрана:

```tsx
<img 
  src={PSB_CARD_DATA.banners.full}
  srcSet={`
    ${PSB_CARD_DATA.banners.mobile} 370w,
    ${PSB_CARD_DATA.banners.compact} 370w,
    ${PSB_CARD_DATA.banners.full} 600w,
    ${PSB_CARD_DATA.banners.desktop} 800w
  `}
  sizes="(max-width: 768px) 370px, (max-width: 1024px) 600px, 800px"
  alt={PSB_CARD_DATA.name}
  loading="lazy"
/>
```

### 3. Preload для критичных баннеров

Если баннер отображается "above the fold":

```tsx
// В <head> или useEffect
<link 
  rel="preload" 
  as="image" 
  href={PSB_CARD_DATA.banners.full}
/>
```

## Accessibility

### Alt текст

Всегда добавляйте осмысленный alt текст:

```tsx
<img 
  src={bannerUrl}
  alt={`${PSB_CARD_DATA.name} - ${PSB_CARD_DATA.cashback.welcome}`}
  loading="lazy"
/>
```

### Анимация и эпилепсия

GIF-баннеры анимированы. Убедитесь что:
- Анимация не мигает чаще 3 раз в секунду
- Предоставлена возможность остановить анимацию (если требуется)

```tsx
// Опциональная поддержка prefers-reduced-motion
<img 
  src={bannerUrl}
  alt={PSB_CARD_DATA.name}
  className={`
    w-full h-auto rounded-lg
    motion-reduce:hidden
  `}
  loading="lazy"
/>
```

## Соответствие требованиям

### ✅ Что разрешено

- Использование официальных баннеров от партнерки
- Адаптивное отображение в зависимости от устройства
- Lazy loading для оптимизации
- Добавление лейбла "Реклама • erid: ..."

### ❌ Что запрещено

- Модификация баннеров (обрезка, изменение цветов)
- Использование баннеров в popup/overlay
- Автоматическое воспроизведение звука
- Скрытие лейбла "Реклама"

## Примеры использования

### Пример 1: Карточка в списке продуктов

```tsx
<div className="product-card">
  <img 
    src={PSB_CARD_DATA.banners.compact}
    alt={PSB_CARD_DATA.name}
    className="w-full h-auto rounded-t-lg"
    loading="lazy"
  />
  <div className="p-4">
    <h3>{PSB_CARD_DATA.name}</h3>
    <p>{PSB_CARD_DATA.cashback.welcome}</p>
    <ReferralButton product={psbProduct} source="products" />
  </div>
</div>
```

### Пример 2: Полная карточка на странице калькулятора

```tsx
<div className="calculator-recommendation">
  <img 
    src={PSB_CARD_DATA.banners.full}
    alt={PSB_CARD_DATA.name}
    className="w-full h-auto rounded-lg mb-4"
    loading="lazy"
  />
  <div className="space-y-2">
    {PSB_CARD_DATA.features.map((feature, i) => (
      <div key={i} className="flex items-start">
        <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
        <span>{feature}</span>
      </div>
    ))}
  </div>
  <ReferralButton product={psbProduct} source="calculator" />
  <p className="text-xs text-gray-500 mt-2">
    Реклама • erid: {PSB_CARD_DATA.affiliate.erid}
  </p>
</div>
```

## Тестирование

Все баннеры покрыты unit-тестами в `src/test/psbCard.unit.test.ts`:

```bash
npm test -- src/test/psbCard.unit.test.ts
```

Тесты проверяют:
- ✅ Наличие всех вариантов баннеров
- ✅ Корректность путей к файлам
- ✅ Использование официальных креативов

## Поддержка

При возникновении вопросов:
1. Проверьте документацию партнерской программы ПСБ
2. Убедитесь что баннеры доступны в `/public/blog/Creative/`
3. Проверьте консоль браузера на ошибки загрузки
