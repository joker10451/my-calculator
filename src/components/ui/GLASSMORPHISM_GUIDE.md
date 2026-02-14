# Glassmorphism Components Guide

Руководство по использованию компонентов с эффектом glassmorphism (стеклянный морфизм).

## Что такое Glassmorphism?

Glassmorphism - это современный дизайн-тренд, который создает эффект матового стекла с помощью:
- Полупрозрачного фона
- Размытия backdrop-filter
- Тонкой границы
- Мягких теней

## Компоненты

### GlassCard

Основной компонент для создания glassmorphic эффектов.

#### Импорт

```tsx
import { GlassCard } from '@/components/ui/glass-card';
```

#### Варианты (Variants)

##### 1. Default (по умолчанию)

Стандартный glassmorphic эффект для контентных блоков.

```tsx
<GlassCard className="p-6">
  <h3 className="text-white">Заголовок</h3>
  <p className="text-white/80">Контент</p>
</GlassCard>
```

**Характеристики:**
- Фон: `bg-white/10` (светлая тема), `bg-white/5` (темная тема)
- Размытие: `backdrop-blur-[10px]`
- Граница: `border-white/20`
- Тень: `shadow-[0_8px_32px_rgba(0,0,0,0.1)]`

##### 2. Header

Усиленное размытие для навигации и заголовков.

```tsx
<GlassCard variant="header" className="p-4">
  <nav className="flex gap-4">
    <a href="#" className="text-white">Главная</a>
    <a href="#" className="text-white">О нас</a>
  </nav>
</GlassCard>
```

**Характеристики:**
- Фон: `bg-white/80` (светлая тема), `bg-gray-900/80` (темная тема)
- Размытие: `backdrop-blur-[20px]`
- Насыщенность: `backdrop-saturate-[180%]`
- Граница: `border-b border-black/10`

##### 3. Modal

Темный полупрозрачный фон для модальных окон.

```tsx
<GlassCard variant="modal" className="fixed inset-0 flex items-center justify-center">
  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8">
    <h3 className="text-white">Модальное окно</h3>
  </div>
</GlassCard>
```

**Характеристики:**
- Фон: `bg-black/50`
- Размытие: `backdrop-blur-[8px]`
- Без границы
- Тень: `shadow-2xl`

#### Props

```typescript
interface GlassCardProps {
  variant?: "default" | "header" | "modal";
  useFallback?: boolean;
  className?: string;
  children?: React.ReactNode;
}
```

- `variant` - вариант стиля (default, header, modal)
- `useFallback` - принудительно использовать fallback режим
- `className` - дополнительные CSS классы
- `children` - дочерние элементы

## Feature Detection

### Утилиты

```tsx
import { supportsBackdropFilter } from '@/lib/feature-detection';

if (supportsBackdropFilter()) {
  // Браузер поддерживает backdrop-filter
}
```

Доступные функции:
- `supportsBackdropFilter()` - проверка backdrop-filter
- `supportsGrid()` - проверка CSS Grid
- `supportsCSSVariables()` - проверка CSS переменных
- `supportsTransforms()` - проверка CSS transforms
- `supportsAnimations()` - проверка CSS animations

### React Hooks

```tsx
import { useFeatureDetection, useFeatureSupport } from '@/hooks/useFeatureDetection';

// Получить все флаги поддержки
const features = useFeatureDetection();
console.log(features.backdropFilter); // true/false

// Проверить конкретную функцию
const supportsBackdrop = useFeatureSupport('backdropFilter');
```

## Fallback Mode

Если браузер не поддерживает `backdrop-filter`, компонент автоматически переключается на fallback режим с непрозрачным фоном.

### Автоматический Fallback

```tsx
<GlassCard className="p-6">
  {/* Автоматически использует fallback если нужно */}
</GlassCard>
```

### Принудительный Fallback

```tsx
<GlassCard useFallback className="p-6">
  {/* Всегда использует fallback режим */}
</GlassCard>
```

## Примеры использования

### Поисковая строка

