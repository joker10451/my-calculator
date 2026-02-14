# Дизайн: Консолидация данных блога

## Обзор

Система консолидации данных блога предназначена для объединения 9 разрозненных файлов с данными статей в единую, хорошо структурированную систему. Это критически важно для упрощения поддержки, предотвращения дублирования данных и обеспечения целостности информации.

## Архитектура

### Текущая архитектура (проблемная)

```
src/data/
├── blogPosts.ts (основной файл + импорты из других)
├── blogPostsNew.ts
├── blogPostsNew2.ts
├── blogPostsNew3.ts
├── blogPostsNew4.ts
├── blogPostsNew5.ts
├── blogArticlesGenerated.ts
├── blogArticlesGenerated2.ts
└── blogPostsRemaining.ts (возможно)
```

### Новая архитектура (целевая)

```
src/data/
├── blog/
│   ├── articles.json (все статьи в JSON формате)
│   └── index.ts (экспорт типизированных данных)
├── blogCategories.ts (без изменений)
└── utils/
    └── migrateBlogData.ts (утилита миграции)
```

## Компоненты и интерфейсы

### 1. Утилита анализа данных

```typescript
// src/utils/analyzeBlogData.ts
interface BlogDataAnalysis {
  totalFiles: number;
  totalArticles: number;
  uniqueArticles: number;
  duplicates: BlogPost[];
  missingFields: Array<{
    articleId: string;
    missingFields: string[];
  }>;
  invalidArticles: BlogPost[];
}

export function analyzeBlogData(): BlogDataAnalysis {
  // Анализирует все файлы с данными блога
  // Выявляет дубликаты, отсутствующие поля, невалидные статьи
}
```

### 2. Утилита консолидации

```typescript
// src/utils/consolidateBlogData.ts
interface ConsolidationResult {
  consolidatedArticles: BlogPost[];
  removedDuplicates: number;
  fixedArticles: number;
  errors: string[];
}

export function consolidateBlogData(): ConsolidationResult {
  // Объединяет все статьи из разных файлов
  // Удаляет дубликаты по ID и slug
  // Исправляет отсутствующие поля
  // Валидирует данные
}
```

### 3. Новая структура данных

```typescript
// src/data/blog/index.ts
import articlesData from './articles.json';
import { migrateBlogPosts } from '@/utils/migrateBlogData';
import type { BlogPost } from '@/types/blog';

// Мигрируем данные к новой структуре с поддержкой мультиязычности
const migratedArticles: BlogPost[] = migrateBlogPosts(articlesData);

// Сортируем по дате публикации (новые первыми)
export const blogPosts: BlogPost[] = migratedArticles
  .filter(post => post.isPublished)
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

// Экспорт для обратной совместимости
export default blogPosts;
```

## Модели данных

### Консолидированная структура статьи

```typescript
// Все статьи будут соответствовать типу BlogPost из src/types/blog.ts
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  publishedAt: string;
  updatedAt?: string;
  category: BlogCategory;
  tags: string[];
  featuredImage?: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonical?: string;
    ogImage?: string;
  };
  readingTime: number;
  wordCount?: number;
  isPublished: boolean;
  isFeatured: boolean;
  relatedCalculators?: string[];
  structuredData?: Record<string, unknown>;
  shareCount?: number;
  language: SupportedLanguage;
  translations?: Record<SupportedLanguage, string>;
}
```

### Структура JSON файла

```json
{
  "version": "1.0",
  "lastUpdated": "2026-01-17T00:00:00Z",
  "articles": [
    {
      "id": "1",
      "slug": "ipoteka-2026-novye-usloviya",
      "title": "Ипотека в 2026 году: новые условия и льготные программы",
      // ... остальные поля
    }
  ]
}
```

## Процесс консолидации

### Этап 1: Анализ текущих данных

1. **Сканирование файлов** - найти все файлы с данными статей
2. **Подсчет статей** - определить общее количество статей
3. **Выявление дубликатов** - найти статьи с одинаковыми ID или slug
4. **Валидация данных** - проверить соответствие типу BlogPost
5. **Создание отчета** - сформировать отчет о состоянии данных

### Этап 2: Объединение данных

1. **Загрузка всех файлов** - импорт данных из всех источников
2. **Дедупликация** - удаление дубликатов (приоритет по дате обновления)
3. **Нормализация** - приведение к единому формату
4. **Валидация** - проверка целостности данных
5. **Сортировка** - упорядочивание по дате публикации

### Этап 3: Создание новой структуры

1. **Создание JSON файла** - сохранение консолидированных данных
2. **Создание TypeScript модуля** - типизированный экспорт
3. **Обновление импортов** - замена ссылок на старые файлы
4. **Тестирование** - проверка работоспособности

### Этап 4: Очистка

1. **Создание резервной копии** - сохранение старых файлов
2. **Удаление дублирующихся файлов** - очистка структуры
3. **Обновление gitignore** - исключение резервных копий
4. **Финальная проверка** - тестирование всей системы

## Алгоритм дедупликации

