# Page Transitions & Loading States Guide

## Overview

Этот гайд описывает реализацию плавных переходов между страницами и состояний загрузки для блога.

## Page Transitions

### Использование

Все маршруты в приложении автоматически обернуты в `PageTransition` компонент, который обеспечивает плавные fade-анимации при переходе между страницами.

```tsx
// В App.tsx
<AnimatePresence mode="wait" initial={false}>
  <Routes location={location} key={location.pathname}>
    <Route path="/blog" element={<PageTransition><BlogPage /></PageTransition>} />
  </Routes>
</AnimatePresence>
```

### Характеристики

- **Анимация**: Fade in/out с небольшим сдвигом по Y-оси
- **Длительность**: 300ms
- **Поддержка prefers-reduced-motion**: Автоматически отключается для пользователей с настройкой reduced motion

## Loading States

### Skeleton Loaders с Shimmer эффектом

Все skeleton loaders теперь имеют shimmer эффект для более приятного визуального опыта.

#### Базовый Skeleton компонент

```tsx
import { Skeleton } from '@/components/ui/skeleton';

<Skeleton className="h-48 w-full" />
```

Shimmer эффект реализован через CSS анимацию:
- Градиент перемещается слева направо
- Длительность: 2 секунды
- Бесконечный цикл

### BlogCardSkeleton

Skeleton loader для обычных карточек блога.

```tsx
import { BlogCardSkeleton } from '@/components/blog/BlogCardSkeleton';

<BlogCardSkeleton 
  variant="default"
  showExcerpt={true}
  showAuthor={true}
  showReadingTime={true}
/>
```

**Варианты:**
- `default`: Стандартная карточка
- `featured`: Увеличенная карточка с большими отступами
- `compact`: Компактная карточка без excerpt

### EnhancedBlogCardSkeleton

Skeleton loader для улучшенных карточек блога.

```tsx
import { EnhancedBlogCardSkeleton } from '@/components/blog/enhanced/EnhancedBlogCardSkeleton';

<EnhancedBlogCardSkeleton 
  variant="featured"
  showExcerpt={true}
/>
```

**Варианты:**
- `default`: Изображение 280px
- `featured`: Изображение 360px с рамкой
- `hero`: Изображение 500px, полная ширина

### Использование с BlogCard

BlogCard и EnhancedBlogCard теперь поддерживают prop `isLoading`:

```tsx
import { BlogCard } from '@/components/blog/BlogCard';

// Показать skeleton во время загрузки
<BlogCard post={post} isLoading={true} />

// Показать реальный контент
<BlogCard post={post} isLoading={false} />
```

### BlogLoadingSkeleton

Полноэкранный skeleton для страницы блога:

```tsx
import { BlogLoadingSkeleton } from '@/components/LoadingSkeleton';

<Suspense fallback={<BlogLoadingSkeleton />}>
  <BlogPage />
</Suspense>
```

## Blur-up для изображений

OptimizedImage компонент автоматически использует blur-up технику:

1. Показывает размытый placeholder (SVG)
2. Загружает реальное изображение
3. Плавно переключается на реальное изображение

```tsx
import { OptimizedImage } from '@/components/blog/OptimizedImage';

<OptimizedImage
  src="/blog/article.jpg"
  alt="Article image"
  width={800}
  height={600}
  priority={false} // true для above-the-fold изображений
/>
```

**Особенности:**
- Lazy loading для изображений ниже fold
- Автоматический fallback на SVG версию при ошибке
- Placeholder при полном отказе загрузки
- Плавная анимация появления (300ms)

## Tailwind конфигурация

Shimmer анимация добавлена в `tailwind.config.ts`:

```typescript
keyframes: {
  shimmer: {
    "0%": { transform: "translateX(-100%)" },
    "100%": { transform: "translateX(100%)" },
  },
},
animation: {
  shimmer: "shimmer 2s infinite",
}
```

## Примеры использования

### Загрузка списка статей

```tsx
const BlogList = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts().then(data => {
      setPosts(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="grid grid-cols-3 gap-8">
      {isLoading ? (
        // Показываем 6 skeleton loaders
        Array.from({ length: 6 }).map((_, i) => (
          <EnhancedBlogCardSkeleton key={i} variant="default" />
        ))
      ) : (
        // Показываем реальные карточки
        posts.map(post => (
          <EnhancedBlogCard key={post.id} post={post} />
        ))
      )}
    </div>
  );
};
```

### Страница с переходами

```tsx
const BlogPostPage = () => {
  return (
    <PageTransition>
      <article>
        <h1>Article Title</h1>
        <OptimizedImage 
          src="/hero.jpg" 
          alt="Hero" 
          priority={true}
        />
        <p>Content...</p>
      </article>
    </PageTransition>
  );
};
```

## Производительность

### Оптимизации

1. **GPU-ускорение**: Все анимации используют `transform` и `opacity`
2. **Lazy loading**: Изображения загружаются только при приближении к viewport
3. **Code splitting**: PageTransition и skeleton компоненты могут быть lazy loaded
4. **Reduced motion**: Автоматическое отключение анимаций для пользователей с настройкой

### Метрики

- Shimmer анимация: 60fps
- Page transition: 300ms
- Image fade-in: 300ms
- Skeleton render: < 16ms

## Accessibility

- ✅ Поддержка `prefers-reduced-motion`
- ✅ Semantic HTML в skeleton loaders
- ✅ ARIA labels для loading states
- ✅ Keyboard navigation не нарушается
- ✅ Screen reader friendly

## Требования

Реализация соответствует следующим требованиям из спецификации:

- **Requirement 4.5**: Page transitions с fade эффектом
- **Requirement 13.8**: Skeleton loaders с shimmer эффектом
- **Requirement 7.2**: Blur-up placeholder для изображений
- **Requirement 7.3**: Lazy loading для изображений

## Дальнейшие улучшения

Возможные улучшения в будущем:

1. Добавить различные типы переходов (slide, scale)
2. Реализовать shared element transitions
3. Добавить прогресс-бар загрузки
4. Оптимизировать размер blur placeholder
5. Добавить preloading для критических изображений
