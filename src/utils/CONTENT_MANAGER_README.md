# Content Manager Utilities

Утилиты для автоматизации управления контентом блога.

## Функции

### 1. suggestTags()

Предлагает теги на основе контента статьи.

```typescript
import { suggestTags } from '@/utils/contentManager';

const article = {
  title: 'Калькулятор ипотеки 2026',
  excerpt: 'Как рассчитать ипотеку...',
  content: 'Полный текст статьи...',
  // ... другие поля
};

const existingTags = ['ипотека', 'кредит', 'калькулятор'];
const suggestions = suggestTags(article, existingTags, 5);
// Результат: ['ипотека', 'калькулятор', 'кредит', 'расчет', 'платеж']
```

**Параметры:**
- `article` - статья блога
- `existingTags` - существующие теги в системе (для приоритизации)
- `limit` - максимальное количество предложенных тегов (по умолчанию 5)

**Возвращает:** массив предложенных тегов, отсортированных по релевантности

### 2. validateCalculatorLinks()

Валидирует ссылки на калькуляторы в статье.

```typescript
import { validateCalculatorLinks } from '@/utils/contentManager';

const article = {
  relatedCalculators: ['mortgage', 'credit', 'invalid-calc'],
  // ... другие поля
};

const validCalculatorIds = ['mortgage', 'credit', 'salary', 'deposit'];
const result = validateCalculatorLinks(article, validCalculatorIds);

console.log(result);
// {
//   isValid: false,
//   invalidLinks: ['invalid-calc'],
//   validLinks: ['mortgage', 'credit'],
//   suggestions: ['credit'] // похожие калькуляторы
// }
```

**Параметры:**
- `article` - статья блога
- `validCalculatorIds` - список валидных ID калькуляторов

**Возвращает:** объект с результатами валидации

### 3. checkDuplicateContent()

Проверяет контент на дубликаты.

```typescript
import { checkDuplicateContent } from '@/utils/contentManager';

const newArticle = {
  title: 'Новая статья',
  content: 'Контент статьи...',
  // ... другие поля
};

const allArticles = [...]; // все существующие статьи

const result = checkDuplicateContent(newArticle, allArticles, 0.8);

console.log(result);
// {
//   isDuplicate: true,
//   duplicates: [
//     { article: {...}, similarity: 0.85 }
//   ],
//   highSimilarity: [
//     { article: {...}, similarity: 0.65 }
//   ]
// }
```

**Параметры:**
- `article` - проверяемая статья
- `allArticles` - все существующие статьи
- `threshold` - порог схожести для определения дубликата (по умолчанию 0.8 = 80%)

**Возвращает:** объект с результатами проверки

### 4. suggestRelatedArticles()

Предлагает похожие статьи на основе контента.

```typescript
import { suggestRelatedArticles } from '@/utils/contentManager';

const article = {
  title: 'Ипотека 2026',
  content: 'Контент о ипотеке...',
  tags: ['ипотека', 'кредит'],
  category: { id: 'mortgage-credit', ... },
  // ... другие поля
};

const allArticles = [...]; // все доступные статьи

const suggestions = suggestRelatedArticles(article, allArticles, 5);

console.log(suggestions);
// [
//   {
//     article: {...},
//     similarity: 0.75,
//     reason: 'Та же категория, Общие теги: ипотека, кредит'
//   },
//   ...
// ]
```

**Параметры:**
- `article` - текущая статья
- `allArticles` - все доступные статьи
- `limit` - максимальное количество предложений (по умолчанию 5)

**Возвращает:** массив похожих статей с оценкой схожести и причиной

### 5. autoSaveDraft()

Автоматическое сохранение черновика в localStorage.

```typescript
import { autoSaveDraft } from '@/utils/contentManager';

const draft = {
  id: 'article-123', // или 'new' для нового
  title: 'Заголовок статьи',
  content: 'Контент статьи...',
  excerpt: 'Краткое описание',
  categoryId: 'mortgage-credit',
  tags: ['ипотека', 'кредит'],
};

const success = autoSaveDraft(draft);
// true если сохранение успешно
```

