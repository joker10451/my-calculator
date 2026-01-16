# Руководство по поддержке Reduced Motion

## Обзор

Поддержка `prefers-reduced-motion` обеспечивает доступность для пользователей, которые предпочитают уменьшенное количество анимаций. Это важно для людей с вестибулярными расстройствами, эпилепсией или просто для тех, кто предпочитает статичный интерфейс.

## Как это работает

### 1. Хук useReducedMotion

Основной хук для определения предпочтений пользователя:

```typescript
import { useReducedMotion } from '@/hooks/useReducedMotion';

function MyComponent() {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    // Отключить анимации
    return <StaticVersion />;
  }
  
  return <AnimatedVersion />;
}
```

### 2. Вспомогательные хуки

#### useAnimationProps

Возвращает пустой объект, если нужно уменьшить движение:

```typescript
import { useAnimationProps } from '@/hooks/useReducedMotion';

function MyComponent() {
  const animationProps = useAnimationProps({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  });
  
  return <motion.div {...animationProps}>Content</motion.div>;
}
```

#### useConditionalAnimation

Выбирает между анимированным и статичным значением:

```typescript
import { useConditionalAnimation } from '@/hooks/useReducedMotion';

function MyComponent() {
  const duration = useConditionalAnimation(0.3, 0);
  
  return <motion.div transition={{ duration }}>Content</motion.div>;
}
```

## Компоненты с поддержкой Reduced Motion

Все компоненты анимаций автоматически поддерживают `prefers-reduced-motion`:

### FadeInUp

```tsx
import { FadeInUp } from '@/components/animations';

// Автоматически отключается при prefers-reduced-motion
<FadeInUp>
  <h1>Заголовок</h1>
</FadeInUp>
```

### HoverScale

```tsx
import { HoverScale } from '@/components/animations';

// Автоматически отключается при prefers-reduced-motion
<HoverScale>
  <button>Кнопка</button>
</HoverScale>
```

### PageTransition

```tsx
import { PageTransition } from '@/components/animations';

// Автоматически отключается при prefers-reduced-motion
<PageTransition>
  <div>Контент страницы</div>
</PageTransition>
```

### StaggerContainer и StaggerItem

```tsx
import { StaggerContainer, StaggerItem } from '@/components/animations';

// Автоматически отключается при prefers-reduced-motion
<StaggerContainer>
  <StaggerItem>Элемент 1</StaggerItem>
  <StaggerItem>Элемент 2</StaggerItem>
  <StaggerItem>Элемент 3</StaggerItem>
</StaggerContainer>
```

### ColourfulText

```tsx
import { ColourfulText } from '@/components/ui/colourful-text';

// Автоматически отключается при prefers-reduced-motion
<h1>
  Лучшие <ColourfulText text="финансовые" /> калькуляторы
</h1>
```

## CSS поддержка

В `src/index.css` уже добавлены правила для отключения всех анимаций:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Тестирование

### В браузере

#### Chrome/Edge
1. Откройте DevTools (F12)
2. Нажмите Cmd+Shift+P (Mac) или Ctrl+Shift+P (Windows)
3. Введите "Emulate CSS prefers-reduced-motion"
4. Выберите "reduce"

#### Firefox
1. Откройте about:config
2. Найдите `ui.prefersReducedMotion`
3. Установите значение `1`

#### Safari
1. System Preferences → Accessibility
2. Display → Reduce Motion

### Программно

```typescript
// Проверка в коде
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  console.log('Пользователь предпочитает уменьшенное движение');
}
```

## Лучшие практики

### ✅ Правильно

```tsx
// Использовать хук для условного рендеринга
function MyComponent() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      animate={shouldReduceMotion ? {} : { scale: 1.1 }}
    >
      Content
    </motion.div>
  );
}

// Использовать готовые компоненты
<FadeInUp>
  <Content />
</FadeInUp>
```

### ❌ Неправильно

```tsx
// Не игнорировать предпочтения пользователя
<motion.div
  animate={{ scale: 1.1 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>

// Не использовать только CSS без проверки
<div className="animate-bounce">
  Content
</div>
```

## Альтернативы анимациям

Когда анимации отключены, используйте:

1. **Мгновенные переходы** - контент появляется сразу
2. **Статичные эффекты** - тени, границы, цвета
3. **Визуальная иерархия** - размер, вес, контраст
4. **Пространство** - отступы и выравнивание

## Требования доступности

Согласно WCAG 2.1:

- **Success Criterion 2.3.3** (Level AAA): Анимация от взаимодействий может быть отключена
- **Success Criterion 2.2.2** (Level A): Пользователи могут приостановить, остановить или скрыть движущийся контент

## Дополнительные ресурсы

- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [WCAG 2.1: Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
- [Framer Motion: Accessibility](https://www.framer.com/motion/guide-accessibility/)
