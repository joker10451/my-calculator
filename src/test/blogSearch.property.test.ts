import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
  search,
  calculateRelevance,
  highlightMatches,
  tokenize,
  stem
} from '@/services/searchService';
import type { BlogPost } from '@/types/blog';

// Генератор для BlogPost
const blogPostArbitrary = fc.record({
  id: fc.uuid(),
  slug: fc.string({ minLength: 5, maxLength: 50 }),
  title: fc.string({ minLength: 10, maxLength: 100 }),
  excerpt: fc.string({ minLength: 50, maxLength: 200 }),
  content: fc.string({ minLength: 100, maxLength: 2000 }),
  author: fc.record({
    name: fc.string({ minLength: 5, maxLength: 30 }),
    bio: fc.string({ minLength: 10, maxLength: 100 })
  }),
  publishedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2026-12-31') }).map(d => d.toISOString()),
  category: fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 5, maxLength: 30 }),
    slug: fc.string({ minLength: 5, maxLength: 30 }),
    description: fc.string({ minLength: 10, maxLength: 100 }),
    color: fc.constant('#3B82F6'),
    seo: fc.record({})
  }),
  tags: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
  seo: fc.record({
    metaTitle: fc.option(fc.string({ minLength: 50, maxLength: 70 })),
    metaDescription: fc.option(fc.string({ minLength: 150, maxLength: 160 })),
    keywords: fc.option(fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 5, maxLength: 10 })),
    canonical: fc.option(fc.string())
  }),
  readingTime: fc.integer({ min: 1, max: 30 }),
  isPublished: fc.boolean(),
  isFeatured: fc.boolean(),
  relatedCalculators: fc.option(fc.array(fc.string(), { minLength: 1, maxLength: 3 }))
}) as fc.Arbitrary<BlogPost>;

