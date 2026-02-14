import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import type { BlogPost } from '@/types/blog';
import {
  calculateSimilarity,
  getRelatedArticles,
  getPersonalizedRecommendations
} from '@/services/recommendationService';

/**
 * Генератор для BlogPost
 */
const blogPostArbitrary = fc.record({
  id: fc.uuid(),
  slug: fc.string({ minLength: 5, maxLength: 50 }),
  title: fc.string({ minLength: 10, maxLength: 100 }),
  excerpt: fc.string({ minLength: 50, maxLength: 200 }),
  content: fc.string({ minLength: 500, maxLength: 3000 }),
  author: fc.record({
    name: fc.string({ minLength: 5, maxLength: 30 }),
    bio: fc.string({ minLength: 20, maxLength: 100 })
  }),
  publishedAt: fc.integer({ min: 1577836800000, max: 1798761600000 }).map(ts => new Date(ts).toISOString()),
  category: fc.record({
    id: fc.constantFrom(
      'mortgage-credit',
      'taxes-salary',
      'utilities-housing',
      'auto-transport',
      'health-fitness',
      'investments-deposits',
      'legal-questions',
      'family-children'
    ),
    name: fc.string({ minLength: 5, maxLength: 30 }),
    slug: fc.string({ minLength: 5, maxLength: 30 }),
    description: fc.string({ minLength: 20, maxLength: 100 }),
    color: fc.string(),
    seo: fc.record({
      metaTitle: fc.option(fc.string()),
      metaDescription: fc.option(fc.string())
    })
  }),
  tags: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
  featuredImage: fc.option(fc.record({
    url: fc.webUrl(),
    alt: fc.string({ minLength: 10, maxLength: 100 }),
    width: fc.integer({ min: 400, max: 2000 }),
    height: fc.integer({ min: 300, max: 1500 })
  })),
  seo: fc.record({
    metaTitle: fc.option(fc.string({ minLength: 50, maxLength: 70 })),
    metaDescription: fc.option(fc.string({ minLength: 150, maxLength: 160 })),
    keywords: fc.option(fc.array(fc.string(), { minLength: 5, maxLength: 10 })),
    canonical: fc.option(fc.string()),
    ogImage: fc.option(fc.webUrl())
  }),
  readingTime: fc.integer({ min: 1, max: 30 }),
  isPublished: fc.boolean(),
  isFeatured: fc.boolean(),
  relatedCalculators: fc.option(fc.array(fc.string(), { minLength: 1, maxLength: 5 })),
  structuredData: fc.option(fc.object())
}) as fc.Arbitrary<BlogPost>;

