# Enhanced Blog Card Component

Улучшенный компонент карточки статьи блога с современным дизайном, анимациями и тремя вариантами отображения.

## Особенности

- ✨ **Крупные изображения** - 60% высоты карточки для визуальной привлекательности
- 🎨 **Градиентные оверлеи** - для улучшения читаемости текста на изображениях
- 🔍 **Zoom эффект** - плавное увеличение изображения при наведении (105%)
- 💫 **Анимации Framer Motion** - плавные переходы и hover эффекты
- 🏷️ **Яркие бейджи категорий** - с иконками и цветовым кодированием
- 📐 **Три варианта** - default, featured, hero для разных контекстов
- 🎯 **Жирные тени** - для создания глубины и визуальной иерархии

## Использование

### Базовое использование

```tsx
import { EnhancedBlogCard } from '@/components/blog/enhanced';

<EnhancedBlogCard post={blogPost} />
```

### Варианты

#### Default (280px изображение)
```tsx
<EnhancedBlogCard 
  post={blogPost} 
  variant="default" 
/>
```

#### Featured (360px изображение, с рамкой)
```tsx
<EnhancedBlogCard 
  post={blogPost} 
  variant="featured" 
/>
```

#### Hero (500px изображение, полная ширина)
```tsx
<EnhancedBlogCard 
  post={blogPost} 
  variant="hero" 
/>
```

### Настройки отображения

```tsx
<EnhancedBlogCard 
  post={blogPost}
  variant="default"
  showExcerpt={true}      // Показать описание
  showAuthor={true}       // Показать автора
  showReadingTime={true}  // Показать время чтения
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `post` | `BlogPost` | required | Объект статьи блога |
| `variant` | `'default' \| 'featured' \| 'hero'` | `'default'` | Вариант отображения |
| `showExcerpt` | `boolean` | `true` | Показывать описание статьи |
| `showAuthor` | `boolean` | `true` | Показывать автора |
| `showReadingTime` | `boolean` | `true` | Показывать время чтения |

## Варианты карточек

### Default
- Высота изображения: 280px
- Padding: 24px
- Border radius: 16px
- Shadow: 0 10px 30px rgba(0,0,0,0.15)
- Hover: translateY(-8px) scale(1.02)

### Featured
- Высота изображения: 360px
- Padding: 32px
- Border radius: 20px
- Shadow: 0 15px 40px rgba(0,0,0,0.2)
- Border: 2px gradient border
- Hover: translateY(-12px) scale(1.02)

### Hero
- Высота изображения: 500px
- Padding: 40px
- Border radius: 20px
- Shadow: 0 20px 50px rgba(0,0,0,0.25)
- Border: 2px gradient border
- Hover: translateY(-16px) scale(1.01)

## Категории и иконки

Компонент автоматически подбирает иконку и цвет для каждой категории:

| Категория | Иконка | Цвет |
|-----------|--------|------|
| mortgage-credit | Home | #3B82F6 (Blue) |
| taxes-salary | Calculator | #10B981 (Emerald) |
| utilities-housing | Zap | #F59E0B (Amber) |
| health-fitness | Heart | #EF4444 (Red) |
| family-law | Users | #8B5CF6 (Purple) |
| auto-transport | Car | #06B6D4 (Cyan) |
| investments-deposits | TrendingUp | #84CC16 (Lime) |
| legal-court | Scale | #6B7280 (Gray) |

## Анимации

### Hover эффекты
- **Карточка**: Поднимается вверх и слегка увеличивается
- **Изображение**: Увеличивается на 5% (zoom)
- **Тень**: Становится более выраженной
- **Кнопка "Читать далее"**: Увеличивается на 5%

### Появление
- Fade in с движением снизу вверх
- Длительность: 300ms

## Примеры использования

### Сетка статей (3 колонки)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {posts.map(post => (
    <EnhancedBlogCard 
      key={post.id}
      post={post}
      variant="default"
    />
  ))}
</div>
```

### Избранные статьи (2 колонки)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  {featuredPosts.map(post => (
    <EnhancedBlogCard 
      key={post.id}
      post={post}
      variant="featured"
    />
  ))}
</div>
```

### Hero статья
```tsx
<div className="max-w-4xl mx-auto">
  <EnhancedBlogCard 
    post={heroPost}
    variant="hero"
  />
</div>
```

## Требования

- React 18+
- Framer Motion 12+
- Tailwind CSS 3+
- lucide-react (для иконок)

## Accessibility

- Семантический HTML (article, time)
- ARIA labels для всех интерактивных элементов
- Keyboard navigation support
- Screen reader friendly
- Focus indicators

## Performance

- Lazy loading изображений через OptimizedImage
- Prefetch on hover для быстрой навигации
- GPU-accelerated animations (transform, opacity)
- Оптимизированные изображения с srcset

## Demo

Посмотреть все варианты в действии:
```
/demo/enhanced-blog-card
```