```tsx
<GlassCard className="p-2">
  <div className="flex items-center gap-3 px-4">
    <Search className="w-5 h-5 text-white/60" />
    <input
      type="text"
      placeholder="Поиск..."
      className="flex-1 bg-transparent text-white placeholder:text-white/50"
    />
  </div>
</GlassCard>
```

### Карточка контента

```tsx
<GlassCard className="p-6 hover:scale-105 transition-transform">
  <h3 className="text-xl font-bold text-white mb-2">Заголовок</h3>
  <p className="text-white/70">Описание контента</p>
</GlassCard>
```

### Навигационная панель

```tsx
<GlassCard variant="header" className="fixed top-0 left-0 right-0 z-50 p-4">
  <div className="flex items-center justify-between">
    <Logo />
    <Navigation />
    <UserMenu />
  </div>
</GlassCard>
```

### Модальное окно

```tsx
<GlassCard variant="modal" className="fixed inset-0 z-50">
  <div className="flex items-center justify-center h-full">
    <GlassCard className="max-w-md p-8">
      <h2 className="text-2xl font-bold text-white mb-4">Заголовок</h2>
      <p className="text-white/80 mb-6">Контент модального окна</p>
      <Button>Закрыть</Button>
    </GlassCard>
  </div>
</GlassCard>
```

## Рекомендации по дизайну

### Цвета текста

На glassmorphic фоне используйте:
- Заголовки: `text-white` или `text-white dark:text-white/90`
- Основной текст: `text-white/80` или `text-white/70`
- Второстепенный текст: `text-white/60` или `text-white/50`

### Hover эффекты

```tsx
<GlassCard className="p-6 hover:bg-white/20 transition-colors">
  {/* Контент */}
</GlassCard>
```

### Фоновые изображения

Glassmorphism лучше всего работает на ярких градиентных или фотографических фонах:

```tsx
<div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
  <GlassCard className="p-8">
    {/* Контент */}
  </GlassCard>
</div>
```

## Производительность

### Оптимизация

1. **Используйте backdrop-filter экономно** - это ресурсоемкое свойство
2. **Ограничьте количество glassmorphic элементов** на странице
3. **Избегайте вложенных backdrop-filter** - это может снизить производительность
4. **Используйте will-change** для анимированных элементов:

```tsx
<GlassCard className="will-change-transform hover:scale-105">
  {/* Контент */}
</GlassCard>
```

### Тестирование производительности

Проверьте производительность на разных устройствах:
- Desktop: должно работать плавно (60fps)
- Mobile: может потребоваться fallback режим
- Старые браузеры: автоматически используют fallback

## Совместимость браузеров

### Поддержка backdrop-filter

- ✅ Chrome 76+
- ✅ Safari 9+ (с префиксом -webkit-)
- ✅ Firefox 103+
- ✅ Edge 79+
- ❌ IE 11 (используется fallback)

### Проверка поддержки

```tsx
import { useFeatureSupport } from '@/hooks/useFeatureDetection';

function MyComponent() {
  const supportsBackdrop = useFeatureSupport('backdropFilter');
  
  return (
    <div>
      {supportsBackdrop ? (
        <GlassCard>Glassmorphic эффект</GlassCard>
      ) : (
        <div className="bg-white/90">Fallback</div>
      )}
    </div>
  );
}
```

## Демо

Посмотрите полную демонстрацию на странице:
```
/demo/glassmorphism
```

## Troubleshooting

### Эффект не виден

1. Убедитесь, что фон не однотонный - glassmorphism требует контрастного фона
2. Проверьте, что браузер поддерживает backdrop-filter
3. Убедитесь, что элемент не имеет `overflow: hidden` на родителе

### Низкая производительность

1. Уменьшите количество glassmorphic элементов
2. Используйте меньшее значение blur (например, `blur(5px)` вместо `blur(20px)`)
3. Включите fallback режим для мобильных устройств

### Текст плохо читается

1. Увеличьте непрозрачность фона: `bg-white/20` → `bg-white/30`
2. Добавьте text-shadow для улучшения читаемости:
   ```tsx
   <h1 className="text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.3)]">
     Заголовок
   </h1>
   ```
3. Используйте более темный/светлый фон в зависимости от контента
