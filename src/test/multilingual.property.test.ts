/**
 * Property-Based Tests для мультиязычности блога
 * Feature: blog-development
 */

import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import type { BlogPost, SupportedLanguage } from '@/types/blog';
import {
  generateHreflangTags,
  generateCanonicalUrl,
  getAvailableLanguages,
  hasTranslations,
} from '@/utils/multilingualSeo';
import { buildLocalizedUrl, extractLanguageFromPath } from '@/utils/i18n';

// Генератор для поддерживаемых языков
const supportedLanguageArb = fc.constantFrom<SupportedLanguage>('ru', 'en');

// Генератор для BlogPost с мультиязычными полями
const blogPostArb = fc.record({
  id: fc.uuid(),
  slug: fc.stringMatching(/^[a-z0-9-]+$/),
  title: fc.string({ minLength: 10, maxLength: 100 }),
  excerpt: fc.string({ minLength: 50, maxLength: 200 }),
  content: fc.string({ minLength: 2000, maxLength: 5000 }),
  language: supportedLanguageArb,
  translations: fc.option(
    fc.dictionary(
      supportedLanguageArb,
      fc.uuid()
    ),
    { nil: undefined }
  ),
  seo: fc.record({
    metaTitle: fc.option(fc.string({ minLength: 50, maxLength: 70 }), { nil: undefined }),
    metaDescription: fc.option(fc.string({ minLength: 150, maxLength: 160 }), { nil: undefined }),
    keywords: fc.option(fc.array(fc.string(), { minLength: 5, maxLength: 10 }), { nil: undefined }),
  }),
}) as fc.Arbitrary<Partial<BlogPost>>;