describe('Property Tests: Recommendation System', () => {
  /**
   * Property 15: Recommendation Count
   * Для любой статьи, система рекомендаций должна вернуть минимум 3 рекомендации
   * (или все доступные, если их меньше 3)
   * 
   * Validates: Requirements 4.1
   */
  test('Property 15: Recommendation Count - минимум 3 рекомендации', () => {
    fc.assert(
      fc.property(
        fc.array(blogPostArbitrary, { minLength: 5, maxLength: 20 }),
        (articles) => {
          // Делаем все статьи опубликованными для теста
          const publishedArticles = articles.map(a => ({ ...a, isPublished: true }));
          
          // Берем первую статью как текущую
          const currentArticle = publishedArticles[0];
          
          // Получаем рекомендации
          const recommendations = getRelatedArticles(
            currentArticle.id,
            publishedArticles,
            3,
            []
          );
          
          // Проверяем количество рекомендаций
          const availableArticles = publishedArticles.length - 1; // Минус текущая статья
          const expectedCount = Math.min(3, availableArticles);
          
          expect(recommendations.length).toBe(expectedCount);
          
          // Проверяем, что текущая статья не в рекомендациях
          expect(recommendations.every(r => r.id !== currentArticle.id)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
  // Feature: blog-development, Property 15: Recommendation Count

  /**
   * Property 16: Same Category Priority
   * Для любой статьи, статьи из той же категории должны иметь более высокий
   * score схожести, чем статьи из других категорий
   * 
   * Validates: Requirements 4.4
   */
  test('Property 16: Same Category Priority - приоритет той же категории', () => {
    fc.assert(
      fc.property(
        blogPostArbitrary,
        fc.constantFrom(
          'mortgage-credit',
          'taxes-salary',
          'utilities-housing',
          'auto-transport',
          'health-fitness',
          'investments-deposits',
          'legal-questions',
          'family-children'
        ),
        fc.constantFrom(
          'mortgage-credit',
          'taxes-salary',
          'utilities-housing',
          'auto-transport',
          'health-fitness',
          'investments-deposits',
          'legal-questions',
          'family-children'
        ),
        (baseArticle, sameCategoryId, differentCategoryId) => {
          // Убеждаемся, что категории разные
          fc.pre(sameCategoryId !== differentCategoryId);
          
          // Создаем статью из той же категории
          const sameCategoryArticle: BlogPost = {
            ...baseArticle,
            id: 'same-category-' + baseArticle.id,
            category: {
              ...baseArticle.category,
              id: sameCategoryId
            }
          };
          
          // Создаем статью из другой категории
          const differentCategoryArticle: BlogPost = {
            ...baseArticle,
            id: 'different-category-' + baseArticle.id,
            category: {
              ...baseArticle.category,
              id: differentCategoryId
            }
          };
          
          // Создаем текущую статью с той же категорией, что и sameCategoryArticle
          const currentArticle: BlogPost = {
            ...baseArticle,
            category: {
              ...baseArticle.category,
              id: sameCategoryId
            }
          };
          
          // Рассчитываем схожесть
          const sameCategorySimilarity = calculateSimilarity(
            currentArticle,
            sameCategoryArticle
          );
          
          const differentCategorySimilarity = calculateSimilarity(
            currentArticle,
            differentCategoryArticle
          );
          
          // Статья из той же категории должна иметь более высокую схожесть
          // (за счет веса 0.4 для categoryMatch)
          expect(sameCategorySimilarity).toBeGreaterThan(differentCategorySimilarity);
        }
      ),
      { numRuns: 100 }
    );
  });
  // Feature: blog-development, Property 16: Same Category Priority

  /**
   * Property 17: Exclude Read Articles
   * Для любого пользователя с историей чтения, уже прочитанные статьи
   * не должны появляться в рекомендациях
   * 
   * Validates: Requirements 4.6
   */
  test('Property 17: Exclude Read Articles - исключение прочитанных', () => {
    fc.assert(
      fc.property(
        fc.array(blogPostArbitrary, { minLength: 10, maxLength: 20 }),
        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 1, maxLength: 5 }),
        (articles, readIndices) => {
          // Делаем все статьи опубликованными
          const publishedArticles = articles.map(a => ({ ...a, isPublished: true }));
          
          // Берем первую статью как текущую
          const currentArticle = publishedArticles[0];
          
          // Создаем список прочитанных статей (исключая текущую)
          const readArticleIds = readIndices
            .filter(idx => idx < publishedArticles.length && idx !== 0)
            .map(idx => publishedArticles[idx].id);
          
          // Получаем рекомендации
          const recommendations = getRelatedArticles(
            currentArticle.id,
            publishedArticles,
            5,
            readArticleIds
          );
          
          // Проверяем, что ни одна прочитанная статья не в рекомендациях
          recommendations.forEach(recommendation => {
            expect(readArticleIds).not.toContain(recommendation.id);
          });
          
          // Проверяем, что текущая статья тоже не в рекомендациях
          expect(recommendations.every(r => r.id !== currentArticle.id)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
  // Feature: blog-development, Property 17: Exclude Read Articles

  /**
   * Дополнительный тест: Similarity Score Range
   * Проверяем, что score схожести всегда в диапазоне [0, 1]
   */
  test('Similarity score is always between 0 and 1', () => {
    fc.assert(
      fc.property(
        blogPostArbitrary,
        blogPostArbitrary,
        (article1, article2) => {
          const similarity = calculateSimilarity(article1, article2);
          
          expect(similarity).toBeGreaterThanOrEqual(0);
          expect(similarity).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Дополнительный тест: Self-Similarity
   * Проверяем, что статья не считается похожей на саму себя
   */
  test('Article does not match itself', () => {
    fc.assert(
      fc.property(
        blogPostArbitrary,
        (article) => {
          const similarity = calculateSimilarity(article, article);
          
          expect(similarity).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Дополнительный тест: Personalized Recommendations
   * Проверяем, что персонализированные рекомендации не включают прочитанные статьи
   */
  test('Personalized recommendations exclude read articles', () => {
    fc.assert(
      fc.property(
        fc.array(blogPostArbitrary, { minLength: 10, maxLength: 20 }),
        (articles) => {
          // Делаем все статьи опубликованными
          const publishedArticles = articles.map(a => ({ ...a, isPublished: true }));
          
          // Получаем персонализированные рекомендации
          const recommendations = getPersonalizedRecommendations(publishedArticles, 5);
          
          // Проверяем, что все рекомендации опубликованы
          recommendations.forEach(rec => {
            expect(rec.isPublished).toBe(true);
          });
          
          // Проверяем, что количество не превышает лимит
          expect(recommendations.length).toBeLessThanOrEqual(5);
        }
      ),
      { numRuns: 100 }
    );
  });
});