```typescript
function deduplicateArticles(articles: Partial<BlogPost>[]): BlogPost[] {
  const uniqueArticles = new Map<string, BlogPost>();
  
  for (const article of articles) {
    if (!article.id || !article.slug) continue;
    
    const key = `${article.id}-${article.slug}`;
    const existing = uniqueArticles.get(key);
    
    if (!existing) {
      uniqueArticles.set(key, article as BlogPost);
    } else {
      // Приоритет статье с более поздней датой обновления
      const existingDate = new Date(existing.updatedAt || existing.publishedAt);
      const currentDate = new Date(article.updatedAt || article.publishedAt);
      
      if (currentDate > existingDate) {
        uniqueArticles.set(key, article as BlogPost);
      }
    }
  }
  
  return Array.from(uniqueArticles.values());
}
```

## Обработка ошибок

### Типы ошибок

1. **Отсутствующие обязательные поля** - автоматическое заполнение значениями по умолчанию
2. **Невалидные даты** - использование текущей даты с предупреждением
3. **Дублирующиеся ID** - автоматическая генерация нового ID
4. **Отсутствующие категории** - назначение категории по умолчанию
5. **Невалидные изображения** - удаление ссылок на несуществующие изображения

### Стратегия восстановления

```typescript
function sanitizeArticle(article: Partial<BlogPost>): BlogPost {
  return {
    id: article.id || generateUniqueId(),
    slug: article.slug || slugify(article.title || 'untitled'),
    title: article.title || 'Без названия',
    excerpt: article.excerpt || generateExcerpt(article.content || ''),
    content: article.content || '',
    author: article.author || { name: 'Автор не указан' },
    publishedAt: article.publishedAt || new Date().toISOString(),
    category: article.category || getDefaultCategory(),
    tags: article.tags || [],
    readingTime: article.readingTime || calculateReadingTime(article.content || ''),
    isPublished: article.isPublished ?? true,
    isFeatured: article.isFeatured ?? false,
    language: article.language || 'ru',
    seo: article.seo || generateDefaultSEO(article.title || ''),
    // ... остальные поля с значениями по умолчанию
  };
}
```

## Тестирование стратегии

### Unit тесты

1. **Анализ данных** - тестирование функции analyzeBlogData
2. **Дедупликация** - проверка удаления дубликатов
3. **Валидация** - тестирование sanitizeArticle
4. **Консолидация** - проверка объединения данных

### Integration тесты

1. **Полная миграция** - тестирование всего процесса
2. **Обратная совместимость** - проверка работы компонентов
3. **Производительность** - измерение времени загрузки
4. **Целостность данных** - сравнение до и после миграции

## Мониторинг и логирование

### Метрики консолидации

```typescript
interface ConsolidationMetrics {
  startTime: Date;
  endTime: Date;
  duration: number;
  filesProcessed: number;
  articlesFound: number;
  articlesConsolidated: number;
  duplicatesRemoved: number;
  errorsFixed: number;
  warnings: string[];
  errors: string[];
}
```

### Отчет о миграции

```typescript
interface MigrationReport {
  success: boolean;
  metrics: ConsolidationMetrics;
  summary: {
    before: {
      files: number;
      articles: number;
    };
    after: {
      files: number;
      articles: number;
    };
  };
  changes: Array<{
    type: 'added' | 'removed' | 'modified';
    articleId: string;
    description: string;
  }>;
}
```

## Производительность

### Оптимизации

1. **Lazy loading** - загрузка данных по требованию
2. **Кеширование** - кеширование обработанных данных
3. **Streaming** - обработка больших файлов по частям
4. **Параллелизация** - одновременная обработка файлов

### Ожидаемые улучшения

- **Время загрузки**: уменьшение на 30-40%
- **Размер бандла**: уменьшение на 20-25%
- **Время сборки**: уменьшение на 50%
- **Сложность поддержки**: уменьшение в 5-10 раз

## Миграционная стратегия

### Поэтапное внедрение

1. **Фаза 1**: Создание утилит анализа и консолидации
2. **Фаза 2**: Тестирование на копии данных
3. **Фаза 3**: Создание новой структуры данных
4. **Фаза 4**: Обновление импортов в компонентах
5. **Фаза 5**: Удаление старых файлов

### Откат изменений

В случае проблем предусмотрен механизм отката:

1. **Резервные копии** - сохранение всех старых файлов
2. **Git теги** - создание тега перед миграцией
3. **Быстрый откат** - скрипт для восстановления старой структуры
4. **Мониторинг** - отслеживание ошибок после миграции

## Заключение

Консолидация данных блога является критически важной задачей, которая значительно упростит поддержку системы и предотвратит проблемы с дублированием данных. Предложенная архитектура обеспечивает:

- **Единый источник истины** для всех данных блога
- **Простоту поддержки** и добавления новых статей
- **Высокую производительность** за счет оптимизированной структуры
- **Надежность** благодаря валидации и обработке ошибок
- **Масштабируемость** для будущего роста количества статей