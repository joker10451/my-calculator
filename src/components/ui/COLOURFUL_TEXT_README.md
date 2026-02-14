# ColourfulText Component

Анимированный компонент для отображения цветного текста с эффектами blur, scale и opacity. Каждый символ циклически меняет цвет с задержкой (stagger effect).

## Особенности

- ✅ 10 ярких цветов по умолчанию
- ✅ Анимация цвета, позиции (y), масштаба и размытия
- ✅ Stagger эффект - задержка между символами
- ✅ Поддержка `prefers-reduced-motion` для доступности
- ✅ Кастомизируемые цвета и длительность анимации
- ✅ Полная TypeScript типизация
- ✅ Оптимизирована для производительности

## Использование

### Базовое использование

```tsx
import { ColourfulText } from '@/components/ui/colourful-text';

function MyComponent() {
  return (
    <h1 className="text-6xl font-bold">
      Лучшие <ColourfulText text="финансовые" /> калькуляторы
    </h1>
  );
}
```

### С кастомными цветами

```tsx
<ColourfulText 
  text="Красный, Зеленый, Синий"
  colors={['#ff0000', '#00ff00', '#0000ff']}
/>
```

### С кастомной длительностью

```tsx
<ColourfulText 
  text="Быстрая анимация"
  animationDuration={2000}  // 2 секунды
  staggerDelay={30}         // 30ms между символами
/>
```

### Отключение анимации

```tsx
<ColourfulText 
  text="Статичный текст"
  disableAnimation={true}
/>
```

## Props

| Prop | Тип | По умолчанию | Описание |
|------|-----|--------------|----------|
| `text` | `string` | **обязательно** | Текст для анимации |
| `colors` | `string[]` | `DEFAULT_COLORS` | Массив цветов для циклической анимации |
| `animationDuration` | `number` | `5000` | Длительность одного цикла в миллисекундах |
| `staggerDelay` | `number` | `50` | Задержка между анимацией символов в миллисекундах |
| `className` | `string` | `undefined` | Дополнительные CSS классы |
| `disableAnimation` | `boolean` | `false` | Отключить анимацию |

## Цвета по умолчанию

Компонент использует палитру из 10 ярких цветов:

1. `rgb(131, 179, 32)` - Green
2. `rgb(47, 195, 106)` - Emerald
3. `rgb(42, 169, 210)` - Cyan
4. `rgb(4, 112, 202)` - Blue
5. `rgb(107, 10, 255)` - Purple
6. `rgb(183, 0, 218)` - Magenta
7. `rgb(218, 0, 171)` - Pink
8. `rgb(230, 64, 92)` - Red
9. `rgb(232, 98, 63)` - Orange
10. `rgb(249, 129, 47)` - Amber

## Эффекты анимации

Компонент применяет следующие эффекты к каждому символу:

- **Color**: Циклическая смена цвета через все цвета в массиве
- **Y Position**: Легкое движение вверх-вниз (0 → -2px → 0 → -1px → 0)
- **Scale**: Легкое увеличение-уменьшение (1 → 1.05 → 1 → 1.02 → 1)
- **Blur**: Легкое размытие (0px → 0.5px → 0px)
- **Opacity**: Изменение прозрачности (0.8 → 1 → 0.9 → 1)

## Доступность

Компонент автоматически определяет предпочтения пользователя:

```typescript
// Проверка prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

Если пользователь предпочитает уменьшенное движение, анимация отключается автоматически.

## Производительность

- Использует Framer Motion для оптимизированных анимаций
- Анимирует только GPU-ускоренные свойства (transform, opacity, filter)
- Мемоизация вариантов анимации с помощью `useMemo`
- Легковесный компонент (~3KB gzipped)

## Примеры использования

### В заголовке героя

```tsx
<section className="hero">
  <h1 className="text-7xl font-bold">
    Лучшие <ColourfulText text="финансовые" />
    <br />
    калькуляторы России
  </h1>
</section>
```

### В заголовке секции

```tsx
<section>
  <h2 className="text-4xl font-bold">
    <ColourfulText text="Популярные" /> статьи
  </h2>
</section>
```

### В призыве к действию

```tsx
<div className="cta">
  <h2 className="text-3xl font-bold">
    Начните <ColourfulText text="экономить" /> сегодня
  </h2>
</div>
```

## Демо

Посетите `/demo/colourful-text` для интерактивной демонстрации компонента.

## Требования

- React 18+
- Framer Motion 12+
- TypeScript 5+

## Связанные компоненты

- `motion-config.ts` - Конфигурация анимаций Framer Motion
- `design-system.ts` - Дизайн-система проекта

## Лицензия

MIT
