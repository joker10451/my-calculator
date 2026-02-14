import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
  generateMetaTitle,
  generateMetaDescription,
  calculateKeywordDensity,
  generateCanonicalURL,
  generateStructuredData,
} from '@/utils/seoOptimizer';
import type { BlogPost } from '@/types/blog';

/**
 * Property-Based Tests для SEO Optimizer
 * Feature: blog-development
 */

// Вспомогательная функция для создания mock статьи
function createMockArticle(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    id: 'test-id',
    slug: 'test-slug',
    title: 'Test Title',
    excerpt: 'Test excerpt',
    content: 'Test content',
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

describe('SEO Optimizer Property Tests', () => {
  describe('Property 4: Meta Title Length', () => {
    test('мета заголовок должен быть 50-70 символов для любой статьи', () => {
      // Feature: blog-development, Property 4: Meta Title Length
      // Validates: Requirements 2.1
      
      fc.assert(
        fc.property(
          fc.record({
            title: fc.string({ minLength: 10, maxLength: 200 }),
            excerpt: fc.string({ minLength: 50, maxLength: 300 }),
          }),
          (articleData) => {
            const article = createMockArticle(articleData);
            const metaTitle = generateMetaTitle(article);
            
            expect(metaTitle.length).toBeGreaterThanOrEqual(50);
            expect(metaTitle.length).toBeLessThanOrEqual(70);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5: Meta Description Length', () => {
    test('мета описание должно быть 150-160 символов для любой статьи', () => {
      // Feature: blog-development, Property 5: Meta Description Length
      // Validates: Requirements 2.2
      
      fc.assert(
        fc.property(
          fc.record({
            title: fc.string({ minLength: 10, maxLength: 100 }),
            excerpt: fc.string({ minLength: 50, maxLength: 500 }),
          }),
          (articleData) => {
            const article = createMockArticle(articleData);
            const metaDescription = generateMetaDescription(article);
            
            expect(metaDescription.length).toBeGreaterThanOrEqual(150);
            expect(metaDescription.length).toBeLessThanOrEqual(160);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7: Canonical URL Generation', () => {
    test('canonical URL должен иметь корректный формат для любого slug', () => {
      // Feature: blog-development, Property 7: Canonical URL Generation
      // Validates: Requirements 2.4
      
      fc.assert(
        fc.property(
          // Генерируем валидный slug: должен содержать хотя бы одну букву или цифру
          fc.stringMatching(/^[a-z0-9-]+$/).filter(s => /[a-z0-9]/.test(s)),
          (slug) => {
            const canonicalURL = generateCanonicalURL(slug);
            
            // Проверяем формат URL
            expect(canonicalURL).toMatch(/^https:\/\/xn--80aqu\.ru\/blog\/[a-z0-9-]+$/);
            
            // Проверяем, что slug присутствует в URL
            expect(canonicalURL).toContain(slug);
            
            // Проверяем, что нет двойных слешей
            expect(canonicalURL).not.toContain('//blog');
            
            // Проверяем, что нет trailing slash
            expect(canonicalURL).not.toMatch(/\/$/);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('canonical URL должен выбрасывать ошибку для невалидного slug', () => {
      // Feature: blog-development, Property 7: Canonical URL Generation
      // Validates: Requirements 2.4
      
      fc.assert(
        fc.property(
          fc.string().filter(s => !/^[a-z0-9-]+$/.test(s) && s.length > 0),
          (invalidSlug) => {
            expect(() => generateCanonicalURL(invalidSlug)).toThrow('Invalid slug format');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10: Keyword Density', () => {
    test('плотность ключевых слов должна корректно рассчитываться для любого контента', () => {
      // Feature: blog-development, Property 10: Keyword Density
      // Validates: Requirements 2.7
      
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 3, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
          fc.integer({ min: 10, max: 100 }),
          (keywords, repeatCount) => {
            // Создаём контент с известной плотностью ключевых слов
            const keywordText = keywords.join(' ');
            const fillerText = 'другие слова для заполнения контента ';
            const content = keywordText.repeat(repeatCount) + ' ' + fillerText.repeat(repeatCount * 10);
            
            const density = calculateKeywordDensity(content, keywords);
            
            // Плотность должна быть неотрицательной
            expect(density).toBeGreaterThanOrEqual(0);
            
            // Плотность не может быть больше 100%
            expect(density).toBeLessThanOrEqual(100);
            
            // Плотность должна быть числом
            expect(typeof density).toBe('number');
            expect(Number.isFinite(density)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('плотность ключевых слов должна быть 0 для пустого массива ключевых слов', () => {
      // Feature: blog-development, Property 10: Keyword Density
      // Validates: Requirements 2.7
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 100, maxLength: 1000 }),
          (content) => {
            const density = calculateKeywordDensity(content, []);
            expect(density).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('плотность ключевых слов должна увеличиваться при увеличении количества вхождений', () => {
      // Feature: blog-development, Property 10: Keyword Density
      // Validates: Requirements 2.7
      
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-z]{3,10}$/), // Только латиница для корректной работы \b
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 11, max: 20 }),
          (keyword, lowCount, highCount) => {
            const fillerText = 'other words for filling content ';
            // Добавляем пробелы между повторениями ключевого слова
            const keywordLow = Array(lowCount).fill(keyword).join(' ');
            const keywordHigh = Array(highCount).fill(keyword).join(' ');
            const contentLow = keywordLow + ' ' + fillerText.repeat(100);
            const contentHigh = keywordHigh + ' ' + fillerText.repeat(100);
            
            const densityLow = calculateKeywordDensity(contentLow, [keyword]);
            const densityHigh = calculateKeywordDensity(contentHigh, [keyword]);
            
            // При большем количестве вхождений плотность должна быть выше
            expect(densityHigh).toBeGreaterThan(densityLow);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Structured Data Generation', () => {
    test('structured data должна содержать обязательные поля для любой статьи', () => {
      // Feature: blog-development, Property 8: Structured Data Presence
      // Validates: Requirements 2.5
      
      fc.assert(
        fc.property(
          fc.record({
            title: fc.string({ minLength: 10, maxLength: 100 }),
            excerpt: fc.string({ minLength: 50, maxLength: 300 }),
            // Генерируем валидный slug: должен содержать хотя бы одну букву или цифру
            slug: fc.stringMatching(/^[a-z0-9-]+$/).filter(s => /[a-z0-9]/.test(s)),
            author: fc.record({
              name: fc.string({ minLength: 3, maxLength: 50 }),
            }),
            publishedAt: fc.integer({ min: 2020, max: 2030 }).map(year => `${year}-06-15T12:00:00.000Z`),
          }),
          (articleData) => {
            const article = createMockArticle(articleData);
            const structuredData = generateStructuredData(article);
            
            // Проверяем обязательные поля
            expect(structuredData['@context']).toBe('https://schema.org');
            expect(structuredData['@type']).toBe('Article');
            expect(structuredData['headline']).toBe(article.title);
            expect(structuredData['description']).toBe(article.excerpt);
            expect(structuredData['datePublished']).toBe(article.publishedAt);
            
            // Проверяем автора
            expect(structuredData['author']).toBeDefined();
            expect((structuredData['author'] as any)['@type']).toBe('Person');
            expect((structuredData['author'] as any)['name']).toBe(article.author.name);
            
            // Проверяем publisher
            expect(structuredData['publisher']).toBeDefined();
            expect((structuredData['publisher'] as any)['@type']).toBe('Organization');
            expect((structuredData['publisher'] as any)['name']).toBe('Считай.RU');
            
            // Проверяем mainEntityOfPage
            expect(structuredData['mainEntityOfPage']).toBeDefined();
            expect((structuredData['mainEntityOfPage'] as any)['@type']).toBe('WebPage');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('structured data должна включать изображение, если оно есть', () => {
      // Feature: blog-development, Property 8: Structured Data Presence
      // Validates: Requirements 2.5
      
      fc.assert(
        fc.property(
          fc.record({
            featuredImage: fc.record({
              url: fc.webUrl(),
              alt: fc.string({ minLength: 5, maxLength: 100 }),
              width: fc.integer({ min: 100, max: 2000 }),
              height: fc.integer({ min: 100, max: 2000 }),
            }),
          }),
          (articleData) => {
            const article = createMockArticle(articleData);
            const structuredData = generateStructuredData(article);
            
            // Проверяем наличие изображения
            expect(structuredData['image']).toBeDefined();
            expect((structuredData['image'] as any)['@type']).toBe('ImageObject');
            expect((structuredData['image'] as any)['url']).toBe(article.featuredImage!.url);
            expect((structuredData['image'] as any)['width']).toBe(article.featuredImage!.width);
            expect((structuredData['image'] as any)['height']).toBe(article.featuredImage!.height);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
