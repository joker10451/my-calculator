import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
  countWords,
  calculateQualityScore,
  generateSlug,
  calculateReadingTime,
  validateH1Tag,
  validateArticle,
} from '@/utils/contentValidator';
import type { BlogPost } from '@/types/blog';

/**
 * Property-Based Tests для Content Validator
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

// Генератор контента с заданным количеством слов
function generateContentWithWords(wordCount: number): string {
  const words = ['слово', 'текст', 'контент', 'статья', 'информация', 'данные', 'система', 'процесс'];
  const result: string[] = [];
  
  for (let i = 0; i < wordCount; i++) {
    result.push(words[i % words.length]);
  }
  
  return result.join(' ');
}

describe('Content Validator Property Tests', () => {
  describe('Property 1: Content Validation', () => {
    test('статьи с контентом < 2000 слов должны отклоняться', () => {
      // Feature: blog-development, Property 1: Content Validation
      // Validates: Requirements 1.3
      
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1999 }),
          (wordCount) => {
            const content = generateContentWithWords(wordCount);
            const article = createMockArticle({ content });
            
            const result = validateArticle(article);
            
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual(
              expect.objectContaining({
                code: 'INSUFFICIENT_WORD_COUNT',
              })
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    test('статьи с контентом >= 2000 слов не должны отклоняться по длине', () => {
      // Feature: blog-development, Property 1: Content Validation
      // Validates: Requirements 1.3
      
      fc.assert(
        fc.property(
          fc.integer({ min: 2000, max: 5000 }),
          (wordCount) => {
            const content = generateContentWithWords(wordCount);
            const article = createMockArticle({
              content,
              relatedCalculators: ['calc-1'],
              featuredImage: {
                url: 'test.jpg',
                alt: 'test',
                width: 800,
                height: 600,
              },
              tags: ['tag1', 'tag2', 'tag3'],
              seo: {
                metaTitle: 'Test Title',
                metaDescription: 'Test Description',
                keywords: ['key1', 'key2', 'key3', 'key4', 'key5'],
              },
              structuredData: { '@type': 'Article' },
            });
            
            const result = validateArticle(article);
            
            // Не должно быть ошибки INSUFFICIENT_WORD_COUNT
            const hasWordCountError = result.errors.some(
              error => error.code === 'INSUFFICIENT_WORD_COUNT'
            );
            expect(hasWordCountError).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3: Quality Score Threshold', () => {
    test('статьи с качеством < 80 должны отклоняться', () => {
      // Feature: blog-development, Property 3: Quality Score Threshold
      // Validates: Requirements 1.5
      
      fc.assert(
        fc.property(
          fc.integer({ min: 500, max: 1500 }),
          (wordCount) => {
            const content = generateContentWithWords(wordCount);
            // Создаём статью с низким качеством (без тегов, без изображения, без калькуляторов)
            const article = createMockArticle({
              content,
              tags: [],
              featuredImage: undefined,
              relatedCalculators: [],
              seo: {},
              structuredData: undefined,
            });
            
            const qualityScore = calculateQualityScore(article);
            
            if (qualityScore < 80) {
              const result = validateArticle(article);
              expect(result.isValid).toBe(false);
              expect(result.errors).toContainEqual(
                expect.objectContaining({
                  code: 'LOW_QUALITY_SCORE',
                })
              );
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('статьи с качеством >= 80 не должны отклоняться по качеству', () => {
      // Feature: blog-development, Property 3: Quality Score Threshold
      // Validates: Requirements 1.5
      
      fc.assert(
        fc.property(
          fc.integer({ min: 2000, max: 5000 }),
          (wordCount) => {
            const content = generateContentWithWords(wordCount);
            // Создаём статью с высоким качеством
            const article = createMockArticle({
              content,
              tags: ['tag1', 'tag2', 'tag3'],
              featuredImage: {
                url: 'test.jpg',
                alt: 'test',
                width: 800,
                height: 600,
              },
              relatedCalculators: ['calc-1'],
              seo: {
                metaTitle: 'Test Title',
                metaDescription: 'Test Description',
                keywords: ['key1', 'key2', 'key3', 'key4', 'key5'],
              },
              structuredData: { '@type': 'Article' },
              excerpt: 'This is a long excerpt that is more than 100 characters to meet the quality requirements for the article.',
            });
            
            const qualityScore = calculateQualityScore(article);
            expect(qualityScore).toBeGreaterThanOrEqual(80);
            
            const result = validateArticle(article);
            
            // Не должно быть ошибки LOW_QUALITY_SCORE
            const hasQualityError = result.errors.some(
              error => error.code === 'LOW_QUALITY_SCORE'
            );
            expect(hasQualityError).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9: H1 Tag Validation', () => {
    test('контент с одним H1, содержащим ключевое слово, должен проходить валидацию', () => {
      // Feature: blog-development, Property 9: H1 Tag Validation
      // Validates: Requirements 2.6
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-zа-яё]+$/i.test(s)),
          fc.string({ minLength: 100, maxLength: 500 }),
          (keyword, bodyContent) => {
            // Markdown формат
            const markdownContent = `# ${keyword} заголовок\n\n${bodyContent}`;
            expect(validateH1Tag(markdownContent, keyword)).toBe(true);
            
            // HTML формат
            const htmlContent = `<h1>${keyword} заголовок</h1><p>${bodyContent}</p>`;
            expect(validateH1Tag(htmlContent, keyword)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('контент без H1 или с несколькими H1 должен не проходить валидацию', () => {
      // Feature: blog-development, Property 9: H1 Tag Validation
      // Validates: Requirements 2.6
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 3, maxLength: 20 }),
          fc.string({ minLength: 100, maxLength: 500 }),
          (keyword, bodyContent) => {
            // Контент без H1
            const noH1Content = `<p>${bodyContent}</p>`;
            expect(validateH1Tag(noH1Content, keyword)).toBe(false);
            
            // Контент с двумя H1
            const twoH1Content = `<h1>${keyword}</h1><h1>Another heading</h1><p>${bodyContent}</p>`;
            expect(validateH1Tag(twoH1Content, keyword)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('H1 без ключевого слова должен не проходить валидацию', () => {
      // Feature: blog-development, Property 9: H1 Tag Validation
      // Validates: Requirements 2.6
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 3, maxLength: 20 }),
          fc.string({ minLength: 10, maxLength: 50 }).filter(s => s.length > 0),
          (keyword, heading) => {
            // Убеждаемся, что heading не содержит keyword
            if (heading.toLowerCase().includes(keyword.toLowerCase())) {
              return; // Пропускаем этот случай
            }
            
            const content = `<h1>${heading}</h1><p>Some content</p>`;
            expect(validateH1Tag(content, keyword)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 20: Reading Time Calculation', () => {
    test('время чтения должно рассчитываться как wordCount / 200 (округлено вверх)', () => {
      // Feature: blog-development, Property 20: Reading Time Calculation
      // Validates: Requirements 5.5
      
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10000 }),
          (wordCount) => {
            const readingTime = calculateReadingTime(wordCount);
            const expectedTime = Math.ceil(wordCount / 200);
            
            expect(readingTime).toBe(expectedTime);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('время чтения для 0 слов должно быть 0', () => {
      // Feature: blog-development, Property 20: Reading Time Calculation
      // Validates: Requirements 5.5
      
      expect(calculateReadingTime(0)).toBe(0);
    });

    test('время чтения должно увеличиваться с увеличением количества слов', () => {
      // Feature: blog-development, Property 20: Reading Time Calculation
      // Validates: Requirements 5.5
      
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5000 }),
          fc.integer({ min: 1, max: 5000 }),
          (wordCount1, wordCount2) => {
            if (wordCount1 === wordCount2) return;
            
            const time1 = calculateReadingTime(wordCount1);
            const time2 = calculateReadingTime(wordCount2);
            
            if (wordCount1 < wordCount2) {
              expect(time1).toBeLessThanOrEqual(time2);
            } else {
              expect(time1).toBeGreaterThanOrEqual(time2);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 28: Slug Generation', () => {
    test('сгенерированный slug должен быть lowercase, с дефисами и alphanumeric', () => {
      // Feature: blog-development, Property 28: Slug Generation
      // Validates: Requirements 9.2
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 100 }),
          (title) => {
            const slug = generateSlug(title);
            
            // Проверяем формат: только lowercase буквы, цифры и дефисы
            expect(slug).toMatch(/^[a-z0-9-]*$/);
            
            // Не должно быть дефисов в начале или конце
            if (slug.length > 0) {
              expect(slug).not.toMatch(/^-/);
              expect(slug).not.toMatch(/-$/);
            }
            
            // Не должно быть множественных дефисов подряд
            expect(slug).not.toMatch(/--+/);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('slug должен транслитерировать русские буквы', () => {
      // Feature: blog-development, Property 28: Slug Generation
      // Validates: Requirements 9.2
      
      const testCases = [
        { input: 'Привет Мир', expected: 'privet-mir' },
        { input: 'Калькулятор НДФЛ', expected: 'kalkulyator-ndfl' },
        { input: 'Как рассчитать ипотеку?', expected: 'kak-rasschitat-ipoteku' },
        { input: 'ОСАГО 2024', expected: 'osago-2024' },
      ];
      
      testCases.forEach(({ input, expected }) => {
        const slug = generateSlug(input);
        expect(slug).toBe(expected);
      });
    });

    test('slug должен удалять специальные символы', () => {
      // Feature: blog-development, Property 28: Slug Generation
      // Validates: Requirements 9.2
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }),
          (title) => {
            const slug = generateSlug(title);
            
            // Не должно быть специальных символов
            expect(slug).not.toMatch(/[^a-z0-9-]/);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Word Count', () => {
    test('подсчёт слов должен корректно работать для любого текста', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 500 }),
          (content) => {
            const count = countWords(content);
            
            // Количество слов должно быть неотрицательным
            expect(count).toBeGreaterThanOrEqual(0);
            
            // Количество слов должно быть числом
            expect(typeof count).toBe('number');
            expect(Number.isFinite(count)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('подсчёт слов должен игнорировать HTML теги', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.stringMatching(/^[a-zA-Zа-яА-ЯёЁ]+$/),
            { minLength: 1, maxLength: 50 }
          ),
          (words) => {
            const plainContent = words.join(' ');
            const htmlContent = `<p>${words.join('</p><p>')}</p>`;
            
            const plainCount = countWords(plainContent);
            const htmlCount = countWords(htmlContent);
            
            // Количество слов должно быть одинаковым
            expect(htmlCount).toBe(plainCount);
            // И должно равняться количеству слов в массиве
            expect(plainCount).toBe(words.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('подсчёт слов должен игнорировать цифры и специальные символы', () => {
      expect(countWords('123 456 789')).toBe(0);
      expect(countWords('!@# $%^ &*()')).toBe(0);
      expect(countWords('слово 123 текст')).toBe(2);
      expect(countWords('word1 word2 123')).toBe(2);
    });
  });
});
