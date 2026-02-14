import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
  generateAltTag,
  convertToWebP,
  optimizeImage,
  addLazyLoading,
  processImagesInContent,
  validateImageAltTags,
  extractImagesFromContent,
  type ImageData,
} from '@/utils/imageOptimizer';

/**
 * Property-Based Tests для Image Optimizer
 * Feature: blog-development
 */

describe('Image Optimizer Property Tests', () => {
  describe('Property 11: Image Alt Tags', () => {
    test('все изображения должны иметь alt атрибуты после обработки', () => {
      // Feature: blog-development, Property 11: Image Alt Tags
      // Validates: Requirements 2.8
      
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              url: fc.webUrl(),
              width: fc.integer({ min: 100, max: 2000 }),
              height: fc.integer({ min: 100, max: 2000 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          fc.stringMatching(/^[a-zA-Zа-яА-ЯёЁ0-9\s]+$/).filter(s => s.trim().length >= 10 && s.trim().length <= 100),
          (images, articleTitle) => {
            // Создаём HTML контент с изображениями без alt
            const htmlContent = images
              .map(img => `<img src="${img.url}" width="${img.width}" height="${img.height}">`)
              .join('\n');
            
            // Обрабатываем контент с генерацией alt tags
            const processedContent = processImagesInContent(htmlContent, {
              generateAltTags: true,
              articleTitle,
            });
            
            // Проверяем, что все изображения теперь имеют alt
            expect(validateImageAltTags(processedContent)).toBe(true);
            
            // Проверяем, что каждое изображение имеет непустой alt
            const extractedImages = extractImagesFromContent(processedContent);
            extractedImages.forEach(img => {
              expect(img.alt).toBeTruthy();
              expect(img.alt.length).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('валидация должна возвращать false для изображений без alt', () => {
      // Feature: blog-development, Property 11: Image Alt Tags
      // Validates: Requirements 2.8
      
      fc.assert(
        fc.property(
          fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 }),
          (imageUrls) => {
            // Создаём HTML с изображениями без alt
            const htmlContent = imageUrls
              .map(url => `<img src="${url}">`)
              .join('\n');
            
            // Валидация должна провалиться
            expect(validateImageAltTags(htmlContent)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('валидация должна возвращать true для изображений с alt', () => {
      // Feature: blog-development, Property 11: Image Alt Tags
      // Validates: Requirements 2.8
      
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              url: fc.webUrl(),
              alt: fc.string({ minLength: 5, maxLength: 100 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (images) => {
            // Создаём HTML с изображениями с alt
            const htmlContent = images
              .map(img => `<img src="${img.url}" alt="${img.alt}">`)
              .join('\n');
            
            // Валидация должна пройти
            expect(validateImageAltTags(htmlContent)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 21: Image Optimization', () => {
    test('оптимизированные изображения должны иметь WebP URL и lazy loading', () => {
      // Feature: blog-development, Property 21: Image Optimization
      // Validates: Requirements 5.6
      
      fc.assert(
        fc.property(
          fc.record({
            url: fc.webUrl().map(url => url + '.jpg'),
            alt: fc.string({ minLength: 5, maxLength: 100 }),
            width: fc.integer({ min: 100, max: 2000 }),
            height: fc.integer({ min: 100, max: 2000 }),
          }),
          (image) => {
            const optimized = optimizeImage(image, {
              convertToWebP: true,
              addLazyLoading: true,
              isBelowFold: true,
            });
            
            // Проверяем наличие WebP URL
            expect(optimized.webpUrl).toBeDefined();
            expect(optimized.webpUrl).toContain('.webp');
            
            // Проверяем lazy loading
            expect(optimized.loading).toBe('lazy');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('изображения выше fold должны иметь eager loading', () => {
      // Feature: blog-development, Property 21: Image Optimization
      // Validates: Requirements 5.6
      
      fc.assert(
        fc.property(
          fc.record({
            url: fc.webUrl().map(url => url + '.jpg'),
            alt: fc.string({ minLength: 5, maxLength: 100 }),
            width: fc.integer({ min: 100, max: 2000 }),
            height: fc.integer({ min: 100, max: 2000 }),
          }),
          (image) => {
            const optimized = optimizeImage(image, {
              addLazyLoading: true,
              isBelowFold: false, // Изображение выше fold
            });
            
            // Проверяем eager loading
            expect(optimized.loading).toBe('eager');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('WebP конвертация должна сохранять базовый URL', () => {
      // Feature: blog-development, Property 21: Image Optimization
      // Validates: Requirements 5.6
      
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.constantFrom('.jpg', '.jpeg', '.png', '.gif'),
          (baseUrl, extension) => {
            const imageUrl = baseUrl + extension;
            const webpUrl = convertToWebP(imageUrl);
            
            // WebP URL должен содержать базовый URL
            expect(webpUrl).toContain(baseUrl);
            
            // WebP URL должен заканчиваться на .webp
            expect(webpUrl).toMatch(/\.webp$/);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 34: Image Lazy Loading', () => {
    test('изображения ниже fold должны иметь loading="lazy"', () => {
      // Feature: blog-development, Property 34: Image Lazy Loading
      // Validates: Requirements 11.6
      
      fc.assert(
        fc.property(
          fc.array(fc.webUrl(), { minLength: 2, maxLength: 10 }),
          (imageUrls) => {
            // Создаём HTML контент с несколькими изображениями
            const htmlContent = imageUrls
              .map(url => `<img src="${url}" alt="test">`)
              .join('\n');
            
            // Обрабатываем контент с lazy loading
            const processedContent = processImagesInContent(htmlContent, {
              addLazyLoading: true,
              firstImageEager: true, // Первое изображение eager
            });
            
            // Извлекаем изображения
            const lines = processedContent.split('\n');
            
            // Первое изображение должно иметь loading="eager"
            expect(lines[0]).toContain('loading="eager"');
            
            // Остальные изображения должны иметь loading="lazy"
            for (let i = 1; i < lines.length; i++) {
              if (lines[i].includes('<img')) {
                expect(lines[i]).toContain('loading="lazy"');
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('addLazyLoading должен добавлять атрибут loading к любому img тегу', () => {
      // Feature: blog-development, Property 34: Image Lazy Loading
      // Validates: Requirements 11.6
      
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.string({ minLength: 5, maxLength: 100 }),
          fc.boolean(),
          (url, alt, isBelowFold) => {
            const imgHtml = `<img src="${url}" alt="${alt}">`;
            const processedImg = addLazyLoading(imgHtml, isBelowFold);
            
            // Проверяем наличие атрибута loading
            expect(processedImg).toMatch(/loading=["'](lazy|eager)["']/);
            
            // Проверяем правильное значение
            if (isBelowFold) {
              expect(processedImg).toContain('loading="lazy"');
            } else {
              expect(processedImg).toContain('loading="eager"');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('addLazyLoading должен заменять существующий атрибут loading', () => {
      // Feature: blog-development, Property 34: Image Lazy Loading
      // Validates: Requirements 11.6
      
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.constantFrom('lazy', 'eager'),
          fc.boolean(),
          (url, existingLoading, isBelowFold) => {
            const imgHtml = `<img src="${url}" loading="${existingLoading}">`;
            const processedImg = addLazyLoading(imgHtml, isBelowFold);
            
            // Проверяем, что атрибут loading обновлён
            const expectedLoading = isBelowFold ? 'lazy' : 'eager';
            expect(processedImg).toContain(`loading="${expectedLoading}"`);
            
            // Проверяем, что нет дублирования атрибута
            const loadingMatches = processedImg.match(/loading=/g);
            expect(loadingMatches?.length).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Alt Tag Generation', () => {
    test('generateAltTag должен возвращать непустую строку для любого контекста', () => {
      fc.assert(
        fc.property(
          fc.record({
            articleTitle: fc.option(fc.string({ minLength: 10, maxLength: 100 })),
            imageDescription: fc.option(fc.string({ minLength: 5, maxLength: 200 })),
            keywords: fc.option(fc.array(fc.string({ minLength: 3, maxLength: 20 }), { maxLength: 5 })),
          }),
          fc.webUrl(),
          (context, imageUrl) => {
            const altTag = generateAltTag(context, imageUrl);
            
            // Alt tag не должен быть пустым
            expect(altTag).toBeTruthy();
            expect(altTag.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('generateAltTag должен использовать imageDescription, если он предоставлен', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 100 }),
          fc.webUrl(),
          (description, imageUrl) => {
            const altTag = generateAltTag({ imageDescription: description }, imageUrl);
            
            // Alt tag должен быть равен description (с trim)
            expect(altTag).toBe(description.trim());
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Image Extraction', () => {
    test('extractImagesFromContent должен извлекать все изображения', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              url: fc.webUrl().filter(url => !url.includes("'") && !url.includes('"')),
              alt: fc.stringMatching(/^[a-zA-Zа-яА-ЯёЁ0-9\s]+$/).filter(s => s.length >= 5 && s.length <= 100),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (images) => {
            // Создаём HTML контент
            const htmlContent = images
              .map(img => `<img src="${img.url}" alt="${img.alt}">`)
              .join('\n');
            
            // Извлекаем изображения
            const extracted = extractImagesFromContent(htmlContent);
            
            // Количество должно совпадать
            expect(extracted.length).toBe(images.length);
            
            // URL должны совпадать
            extracted.forEach((img, index) => {
              expect(img.url).toBe(images[index].url);
              expect(img.alt).toBe(images[index].alt);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('extractImagesFromContent должен возвращать пустой массив для контента без изображений', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 500 }).filter(s => !s.includes('<img')),
          (content) => {
            const extracted = extractImagesFromContent(content);
            expect(extracted).toEqual([]);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('WebP Conversion', () => {
    test('convertToWebP должен сохранять WebP изображения без изменений', () => {
      fc.assert(
        fc.property(
          fc.webUrl().map(url => url + '.webp'),
          (webpUrl) => {
            const result = convertToWebP(webpUrl);
            expect(result).toBe(webpUrl);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('convertToWebP должен конвертировать различные форматы в WebP', () => {
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.constantFrom('.jpg', '.jpeg', '.png', '.gif', '.JPG', '.PNG'),
          (baseUrl, extension) => {
            const imageUrl = baseUrl + extension;
            const webpUrl = convertToWebP(imageUrl);
            
            // Должен заканчиваться на .webp
            expect(webpUrl).toMatch(/\.webp$/);
            
            // Не должен содержать оригинальное расширение
            expect(webpUrl).not.toMatch(/\.(jpg|jpeg|png|gif)\.webp$/i);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
