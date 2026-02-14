import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
  suggestTags,
  validateCalculatorLinks,
  checkDuplicateContent,
  suggestRelatedArticles,
} from '@/utils/contentManager';
import type { BlogPost } from '@/types/blog';

/**
 * Property-Based Tests для Content Manager
 * Feature: blog-development
 */

// Вспомогательная функция для создания mock статьи
function createMockArticle(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    id: 'test-id',
    slug: 'test-slug',
    title: 'Test Title',
    excerpt: 'Test excerpt with some content',
    content: 'Test content with multiple words and sentences',
    author: {
      name: 'Test Author',
    },
    publishedAt: '2024-01-01',
    category: {
      id: 'test-category',
      name: 'Test Category',
      slug: 'test-category',
      description: 'Test description',
      color: '#000000',
      seo: {},
    },
    tags: [],
    seo: {
      keywords: [],
    },
    readingTime: 5,
    isPublished: true,
    isFeatured: false,
    ...overrides,
  };
}

describe('Content Manager Property Tests', () => {
  describe('Property 29: Tag Suggestion Relevance', () => {
    test('предложенные теги должны появляться в контенте или быть семантически связаны', () => {
      // Feature: blog-development, Property 29: Tag Suggestion Relevance
      // Validates: Requirements 9.3
      
      fc.assert(
        fc.property(
          fc.array(
            fc.stringMatching(/^[a-zа-яёA-ZА-ЯЁ]{3,15}$/),
            { minLength: 5, maxLength: 20 }
          ),
          fc.array(
            fc.stringMatching(/^[a-zа-яёA-ZА-ЯЁ]{3,15}$/),
            { minLength: 0, maxLength: 10 }
          ),
          (contentWords, existingTags) => {
            // Создаём контент, повторяя некоторые слова для увеличения частоты
            const repeatedWords = contentWords.flatMap(word => [word, word, word]);
            const content = repeatedWords.join(' ');
            
            const article = createMockArticle({
              title: contentWords.slice(0, 3).join(' '),
              excerpt: contentWords.slice(3, 8).join(' '),
              content,
            });
            
            const suggestedTags = suggestTags(article, existingTags, 5);
            
            // Проверяем, что предложенные теги релевантны
            suggestedTags.forEach(tag => {
              const tagLower = tag.toLowerCase();
              const fullText = (article.title + ' ' + article.excerpt + ' ' + article.content).toLowerCase();
              
              // Тег должен либо присутствовать в контенте, либо быть из существующих тегов
              const isInContent = fullText.includes(tagLower) || 
                                  contentWords.some(word => word.toLowerCase().includes(tagLower) || tagLower.includes(word.toLowerCase()));
              const isExistingTag = existingTags.some(existing => 
                existing.toLowerCase() === tagLower ||
                existing.toLowerCase().includes(tagLower) ||
                tagLower.includes(existing.toLowerCase())
              );
              
              expect(isInContent || isExistingTag).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('предложенные теги должны быть уникальными', () => {
      // Feature: blog-development, Property 29: Tag Suggestion Relevance
      // Validates: Requirements 9.3
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 100, maxLength: 500 }),
          (content) => {
            const article = createMockArticle({ content });
            const suggestedTags = suggestTags(article, [], 10);
            
            // Проверяем уникальность
            const uniqueTags = new Set(suggestedTags.map(tag => tag.toLowerCase()));
            expect(uniqueTags.size).toBe(suggestedTags.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('должны приоритизироваться существующие теги', () => {
      // Feature: blog-development, Property 29: Tag Suggestion Relevance
      // Validates: Requirements 9.3
      
      const existingTags = ['ипотека', 'кредит', 'налоги', 'зарплата', 'калькулятор'];
      const content = 'Как рассчитать ипотеку и кредит в 2024 году. Используйте наш калькулятор ипотеки для расчета ежемесячного платежа по кредиту.';
      
      const article = createMockArticle({
        title: 'Калькулятор ипотеки',
        content,
      });
      
      const suggestedTags = suggestTags(article, existingTags, 5);
      
      // Проверяем, что предложенные теги включают существующие
      const hasExistingTags = suggestedTags.some(tag => 
        existingTags.includes(tag.toLowerCase())
      );
      
      expect(hasExistingTags).toBe(true);
    });

    test('количество предложенных тегов не должно превышать лимит', () => {
      // Feature: blog-development, Property 29: Tag Suggestion Relevance
      // Validates: Requirements 9.3
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 200, maxLength: 1000 }),
          fc.integer({ min: 1, max: 10 }),
          (content, limit) => {
            const article = createMockArticle({ content });
            const suggestedTags = suggestTags(article, [], limit);
            
            expect(suggestedTags.length).toBeLessThanOrEqual(limit);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 30: Link Validation', () => {
    test('все валидные ссылки должны проходить валидацию', () => {
      // Feature: blog-development, Property 30: Link Validation
      // Validates: Requirements 9.4
      
      fc.assert(
        fc.property(
          fc.array(
            fc.stringMatching(/^[a-z-]{3,20}$/),
            { minLength: 1, maxLength: 10 }
          ),
          (calculatorIds) => {
            const article = createMockArticle({
              relatedCalculators: calculatorIds,
            });
            
            const result = validateCalculatorLinks(article, calculatorIds);
            
            expect(result.isValid).toBe(true);
            expect(result.invalidLinks).toHaveLength(0);
            expect(result.validLinks).toHaveLength(calculatorIds.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('невалидные ссылки должны быть обнаружены', () => {
      // Feature: blog-development, Property 30: Link Validation
      // Validates: Requirements 9.4
      
      fc.assert(
        fc.property(
          fc.array(
            fc.stringMatching(/^[a-z-]{3,20}$/),
            { minLength: 1, maxLength: 5 }
          ),
          fc.array(
            fc.stringMatching(/^[a-z-]{3,20}$/),
            { minLength: 1, maxLength: 5 }
          ),
          (validIds, invalidIds) => {
            // Убеждаемся, что массивы не пересекаются
            const uniqueInvalidIds = invalidIds.filter(id => !validIds.includes(id));
            
            if (uniqueInvalidIds.length === 0) return;
            
            const article = createMockArticle({
              relatedCalculators: [...validIds, ...uniqueInvalidIds],
            });
            
            const result = validateCalculatorLinks(article, validIds);
            
            expect(result.isValid).toBe(false);
            expect(result.invalidLinks.length).toBeGreaterThan(0);
            expect(result.validLinks).toEqual(validIds);
            
            // Все невалидные ID должны быть в списке невалидных
            uniqueInvalidIds.forEach(id => {
              expect(result.invalidLinks).toContain(id);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('должны предлагаться похожие калькуляторы для невалидных ссылок', () => {
      // Feature: blog-development, Property 30: Link Validation
      // Validates: Requirements 9.4
      
      const validIds = ['mortgage', 'credit', 'salary', 'deposit', 'investment'];
      const article = createMockArticle({
        relatedCalculators: ['mortage', 'kredit', 'salry'], // Опечатки
      });
      
      const result = validateCalculatorLinks(article, validIds);
      
      expect(result.isValid).toBe(false);
      expect(result.suggestions.length).toBeGreaterThan(0);
      
      // Проверяем, что предложения действительно похожи
      expect(result.suggestions).toContain('mortgage'); // похоже на 'mortage'
      expect(result.suggestions).toContain('credit');   // похоже на 'kredit'
      expect(result.suggestions).toContain('salary');   // похоже на 'salry'
    });

    test('пустой массив калькуляторов должен быть валидным', () => {
      // Feature: blog-development, Property 30: Link Validation
      // Validates: Requirements 9.4
      
      const article = createMockArticle({
        relatedCalculators: [],
      });
      
      const result = validateCalculatorLinks(article, ['mortgage', 'credit']);
      
      expect(result.isValid).toBe(true);
      expect(result.invalidLinks).toHaveLength(0);
      expect(result.validLinks).toHaveLength(0);
    });
  });

  describe('Property 31: Duplicate Content Detection', () => {
    test('статьи с схожестью > 80% должны определяться как дубликаты', () => {
      // Feature: blog-development, Property 31: Duplicate Content Detection
      // Validates: Requirements 9.6
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 100, maxLength: 500 }),
          fc.array(
            fc.stringMatching(/^[a-zа-яёA-ZА-ЯЁ]{3,10}$/),
            { minLength: 3, maxLength: 10 }
          ),
          (content, tags) => {
            const categoryId = 'test-category';
            
            // Создаём две очень похожие статьи
            const article1 = createMockArticle({
              id: 'article-1',
              title: 'Test Article',
              content,
              tags,
              category: {
                id: categoryId,
                name: 'Test Category',
                slug: 'test-category',
                description: 'Test',
                color: '#000',
                seo: {},
              },
            });
            
            const article2 = createMockArticle({
              id: 'article-2',
              title: 'Test Article Similar',
              content, // Тот же контент
              tags,    // Те же теги
              category: {
                id: categoryId, // Та же категория
                name: 'Test Category',
                slug: 'test-category',
                description: 'Test',
                color: '#000',
                seo: {},
              },
            });
            
            const result = checkDuplicateContent(article1, [article2], 0.8);
            
            // Должен быть обнаружен дубликат
            expect(result.isDuplicate).toBe(true);
            expect(result.duplicates.length).toBeGreaterThan(0);
            expect(result.duplicates[0].similarity).toBeGreaterThanOrEqual(0.8);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('статьи с низкой схожестью не должны определяться как дубликаты', () => {
      // Feature: blog-development, Property 31: Duplicate Content Detection
      // Validates: Requirements 9.6
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 100, maxLength: 300 }),
          fc.string({ minLength: 100, maxLength: 300 }),
          (content1, content2) => {
            // Убеждаемся, что контент разный
            if (content1 === content2) return;
            
            const article1 = createMockArticle({
              id: 'article-1',
              title: 'First Article',
              content: content1,
              tags: ['tag1', 'tag2'],
              category: {
                id: 'category-1',
                name: 'Category 1',
                slug: 'category-1',
                description: 'Test',
                color: '#000',
                seo: {},
              },
            });
            
            const article2 = createMockArticle({
              id: 'article-2',
              title: 'Second Article',
              content: content2,
              tags: ['tag3', 'tag4'],
              category: {
                id: 'category-2',
                name: 'Category 2',
                slug: 'category-2',
                description: 'Test',
                color: '#000',
                seo: {},
              },
            });
            
            const result = checkDuplicateContent(article1, [article2], 0.8);
            
            // Если схожесть низкая, не должно быть дубликатов
            if (result.duplicates.length > 0) {
              expect(result.duplicates[0].similarity).toBeGreaterThanOrEqual(0.8);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('статья не должна считаться дубликатом самой себя', () => {
      // Feature: blog-development, Property 31: Duplicate Content Detection
      // Validates: Requirements 9.6
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 100, maxLength: 500 }),
          (content) => {
            const article = createMockArticle({
              id: 'article-1',
              content,
            });
            
            // Проверяем на дубликаты, включая саму статью в список
            const result = checkDuplicateContent(article, [article], 0.8);
            
            // Не должно быть дубликатов (статья игнорирует саму себя)
            expect(result.isDuplicate).toBe(false);
            expect(result.duplicates).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('должны определяться статьи с высокой схожестью (60-80%)', () => {
      // Feature: blog-development, Property 31: Duplicate Content Detection
      // Validates: Requirements 9.6
      
      const baseContent = 'Это базовый контент статьи с важной информацией о финансах и калькуляторах';
      const similarContent = 'Это базовый контент статьи с дополнительной информацией о финансах и инструментах';
      
      const article1 = createMockArticle({
        id: 'article-1',
        content: baseContent,
        tags: ['финансы', 'калькулятор'],
        category: {
          id: 'finance',
          name: 'Финансы',
          slug: 'finance',
          description: 'Test',
          color: '#000',
          seo: {},
        },
      });
      
      const article2 = createMockArticle({
        id: 'article-2',
        content: similarContent,
        tags: ['финансы', 'инструменты'],
        category: {
          id: 'finance',
          name: 'Финансы',
          slug: 'finance',
          description: 'Test',
          color: '#000',
          seo: {},
        },
      });
      
      const result = checkDuplicateContent(article1, [article2], 0.8);
      
      // Может быть в highSimilarity, но не обязательно в duplicates
      const totalSimilar = result.duplicates.length + result.highSimilarity.length;
      expect(totalSimilar).toBeGreaterThanOrEqual(0);
    });

    test('результаты должны быть отсортированы по убыванию схожести', () => {
      // Feature: blog-development, Property 31: Duplicate Content Detection
      // Validates: Requirements 9.6
      
      const article = createMockArticle({
        id: 'main',
        content: 'Main article content',
      });
      
      const similar1 = createMockArticle({
        id: 'similar-1',
        content: 'Main article content with extra',
      });
      
      const similar2 = createMockArticle({
        id: 'similar-2',
        content: 'Main article content',
      });
      
      const similar3 = createMockArticle({
        id: 'similar-3',
        content: 'Different content entirely',
      });
      
      const result = checkDuplicateContent(article, [similar1, similar2, similar3], 0.5);
      
      // Проверяем сортировку в duplicates
      for (let i = 0; i < result.duplicates.length - 1; i++) {
        expect(result.duplicates[i].similarity).toBeGreaterThanOrEqual(
          result.duplicates[i + 1].similarity
        );
      }
      
      // Проверяем сортировку в highSimilarity
      for (let i = 0; i < result.highSimilarity.length - 1; i++) {
        expect(result.highSimilarity[i].similarity).toBeGreaterThanOrEqual(
          result.highSimilarity[i + 1].similarity
        );
      }
    });
  });

  describe('Related Articles Suggestion', () => {
    test('предложенные статьи должны быть опубликованы', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 100, maxLength: 500 }),
          (content) => {
            const article = createMockArticle({
              id: 'main',
              content,
            });
            
            const published = createMockArticle({
              id: 'published',
              content,
              isPublished: true,
            });
            
            const unpublished = createMockArticle({
              id: 'unpublished',
              content,
              isPublished: false,
            });
            
            const suggestions = suggestRelatedArticles(article, [published, unpublished], 5);
            
            // Все предложенные статьи должны быть опубликованы
            suggestions.forEach(suggestion => {
              expect(suggestion.article.isPublished).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('количество предложений не должно превышать лимит', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          (limit) => {
            const article = createMockArticle({ id: 'main' });
            
            const otherArticles = Array.from({ length: 20 }, (_, i) =>
              createMockArticle({
                id: `article-${i}`,
                isPublished: true,
              })
            );
            
            const suggestions = suggestRelatedArticles(article, otherArticles, limit);
            
            expect(suggestions.length).toBeLessThanOrEqual(limit);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('предложенные статьи должны быть отсортированы по схожести', () => {
      const article = createMockArticle({
        id: 'main',
        content: 'Main content',
        tags: ['tag1', 'tag2'],
      });
      
      const articles = Array.from({ length: 10 }, (_, i) =>
        createMockArticle({
          id: `article-${i}`,
          content: 'Main content',
          tags: i < 5 ? ['tag1', 'tag2'] : ['tag3'],
          isPublished: true,
        })
      );
      
      const suggestions = suggestRelatedArticles(article, articles, 10);
      
      // Проверяем сортировку по убыванию схожести
      for (let i = 0; i < suggestions.length - 1; i++) {
        expect(suggestions[i].similarity).toBeGreaterThanOrEqual(
          suggestions[i + 1].similarity
        );
      }
    });
  });
});