### 6. loadDraft()

Загружает черновик из localStorage.

```typescript
import { loadDraft } from '@/utils/contentManager';

const draft = loadDraft('article-123');
// или
const newDraft = loadDraft('new');

console.log(draft);
// {
//   id: 'article-123',
//   title: 'Заголовок статьи',
//   content: 'Контент статьи...',
//   lastSaved: '2026-01-16T12:00:00.000Z'
// }
```

### 7. deleteDraft()

Удаляет черновик из localStorage.

```typescript
import { deleteDraft } from '@/utils/contentManager';

const success = deleteDraft('article-123');
// true если удаление успешно
```

### 8. getAllDrafts()

Получает список всех черновиков.

```typescript
import { getAllDrafts } from '@/utils/contentManager';

const drafts = getAllDrafts();
// [
//   { id: 'article-123', title: '...', lastSaved: '...' },
//   { id: 'new', title: '...', lastSaved: '...' },
// ]
// Отсортированы по дате последнего сохранения (новые первыми)
```

## Примеры использования

### Создание новой статьи с автоматическими предложениями

```typescript
import {
  suggestTags,
  validateCalculatorLinks,
  checkDuplicateContent,
  autoSaveDraft,
} from '@/utils/contentManager';

// 1. Создаём черновик статьи
const draft = {
  id: 'new',
  title: 'Как рассчитать ипотеку в 2026 году',
  content: 'Полный текст статьи о расчете ипотеки...',
  excerpt: 'Узнайте как правильно рассчитать ипотеку',
  categoryId: 'mortgage-credit',
};

// 2. Автосохранение каждые 30 секунд
setInterval(() => {
  autoSaveDraft(draft);
}, 30000);

// 3. Предлагаем теги
const existingTags = ['ипотека', 'кредит', 'калькулятор', 'недвижимость'];
const suggestedTags = suggestTags(draft, existingTags, 5);
console.log('Предложенные теги:', suggestedTags);

// 4. Проверяем ссылки на калькуляторы
draft.relatedCalculators = ['mortgage', 'refinancing'];
const linkValidation = validateCalculatorLinks(
  draft,
  ['mortgage', 'credit', 'refinancing', 'deposit']
);

if (!linkValidation.isValid) {
  console.warn('Невалидные ссылки:', linkValidation.invalidLinks);
  console.log('Предложения:', linkValidation.suggestions);
}

// 5. Проверяем на дубликаты перед публикацией
const duplicateCheck = checkDuplicateContent(draft, allArticles, 0.8);

if (duplicateCheck.isDuplicate) {
  console.error('Обнаружены дубликаты:', duplicateCheck.duplicates);
} else if (duplicateCheck.highSimilarity.length > 0) {
  console.warn('Похожие статьи:', duplicateCheck.highSimilarity);
}
```

### Редактирование существующей статьи

```typescript
import {
  loadDraft,
  suggestRelatedArticles,
  autoSaveDraft,
} from '@/utils/contentManager';

// 1. Загружаем черновик
const draft = loadDraft('article-123');

if (draft) {
  console.log('Последнее сохранение:', draft.lastSaved);
  
  // 2. Редактируем
  draft.content += '\n\nДополнительная информация...';
  
  // 3. Предлагаем связанные статьи
  const related = suggestRelatedArticles(draft, allArticles, 5);
  console.log('Связанные статьи:', related);
  
  // 4. Сохраняем
  autoSaveDraft(draft);
}
```

## Property-Based Tests

Все функции покрыты property-based тестами (100 итераций каждый):

- **Property 29**: Tag Suggestion Relevance - релевантность предложенных тегов
- **Property 30**: Link Validation - валидация ссылок на калькуляторы
- **Property 31**: Duplicate Content Detection - обнаружение дубликатов (> 80% similarity)

Тесты находятся в `src/test/contentManager.property.test.ts`.

## Требования

Validates Requirements:
- 9.3 - Предложение тегов на основе контента
- 9.4 - Валидация ссылок на калькуляторы
- 9.6 - Проверка дубликатов контента
- 9.7 - Предложение похожих статей
