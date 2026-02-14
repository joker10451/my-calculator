# Руководство по созданию статей для блога

## Проблема

Создание больших статей (>2000 слов) в TypeScript файлах неудобно:
- Сложно форматировать контент
- Трудно поддерживать структуру
- Много повторяющегося кода
- Сложно читать и редактировать

## Решение: BlogArticleBuilder

Мы создали утилиту `BlogArticleBuilder`, которая упрощает создание статей с помощью fluent API.

## Быстрый старт

```typescript
import { createArticle } from '@/utils/blogArticleGenerator';
import { blogCategories } from '@/data/blogCategories';

const myArticle = createArticle({
  id: '100',
  slug: 'my-article',
  title: 'Моя статья',
  excerpt: 'Краткое описание',
  author: {
    name: 'Иван Иванов',
    bio: 'Эксперт'
  },
  publishedAt: '2026-01-20T10:00:00Z',
  category: blogCategories[0],
  tags: ['тег1', 'тег2'],
  relatedCalculators: ['calculator-id']
})
  .addH1('Заголовок статьи')
  .addH2('Раздел 1')
  .addParagraph('Текст параграфа...')
  .addList(['Пункт 1', 'Пункт 2'])
  .addH2('Раздел 2')
  .addTable(
    ['Колонка 1', 'Колонка 2'],
    [['Значение 1', 'Значение 2']]
  )
  .addConclusion('Заключительный текст', 'calculator-id')
  .build();
```

## Доступные методы

### Заголовки

```typescript
.addH1('Заголовок H1')
.addH2('Заголовок H2')
.addH3('Заголовок H3')
```

### Текст

```typescript
.addParagraph('Обычный параграф текста')
```

### Списки

```typescript
// Маркированный список
.addList(['Пункт 1', 'Пункт 2', 'Пункт 3'])

// Нумерованный список
.addList(['Шаг 1', 'Шаг 2', 'Шаг 3'], true)
```

### Таблицы

```typescript
.addTable(
  ['Заголовок 1', 'Заголовок 2', 'Заголовок 3'],
  [
    ['Строка 1, Ячейка 1', 'Строка 1, Ячейка 2', 'Строка 1, Ячейка 3'],
    ['Строка 2, Ячейка 1', 'Строка 2, Ячейка 2', 'Строка 2, Ячейка 3']
  ]
)
```

### Ссылки на калькуляторы

```typescript
.addCalculatorLink('mortgage', 'Рассчитайте ипотеку')
```

### Примеры расчетов

```typescript
.addCalculationExample(
  'Пример расчета ОСАГО',
  {
    'Автомобиль': 'Toyota Camry',
    'Мощность': '150 л.с.',
    'Регион': 'Москва',
    'Стаж': '10 лет'
  },
  'Стоимость: **7 560 рублей**'
)
```

### FAQ секция

```typescript
.addFAQ([
  {
    question: 'Вопрос 1?',
    answer: 'Ответ на вопрос 1'
  },
  {
    question: 'Вопрос 2?',
    answer: 'Ответ на вопрос 2'
  }
])
```

### Заключение

```typescript
.addConclusion(
  'Текст заключения с выводами',
  'calculator-id' // опционально
)
```

## Полный пример

См. файл `src/data/blogArticlesGenerated.ts` для полных примеров использования.

## Преимущества

✅ **Читабельность**: Код легко читать и понимать структуру
✅ **Поддержка**: Легко редактировать и обновлять
✅ **Консистентность**: Все статьи имеют единый формат
✅ **Автоматизация**: SEO, structured data, reading time генерируются автоматически
✅ **Типобезопасность**: TypeScript проверяет типы
✅ **Переиспользование**: Можно создавать шаблоны для разных типов статей

## Альтернативный подход: Markdown файлы

Для еще большего удобства можно хранить контент в отдельных `.md` файлах:

```
src/content/blog/
  ├── osago-2026.md
  ├── kasko-2026.md
  └── ipoteka-2026.md
```

Затем использовать систему сборки (Vite, Webpack) для импорта:

```typescript
import osagoContent from '@/content/blog/osago-2026.md?raw';

const article = {
  ...metadata,
  content: osagoContent
};
```

## Рекомендации

1. **Используйте Builder для программной генерации** - когда нужно создать много похожих статей
2. **Используйте Markdown файлы для ручного написания** - когда пишете уникальный контент
3. **Комбинируйте подходы** - метаданные в TS, контент в MD

## Шаблоны статей

Создайте функции-шаблоны для разных типов статей:

```typescript
function createGuideArticle(metadata, steps) {
  return createArticle(metadata)
    .addH1(metadata.title)
    .addH2('Введение')
    .addParagraph('...')
    .addH2('Что вам понадобится')
    .addList(steps.requirements)
    // ... остальные шаги
    .build();
}

function createReviewArticle(metadata, pros, cons) {
  return createArticle(metadata)
    .addH1(metadata.title)
    .addH2('Преимущества')
    .addList(pros)
    .addH2('Недостатки')
    .addList(cons)
    // ... остальное
    .build();
}
```

## Миграция существующих статей

Постепенно переносите существующие статьи на новый формат:

1. Создайте новую статью с Builder
2. Скопируйте контент из старой
3. Проверьте форматирование
4. Замените в массиве blogPosts

## Заключение

Использование `BlogArticleBuilder` значительно упрощает создание и поддержку больших статей. Код становится чище, а процесс создания контента - быстрее и приятнее.
