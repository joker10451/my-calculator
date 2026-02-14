import { describe, test, expect } from 'vitest';
import { blogPosts } from '@/data/blogPosts';

/**
 * Property-Based Tests для контента блога
 * 
 * Feature: blog-development
 * 
 * Property 2: Calculator Linking - каждая статья имеет связанные калькуляторы
 * Property 6: Keyword Validation - минимум 5 ключевых слов
 * Property 8: Structured Data Presence - валидная Article schema
 * 
 * Validates: Requirements 1.4, 2.3, 2.5
 */

describe('Property Tests: Blog Content', () => {
  /**
   * Property 2: Calculator Linking
   * For any published article, it must have at least one related calculator
   * Validates: Requirements 1.4
   */
  test('Property 2: Every published article has related calculators', () => {
    const publishedArticles = blogPosts.filter(post => post.isPublished);
    
    publishedArticles.forEach(article => {
      expect(
        article.relatedCalculators,
        `Article "${article.title}" (${article.slug}) must have relatedCalculators array`
      ).toBeDefined();
      
      expect(
        article.relatedCalculators!.length,
        `Article "${article.title}" (${article.slug}) must have at least one related calculator`
      ).toBeGreaterThan(0);
      
      // Проверяем что это не пустые строки
      article.relatedCalculators!.forEach(calcId => {
        expect(
          calcId.trim().length,
          `Calculator ID in article "${article.title}" must not be empty`
        ).toBeGreaterThan(0);
      });
    });
    
    // Feature: blog-development, Property 2: Calculator Linking
  });

  /**
   * Property 6: Keyword Validation
   * For any published article, it must have at least 5 keywords in SEO metadata
   * Validates: Requirements 2.3
   */
  test('Property 6: Every article has minimum 5 keywords', () => {
    const publishedArticles = blogPosts.filter(post => post.isPublished);
    
    publishedArticles.forEach(article => {
      // Проверяем наличие keywords в SEO
      expect(
        article.seo.keywords,
        `Article "${article.title}" (${article.slug}) must have keywords in SEO`
      ).toBeDefined();
      
      // Проверяем что keywords это массив
      expect(
        Array.isArray(article.seo.keywords),
        `Keywords in article "${article.title}" must be an array`
      ).toBe(true);
      
      // Проверяем минимальное количество
      expect(
        article.seo.keywords!.length,
        `Article "${article.title}" (${article.slug}) must have at least 5 keywords, but has ${article.seo.keywords!.length}`
      ).toBeGreaterThanOrEqual(5);
      
      // Проверяем что keywords не пустые
      article.seo.keywords!.forEach((keyword, index) => {
        expect(
          keyword.trim().length,
          `Keyword ${index + 1} in article "${article.title}" must not be empty`
        ).toBeGreaterThan(0);
      });
    });
    
    // Feature: blog-development, Property 6: Keyword Validation
  });

  /**
   * Property 8: Structured Data Presence
   * For any published article, it must have valid Article schema structured data
   * Validates: Requirements 2.5
   */
  test('Property 8: Every article has valid Article schema structured data', () => {
    const publishedArticles = blogPosts.filter(post => post.isPublished);
    
    publishedArticles.forEach(article => {
      // Проверяем наличие structured data
      expect(
        article.structuredData,
        `Article "${article.title}" (${article.slug}) must have structuredData`
      ).toBeDefined();
      
      const sd = article.structuredData!;
      
      // Проверяем обязательные поля Article schema
      expect(
        sd['@context'],
        `Article "${article.title}" must have @context in structured data`
      ).toBe('https://schema.org');
      
      expect(
        sd['@type'],
        `Article "${article.title}" must have @type = "Article" in structured data`
      ).toBe('Article');
      
      expect(
        sd['headline'],
        `Article "${article.title}" must have headline in structured data`
      ).toBeDefined();
      
      expect(
        typeof sd['headline'],
        `Headline in article "${article.title}" must be a string`
      ).toBe('string');
      
      expect(
        (sd['headline'] as string).length,
        `Headline in article "${article.title}" must not be empty`
      ).toBeGreaterThan(0);
      
      // Проверяем author
      expect(
        sd['author'],
        `Article "${article.title}" must have author in structured data`
      ).toBeDefined();
      
      const author = sd['author'] as any;
      expect(
        author['@type'],
        `Author in article "${article.title}" must have @type = "Person"`
      ).toBe('Person');
      
      expect(
        author['name'],
        `Author in article "${article.title}" must have name`
      ).toBeDefined();
      
      // Проверяем datePublished
      expect(
        sd['datePublished'],
        `Article "${article.title}" must have datePublished in structured data`
      ).toBeDefined();
      
      expect(
        typeof sd['datePublished'],
        `datePublished in article "${article.title}" must be a string`
      ).toBe('string');
      
      // Проверяем что это валидная дата ISO 8601
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      expect(
        dateRegex.test(sd['datePublished'] as string),
        `datePublished in article "${article.title}" must be valid ISO 8601 date`
      ).toBe(true);
      
      // Проверяем publisher
      expect(
        sd['publisher'],
        `Article "${article.title}" must have publisher in structured data`
      ).toBeDefined();
      
      const publisher = sd['publisher'] as any;
      expect(
        publisher['@type'],
        `Publisher in article "${article.title}" must have @type = "Organization"`
      ).toBe('Organization');
      
      expect(
        publisher['name'],
        `Publisher in article "${article.title}" must have name`
      ).toBeDefined();
    });
    
    // Feature: blog-development, Property 8: Structured Data Presence
  });

  /**
   * Дополнительный тест: проверка что все статьи уникальны
   */
  test('All articles have unique IDs and slugs', () => {
    const ids = new Set<string>();
    const slugs = new Set<string>();
    
    blogPosts.forEach(article => {
      expect(
        ids.has(article.id),
        `Duplicate article ID found: ${article.id} in article "${article.title}"`
      ).toBe(false);
      
      expect(
        slugs.has(article.slug),
        `Duplicate article slug found: ${article.slug} in article "${article.title}"`
      ).toBe(false);
      
      ids.add(article.id);
      slugs.add(article.slug);
    });
  });

  /**
   * Дополнительный тест: проверка базовых полей
   */
  test('All articles have required basic fields', () => {
    blogPosts.forEach(article => {
      // ID
      expect(article.id).toBeDefined();
      expect(article.id.trim().length).toBeGreaterThan(0);
      
      // Slug
      expect(article.slug).toBeDefined();
      expect(article.slug.trim().length).toBeGreaterThan(0);
      expect(article.slug).toMatch(/^[a-z0-9-]+$/); // только lowercase, цифры и дефисы
      
      // Title
      expect(article.title).toBeDefined();
      expect(article.title.trim().length).toBeGreaterThan(0);
      
      // Excerpt
      expect(article.excerpt).toBeDefined();
      expect(article.excerpt.trim().length).toBeGreaterThan(0);
      
      // Content
      expect(article.content).toBeDefined();
      expect(article.content.trim().length).toBeGreaterThan(0);
      
      // Author
      expect(article.author).toBeDefined();
      expect(article.author.name).toBeDefined();
      expect(article.author.name.trim().length).toBeGreaterThan(0);
      
      // Published date
      expect(article.publishedAt).toBeDefined();
      expect(article.publishedAt.trim().length).toBeGreaterThan(0);
      
      // Category
      expect(article.category).toBeDefined();
      expect(article.category.id).toBeDefined();
      expect(article.category.name).toBeDefined();
      
      // Tags
      expect(article.tags).toBeDefined();
      expect(Array.isArray(article.tags)).toBe(true);
      expect(article.tags.length).toBeGreaterThan(0);
      
      // SEO
      expect(article.seo).toBeDefined();
      
      // Reading time
      expect(article.readingTime).toBeDefined();
      expect(article.readingTime).toBeGreaterThan(0);
      
      // Published status
      expect(typeof article.isPublished).toBe('boolean');
      expect(typeof article.isFeatured).toBe('boolean');
    });
  });
});