describe('Property Tests: Blog Search', () => {
  /**
   * Property 12: Search Coverage
   * Для любой опубликованной статьи и любого поискового запроса, совпадающего с её
   * заголовком, excerpt, контентом или тегами, статья должна появиться в результатах поиска
   * 
   * Validates: Requirements 3.1, 3.4
   * Feature: blog-development, Property 12: Search Coverage
   */
  test('Property 12: Articles matching query appear in results', () => {
    fc.assert(
      fc.property(
        fc.array(blogPostArbitrary, { minLength: 5, maxLength: 20 }),
        fc.string({ minLength: 3, maxLength: 20 }),
        (articles, queryWord) => {
          // Устанавливаем все статьи как опубликованные
          const publishedArticles = articles.map(a => ({ ...a, isPublished: true }));

          // Находим статьи, которые содержат queryWord в title, excerpt, content или tags
          const matchingArticles = publishedArticles.filter(article => {
            const titleMatch = article.title.toLowerCase().includes(queryWord.toLowerCase());
            const excerptMatch = article.excerpt.toLowerCase().includes(queryWord.toLowerCase());
            const contentMatch = article.content.toLowerCase().includes(queryWord.toLowerCase());
            const tagsMatch = article.tags.some(tag =>
              tag.toLowerCase().includes(queryWord.toLowerCase())
            );

            return titleMatch || excerptMatch || contentMatch || tagsMatch;
          });

          // Выполняем поиск
          const results = search(publishedArticles, queryWord);
          const resultIds = results.map(r => r.article.id);

          // Проверяем, что все совпадающие статьи присутствуют в результатах
          matchingArticles.forEach(article => {
            expect(resultIds).toContain(article.id);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13: Search Result Highlighting
   * Для любого результата поиска, совпадающие ключевые слова должны быть обернуты в <mark> теги
   * 
   * Validates: Requirements 3.3
   * Feature: blog-development, Property 13: Search Result Highlighting
   */
  test('Property 13: Matching keywords are highlighted in results', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 50, maxLength: 200 }),
        fc.string({ minLength: 3, maxLength: 15 }),
        (text, query) => {
          // Проверяем, что текст содержит запрос
          if (!text.toLowerCase().includes(query.toLowerCase())) {
            return; // Пропускаем, если нет совпадения
          }

          const highlighted = highlightMatches(text, query);

          // Проверяем, что результат содержит теги <mark>
          expect(highlighted).toContain('<mark>');
          expect(highlighted).toContain('</mark>');

          // Проверяем, что оригинальный текст присутствует (без тегов)
          const withoutTags = highlighted.replace(/<\/?mark>/g, '');
          expect(withoutTags.toLowerCase()).toContain(text.toLowerCase().substring(0, 20));
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 14: Search Relevance Sorting
   * Для любых результатов поиска, они должны быть отсортированы по релевантности в порядке убывания
   * 
   * Validates: Requirements 3.7
   * Feature: blog-development, Property 14: Search Relevance Sorting
   */
  test('Property 14: Search results are sorted by relevance score descending', () => {
    fc.assert(
      fc.property(
        fc.array(blogPostArbitrary, { minLength: 5, maxLength: 20 }),
        fc.string({ minLength: 3, maxLength: 20 }),
        (articles, query) => {
          // Устанавливаем все статьи как опубликованные
          const publishedArticles = articles.map(a => ({ ...a, isPublished: true }));

          // Выполняем поиск
          const results = search(publishedArticles, query);

          // Проверяем, что результаты отсортированы по убыванию relevanceScore
          for (let i = 0; i < results.length - 1; i++) {
            expect(results[i].relevanceScore).toBeGreaterThanOrEqual(results[i + 1].relevanceScore);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Дополнительный тест: проверка, что неопубликованные статьи не попадают в результаты
   */
  test('Unpublished articles are excluded from search results', () => {
    fc.assert(
      fc.property(
        fc.array(blogPostArbitrary, { minLength: 5, maxLength: 20 }),
        fc.string({ minLength: 3, maxLength: 20 }),
        (articles, query) => {
          // Помечаем некоторые статьи как неопубликованные
          const mixedArticles = articles.map((a, i) => ({
            ...a,
            isPublished: i % 2 === 0 // Каждая вторая статья опубликована
          }));

          // Выполняем поиск
          const results = search(mixedArticles, query);

          // Проверяем, что все результаты - опубликованные статьи
          results.forEach(result => {
            expect(result.article.isPublished).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Дополнительный тест: проверка токенизации
   */
  test('Tokenization removes stop words and short words', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 20, maxLength: 200 }),
        (text) => {
          const tokens = tokenize(text);

          // Проверяем, что все токены длиннее 2 символов
          tokens.forEach(token => {
            expect(token.length).toBeGreaterThan(2);
          });

          // Проверяем, что стоп-слова удалены
          const stopWords = ['и', 'в', 'на', 'с', 'по', 'для', 'не', 'от'];
          tokens.forEach(token => {
            expect(stopWords).not.toContain(token);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Дополнительный тест: проверка стемминга
   */
  test('Stemming reduces words to their root form', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 20 }),
        (word) => {
          const stemmed = stem(word.toLowerCase());

          // Проверяем, что стемминг не увеличивает длину слова
          expect(stemmed.length).toBeLessThanOrEqual(word.length);

          // Проверяем, что стемминг возвращает строку
          expect(typeof stemmed).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Дополнительный тест: проверка расчета релевантности
   */
  test('Relevance score is non-negative', () => {
    fc.assert(
      fc.property(
        blogPostArbitrary,
        fc.string({ minLength: 3, maxLength: 20 }),
        (article, query) => {
          const score = calculateRelevance(article, query);

          // Проверяем, что score неотрицательный
          expect(score).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Дополнительный тест: проверка фильтрации по категории
   */
  test('Search respects category filter', () => {
    fc.assert(
      fc.property(
        fc.array(blogPostArbitrary, { minLength: 5, maxLength: 20 }),
        fc.string({ minLength: 3, maxLength: 20 }),
        fc.uuid(),
        (articles, query, categoryId) => {
          // Устанавливаем все статьи как опубликованные
          const publishedArticles = articles.map(a => ({ ...a, isPublished: true }));

          // Выполняем поиск с фильтром по категории
          const results = search(publishedArticles, query, { categoryId });

          // Проверяем, что все результаты принадлежат указанной категории
          results.forEach(result => {
            expect(result.article.category.id).toBe(categoryId);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
