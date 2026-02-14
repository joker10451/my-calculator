# Пример интеграции компонента BlogShare

## Обзор

Компонент `BlogShare` предоставляет функциональность для шеринга статей блога в социальных сетях (VK, Telegram, WhatsApp) и копирования ссылки.

## Основные возможности

1. **Кнопки шеринга**: VK, Telegram, WhatsApp, Copy Link
2. **Генерация Open Graph meta tags**: автоматическая генерация OG тегов для социальных сетей
3. **Генерация Twitter Card meta tags**: автоматическая генерация Twitter Card тегов
4. **Трекинг шеринга**: отслеживание событий шеринга в аналитике
5. **Отображение счетчика**: показывает количество шерингов для статей с 10+ shares

## Интеграция в BlogPostPage

### Шаг 1: Импортировать компоненты

```typescript
import { BlogShare } from '@/components/blog/BlogShare';
import { applySocialMetaTags } from '@/utils/socialMetaTags';
import { shareTrackingService } from '@/services/shareTrackingService';
```

### Шаг 2: Применить социальные meta tags

В компоненте `BlogPostPage`, добавьте вызов `applySocialMetaTags` в `useEffect`:

```typescript
import { useEffect } from 'react';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find(p => p.slug === slug && p.isPublished);

  // Применяем социальные meta tags при загрузке страницы
  useEffect(() => {
    if (post) {
      applySocialMetaTags(post);
    }
    
    // Очищаем meta tags при размонтировании
    return () => {
      removeSocialMetaTags();
    };
  }, [post]);

  // ... остальной код
};
```

### Шаг 3: Добавить компонент BlogShare

Добавьте компонент `BlogShare` в разметку страницы статьи:

```typescript
// Получаем количество шерингов для статьи
const shareCount = shareTrackingService.getShareCount(post.id);

return (
  <div className="article-header">
    <h1>{post.title}</h1>
    
    <div className="article-meta">
      <span>{formatDate(post.publishedAt)}</span>
      <span>{post.readingTime} мин чтения</span>
      
      {/* Компонент шеринга */}
      <BlogShare post={post} shareCount={shareCount} />
    </div>
    
    {/* Остальной контент статьи */}
  </div>
);
```

### Шаг 4: Удалить старый код шеринга (если есть)

Если в `BlogPostPage` есть старая функция `handleShare`, её можно удалить:

```typescript
// УДАЛИТЬ ЭТО:
const handleShare = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } catch (err) {
      console.log('Ошибка при попытке поделиться:', err);
    }
  } else {
    navigator.clipboard.writeText(window.location.href);
  }
};
```

## Полный пример интеграции

```typescript
import { useParams, Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { BlogShare } from '@/components/blog/BlogShare';
import { applySocialMetaTags, removeSocialMetaTags } from '@/utils/socialMetaTags';
import { shareTrackingService } from '@/services/shareTrackingService';
import { blogPosts } from '@/data/blogPosts';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find(p => p.slug === slug && p.isPublished);

  // Применяем социальные meta tags
  useEffect(() => {
    if (post) {
      applySocialMetaTags(post);
    }
    
    return () => {
      removeSocialMetaTags();
    };
  }, [post]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // Получаем количество шерингов
  const shareCount = shareTrackingService.getShareCount(post.id);

  return (
    <>
      <Helmet>
        <title>{post.seo.metaTitle || post.title}</title>
        <meta name="description" content={post.seo.metaDescription || post.excerpt} />
        {/* Open Graph и Twitter Card теги будут добавлены через applySocialMetaTags */}
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <article>
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            
            <div className="flex items-center gap-4 text-muted-foreground mb-4">
              <span>{formatDate(post.publishedAt)}</span>
              <span>{post.readingTime} мин чтения</span>
              <span>{post.author.name}</span>
            </div>

            {/* Компонент шеринга */}
            <div className="flex items-center gap-4">
              <BlogShare post={post} shareCount={shareCount} />
            </div>
          </header>

          {/* Контент статьи */}
          <div className="prose max-w-none">
            {/* ... */}
          </div>
        </article>
      </div>
    </>
  );
};

export default BlogPostPage;
```

