# Реализация поддержки Reduced Motion

## Обзор

Успешно реализована полная поддержка `prefers-reduced-motion` для всех анимационных компонентов в соответствии с требованием 4.6.

## Что было реализовано

### 1. Хук useReducedMotion (`src/hooks/useReducedMotion.ts`)

Создан основной хук для определения предпочтений пользователя:

- ✅ Определяет предпочтения пользователя через `window.matchMedia`
- ✅ Динамически отслеживает изменения предпочтений
- ✅ Поддерживает старые браузеры (fallback для `addListener`)
- ✅ Безопасен для SSR (проверка `typeof window`)

**Дополнительные хуки:**
- `useAnimationProps` - возвращает пустой объект при reduced motion
- `useConditionalAnimation` - выбирает между анимированным и статичным значением

### 2. Обновленные компоненты анимаций

Все компоненты анимаций теперь поддерживают reduced motion:

#### ✅ FadeInUp (`src/components/animations/FadeInUp.tsx`)
- Отключает fade-in-up анимацию при reduced motion
- Рендерит обычный `<div>` вместо `<motion.div>`

#### ✅ HoverScale (`src/components/animations/HoverScale.tsx`)
- Отключает hover и tap анимации при reduced motion
- Сохраняет интерактивность без визуальных эффектов

#### ✅ PageTransition (`src/components/animations/PageTransition.tsx`)
- Отключает переходы между страницами при reduced motion
- Мгновенная смена контента

#### ✅ StaggerContainer (`src/components/animations/StaggerContainer.tsx`)
- Отключает последовательное появление элементов
- Все элементы появляются одновременно

#### ✅ StaggerItem (`src/components/animations/StaggerItem.tsx`)
- Работает в паре с StaggerContainer
- Отключает индивидуальные анимации элементов

#### ✅ ColourfulText (`src/components/ui/colourful-text.tsx`)
- Отключает цветовую анимацию текста
- Отображает статичный текст

### 3. CSS поддержка

В `src/index.css` уже были добавлены правила:

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

### 4. Тестирование

Создан полный набор unit-тестов (`src/test/reducedMotion.unit.test.ts`):

- ✅ 11 тестов, все проходят успешно
- ✅ Тестирование хука `useReducedMotion`
- ✅ Тестирование `useAnimationProps`
- ✅ Тестирование `useConditionalAnimation`
- ✅ Интеграция с `motion-config`
- ✅ Поддержка старых браузеров

### 5. Документация

Создана подробная документация:

- ✅ `src/hooks/REDUCED_MOTION_GUIDE.md` - полное руководство по использованию
- ✅ Примеры использования всех хуков
- ✅ Инструкции по тестированию в разных браузерах
- ✅ Лучшие практики и рекомендации
- ✅ Требования доступности (WCAG 2.1)

### 6. Демонстрационная страница

Создана интерактивная демо-страница (`src/pages/ReducedMotionDemo.tsx`):

- ✅ Показывает текущий статус (анимации включены/отключены)
- ✅ Демонстрирует работу всех компонентов
- ✅ Инструкции по включению/отключению в разных браузерах
- ✅ Интерактивные тесты хуков

## Как использовать

### Базовое использование

```tsx
import { useReducedMotion } from '@/hooks/useReducedMotion';

function MyComponent() {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return <StaticVersion />;
  }
  
  return <AnimatedVersion />;
}
```

### С готовыми компонентами

```tsx
import { FadeInUp, HoverScale } from '@/components/animations';

// Автоматически отключается при reduced motion
<FadeInUp>
  <h1>Заголовок</h1>
</FadeInUp>

<HoverScale>
  <button>Кнопка</button>
</HoverScale>
```

## Тестирование

### Запуск тестов

```bash
npm test -- reducedMotion.unit.test.ts
```

### Тестирование в браузере

**Chrome/Edge:**
1. DevTools (F12)
2. Cmd/Ctrl+Shift+P
3. "Emulate CSS prefers-reduced-motion"
4. Выбрать "reduce"

**Firefox:**
1. about:config
2. ui.prefersReducedMotion
3. Установить значение `1`

**Safari:**
1. System Preferences → Accessibility
2. Display → Reduce Motion

## Соответствие требованиям

✅ **Requirement 4.6**: THE Animation_System SHALL respect user's prefers-reduced-motion setting

- Все анимации автоматически отключаются
- Пользователи видят статичный контент
- Интерактивность сохраняется
- Доступность обеспечена

## Доступность (WCAG 2.1)

✅ **Success Criterion 2.3.3** (Level AAA): Анимация от взаимодействий может быть отключена

✅ **Success Criterion 2.2.2** (Level A): Пользователи могут приостановить, остановить или скрыть движущийся контент

## Следующие шаги

Для полной интеграции рекомендуется:

1. Добавить демо-страницу в роутинг приложения
2. Протестировать на реальных устройствах
3. Провести accessibility аудит
4. Обучить команду использованию хуков

## Ресурсы

- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [WCAG 2.1: Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
- [Framer Motion: Accessibility](https://www.framer.com/motion/guide-accessibility/)