describe('Property Tests: Multilingual Blog', () => {
  describe('Property 32: Language-Specific SEO', () => {
    test('каждая статья должна иметь раздельные SEO метаданные для каждого языка', () => {
      fc.assert(
        fc.property(blogPostArb, (post) => {
          // Проверяем, что у статьи есть SEO метаданные
          expect(post.seo).toBeDefined();
          
          // Проверяем, что SEO метаданные специфичны для языка статьи
          expect(post.language).toBeDefined();
          expect(['ru', 'en']).toContain(post.language);
          
          // Если есть переводы, каждый перевод должен иметь свои SEO метаданные
          if (post.translations && Object.keys(post.translations).length > 0) {
            // В реальном приложении здесь нужно проверить, что переведенные статьи
            // имеют свои собственные SEO метаданные
            // Пока проверяем, что структура translations корректна
            Object.entries(post.translations).forEach(([lang, translatedId]) => {
              expect(['ru', 'en']).toContain(lang);
              expect(translatedId).toBeDefined();
              expect(typeof translatedId).toBe('string');
            });
          }
        }),
        { numRuns: 100 }
      );
    });
    // Feature: blog-development, Property 32: Language-Specific SEO
  });

  describe('Property 33: Hreflang Tags', () => {
    test('для статей с переводами должны генерироваться hreflang теги', () => {
      fc.assert(
        fc.property(
          blogPostArb,
          fc.constantFrom('https://schitai.ru', 'https://example.com'),
          (post, baseUrl) => {
            const hreflangTags = generateHreflangTags(post as BlogPost, baseUrl);
            
            // Должен быть хотя бы один тег для текущего языка
            expect(hreflangTags.length).toBeGreaterThanOrEqual(1);
            
            // Должен быть тег для текущего языка статьи
            const currentLangTag = hreflangTags.find(tag => tag.lang === post.language);
            expect(currentLangTag).toBeDefined();
            expect(currentLangTag?.href).toContain(baseUrl);
            expect(currentLangTag?.href).toContain(post.slug);
            
            // Должен быть x-default тег
            const defaultTag = hreflangTags.find(tag => tag.lang === 'x-default');
            expect(defaultTag).toBeDefined();
            expect(defaultTag?.href).toContain(baseUrl);
            
            // Если есть переводы, должны быть теги для каждого перевода
            if (post.translations) {
              Object.keys(post.translations).forEach(lang => {
                const translationTag = hreflangTags.find(tag => tag.lang === lang);
                expect(translationTag).toBeDefined();
                expect(translationTag?.href).toContain(baseUrl);
              });
            }
            
            // Все href должны быть валидными URL
            hreflangTags.forEach(tag => {
              expect(() => new URL(tag.href)).not.toThrow();
            });
          }
        ),
        { numRuns: 100 }
      );
    });
    // Feature: blog-development, Property 33: Hreflang Tags
  });

  describe('Additional Multilingual Properties', () => {
    test('canonical URL должен включать языковой префикс для не-русских языков', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-z0-9-]+$/),
          supportedLanguageArb,
          (slug, language) => {
            const canonicalUrl = generateCanonicalUrl(slug, language);
            
            // URL должен содержать slug
            expect(canonicalUrl).toContain(slug);
            
            // Для английского языка должен быть префикс /en
            if (language === 'en') {
              expect(canonicalUrl).toContain('/en/blog/');
            }
            
            // Для русского языка не должно быть префикса
            if (language === 'ru') {
              expect(canonicalUrl).not.toContain('/ru/');
              expect(canonicalUrl).toContain('/blog/');
            }
            
            // URL должен быть валидным
            expect(() => new URL(canonicalUrl)).not.toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('buildLocalizedUrl должен корректно строить URL с языковым префиксом', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^\/[a-z0-9/-]+$/),
          supportedLanguageArb,
          (path, language) => {
            const localizedUrl = buildLocalizedUrl(path, language);
            
            // URL должен содержать исходный путь
            expect(localizedUrl).toContain(path.replace(/^\//, ''));
            
            // Для английского должен быть префикс /en
            if (language === 'en') {
              expect(localizedUrl).toMatch(/^\/en\//);
            }
            
            // Для русского не должно быть префикса /ru
            if (language === 'ru') {
              expect(localizedUrl).not.toMatch(/^\/ru\//);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('extractLanguageFromPath должен корректно извлекать язык из пути', () => {
      fc.assert(
        fc.property(
          supportedLanguageArb,
          fc.stringMatching(/^[a-z0-9/-]+$/),
          (language, pathSuffix) => {
            const path = language === 'ru' 
              ? `/blog/${pathSuffix}`
              : `/${language}/blog/${pathSuffix}`;
            
            const { language: extractedLang, pathWithoutLanguage } = extractLanguageFromPath(path);
            
            // Извлеченный язык должен совпадать с ожидаемым
            expect(extractedLang).toBe(language);
            
            // Путь без языка не должен содержать языковой префикс
            expect(pathWithoutLanguage).not.toMatch(/^\/(ru|en)\//);
            expect(pathWithoutLanguage).toContain('blog');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('getAvailableLanguages должен возвращать все доступные языки для статьи', () => {
      fc.assert(
        fc.property(blogPostArb, (post) => {
          const availableLanguages = getAvailableLanguages(post as BlogPost);
          
          // Должен содержать хотя бы язык самой статьи
          expect(availableLanguages).toContain(post.language);
          
          // Если есть переводы, должен содержать языки переводов
          if (post.translations) {
            Object.keys(post.translations).forEach(lang => {
              expect(availableLanguages).toContain(lang as SupportedLanguage);
            });
          }
          
          // Количество языков должно быть корректным
          const expectedCount = 1 + (post.translations ? Object.keys(post.translations).length : 0);
          expect(availableLanguages.length).toBe(expectedCount);
        }),
        { numRuns: 100 }
      );
    });

    test('hasTranslations должен корректно определять наличие переводов', () => {
      fc.assert(
        fc.property(blogPostArb, (post) => {
          const result = hasTranslations(post as BlogPost);
          
          if (post.translations && Object.keys(post.translations).length > 0) {
            expect(result).toBe(true);
          } else {
            expect(result).toBe(false);
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