## Использование в других местах

Компонент `BlogShare` можно использовать в любом месте, где нужна функциональность шеринга:

### В карточке статьи (BlogCard)

```typescript
import { BlogShare } from '@/components/blog/BlogShare';

export const BlogCard = ({ post }) => {
  return (
    <Card>
      <CardHeader>
        <h3>{post.title}</h3>
      </CardHeader>
      <CardContent>
        <p>{post.excerpt}</p>
      </CardContent>
      <CardFooter>
        <BlogShare post={post} />
      </CardFooter>
    </Card>
  );
};
```

### В списке статей

```typescript
{blogPosts.map(post => (
  <div key={post.id} className="article-item">
    <h3>{post.title}</h3>
    <p>{post.excerpt}</p>
    <BlogShare post={post} shareCount={post.shareCount} />
  </div>
))}
```

## API компонента BlogShare

### Props

```typescript
interface BlogShareProps {
  post: BlogPost;        // Статья блога (обязательно)
  shareCount?: number;   // Количество шерингов (опционально)
}
```

### Пример использования

```typescript
// Минимальный вариант
<BlogShare post={post} />

// С количеством шерингов
<BlogShare post={post} shareCount={15} />
```

## Трекинг шерингов

Сервис `shareTrackingService` автоматически отслеживает все события шеринга:

```typescript
import { shareTrackingService } from '@/services/shareTrackingService';

// Получить количество шерингов для статьи
const shareCount = shareTrackingService.getShareCount(articleId);

// Получить детальную статистику
const stats = shareTrackingService.getShareStats(articleId);
console.log(stats.totalShares); // Общее количество
console.log(stats.sharesByPlatform.vk); // Количество шерингов в VK
console.log(stats.sharesByPlatform.telegram); // Количество шерингов в Telegram

// Получить топ статей по шерингам
const topArticles = shareTrackingService.getTopSharedArticles(10);
```

## Генерация социальных meta tags

Утилиты для работы с социальными meta tags:

```typescript
import {
  generateOpenGraphTags,
  generateTwitterCardTags,
  applySocialMetaTags,
  removeSocialMetaTags,
} from '@/utils/socialMetaTags';

// Генерация Open Graph тегов
const ogTags = generateOpenGraphTags(article);
console.log(ogTags['og:title']);
console.log(ogTags['og:description']);
console.log(ogTags['og:image']);

// Генерация Twitter Card тегов
const twitterTags = generateTwitterCardTags(article);
console.log(twitterTags['twitter:card']);
console.log(twitterTags['twitter:title']);

// Применение всех социальных meta tags
applySocialMetaTags(article);

// Удаление социальных meta tags (при размонтировании компонента)
removeSocialMetaTags();
```

## Стилизация

Компонент использует компоненты из `@/components/ui`:
- `Button` - для кнопок
- `Dialog` - для модального окна
- `toast` (sonner) - для уведомлений

Стили можно кастомизировать через Tailwind CSS классы.

## Тестирование

### Property тесты

Запустить property тесты для социальных функций:

```bash
npm test -- src/test/socialMetaTags.property.test.ts
```

### Unit тесты

Запустить unit тесты для компонента BlogShare:

```bash
npm test -- src/test/BlogShare.unit.test.tsx
```

## Требования

Компонент реализует следующие требования из спецификации:

- **Requirement 7.1**: Кнопки шеринга (VK, Telegram, WhatsApp, Copy Link)
- **Requirement 7.2**: Открытие диалога шеринга
- **Requirement 7.3**: Генерация Open Graph meta tags
- **Requirement 7.4**: Генерация Twitter Card meta tags
- **Requirement 7.5**: Трекинг шеринга
- **Requirement 7.6**: Отображение счетчика шеринга для статей с 10+ shares

## Correctness Properties

Компонент валидирует следующие свойства корректности:

- **Property 23**: Open Graph Tags - генерация OG тегов для всех статей
- **Property 24**: Twitter Card Tags - генерация Twitter Card тегов для всех статей
- **Property 25**: Share Count Display - отображение счетчика для статей с 10+ shares
