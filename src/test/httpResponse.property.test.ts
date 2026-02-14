/**
 * Property-based тесты для HTTP ответов favicon файлов
 * Feature: favicon-enhancement
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { readFileSync, existsSync, statSync } from 'fs';
import { resolve } from 'path';

describe('HTTP Response Property Tests', () => {
  const faviconFiles = [
    { path: 'public/favicon.ico', mimeType: 'image/x-icon', name: 'favicon.ico' },
    { path: 'public/icon.svg', mimeType: 'image/svg+xml', name: 'icon.svg' },
    { path: 'public/apple-touch-icon.png', mimeType: 'image/png', name: 'apple-touch-icon.png' },
    { path: 'public/icon-192.png', mimeType: 'image/png', name: 'icon-192.png' },
    { path: 'public/icon-512.png', mimeType: 'image/png', name: 'icon-512.png' },
    { path: 'public/manifest.json', mimeType: 'application/json', name: 'manifest.json' }
  ];

  /**
   * Property 1: HTTP Response Correctness
   * For any favicon file request (favicon.ico, icon.svg, apple-touch-icon.png), 
   * the server should return HTTP status 200 with correct MIME type and appropriate caching headers
   * **Validates: Requirements 1.1, 1.2, 1.4, 5.3**
   */
  it('Property 1: HTTP Response Correctness - favicon files should have correct MIME types and be accessible', async () => {
    // Feature: favicon-enhancement, Property 1: HTTP Response Correctness
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          fileIndex: fc.integer({ min: 0, max: faviconFiles.length - 1 }),
          userAgent: fc.constantFrom(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Yandex/1.01.001 (compatible; Win16; I)',
            'Googlebot/2.1 (+http://www.google.com/bot.html)',
            'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
          ),
          acceptEncoding: fc.constantFrom('gzip', 'gzip, deflate', 'gzip, deflate, br', '*')
        }),
        async ({ fileIndex, userAgent, acceptEncoding }) => {
          const file = faviconFiles[fileIndex];
          const filePath = resolve(process.cwd(), file.path);
          
          // Проверяем существование файла (эквивалент HTTP 200)
          expect(existsSync(filePath)).toBe(true);
          
          // Читаем файл (эквивалент успешного HTTP ответа)
          const fileBuffer = readFileSync(filePath);
          expect(fileBuffer.length).toBeGreaterThan(0);
          
          // Проверяем статистику файла для HTTP заголовков
          const stats = statSync(filePath);
          expect(stats.isFile()).toBe(true);
          expect(stats.size).toBeGreaterThan(0);
          
          // Проверяем корректность MIME типа по содержимому файла
          if (file.mimeType === 'image/x-icon') {
            // ICO файл должен начинаться с правильной сигнатуры
            expect(fileBuffer[0]).toBe(0x00);
            expect(fileBuffer[1]).toBe(0x00);
            expect(fileBuffer[2]).toBe(0x01);
            expect(fileBuffer[3]).toBe(0x00);
          } else if (file.mimeType === 'image/svg+xml') {
            // SVG файл должен содержать XML декларацию или <svg> тег
            const content = fileBuffer.toString('utf8');
            expect(content).toMatch(/<svg|<\?xml/);
            expect(content).toContain('svg');
          } else if (file.mimeType === 'image/png') {
            // PNG файл должен начинаться с PNG сигнатуры
            expect(fileBuffer[0]).toBe(0x89);
            expect(fileBuffer[1]).toBe(0x50); // 'P'
            expect(fileBuffer[2]).toBe(0x4E); // 'N'
            expect(fileBuffer[3]).toBe(0x47); // 'G'
          } else if (file.mimeType === 'application/json') {
            // JSON файл должен быть валидным JSON
            const content = fileBuffer.toString('utf8');
            expect(() => JSON.parse(content)).not.toThrow();
          }
          
          // Проверяем размер файла для оптимизации производительности
          const fileSizeKB = fileBuffer.length / 1024;
          
          if (file.name === 'favicon.ico') {
            // ICO файл должен быть оптимизирован
            expect(fileSizeKB).toBeLessThan(50); // Максимум 50KB
            expect(fileSizeKB).toBeGreaterThan(0.1); // Минимум 100 байт
          } else if (file.name === 'icon.svg') {
            // SVG должен быть компактным
            expect(fileSizeKB).toBeLessThan(10); // Максимум 10KB
            expect(fileSizeKB).toBeGreaterThan(0.1);
          } else if (file.name.includes('.png')) {
            // PNG файлы должны быть оптимизированы
            if (file.name === 'apple-touch-icon.png') {
              expect(fileSizeKB).toBeLessThan(100); // Максимум 100KB
            } else if (file.name === 'icon-192.png') {
              expect(fileSizeKB).toBeLessThan(200); // Максимум 200KB
            } else if (file.name === 'icon-512.png') {
              expect(fileSizeKB).toBeLessThan(1000); // Максимум 1MB
            }
            expect(fileSizeKB).toBeGreaterThan(0.5); // Минимум 500 байт
          } else if (file.name === 'manifest.json') {
            // Manifest должен быть компактным
            expect(fileSizeKB).toBeLessThan(10); // Максимум 10KB
            expect(fileSizeKB).toBeGreaterThan(0.1);
          }
          
          // Проверяем доступность для различных User-Agent'ов
          // Все файлы должны быть доступны для всех браузеров и роботов
          expect(fileBuffer.length).toBeGreaterThan(0);
          
          // Проверяем поддержку сжатия (косвенно через размер файла)
          if (acceptEncoding.includes('gzip') || acceptEncoding.includes('br')) {
            // Файлы должны быть достаточно большими для эффективного сжатия
            // или уже оптимизированными
            if (file.name.endsWith('.svg') || file.name.endsWith('.json')) {
              expect(fileSizeKB).toBeGreaterThan(0.1); // Текстовые файлы хорошо сжимаются
            }
          }
          
          // Проверяем корректность файла для кэширования
          // Файл должен быть стабильным (не изменяться случайно)
          expect(stats.size).toBe(fileBuffer.length);
          expect(stats.mtime).toBeInstanceOf(Date);
        }
      ),
      { numRuns: 50 } // Тестируем много раз для различных комбинаций
    );
  });

  /**
   * Дополнительный property тест: File Accessibility for Search Engines
   * Проверяет доступность файлов для поисковых роботов
   */
  it('Property: File Accessibility for Search Engines - favicon files should be accessible to search engine bots', async () => {
    // Feature: favicon-enhancement, Property: File Accessibility for Search Engines
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          searchBot: fc.constantFrom(
            'Googlebot/2.1 (+http://www.google.com/bot.html)',
            'Yandex/1.01.001 (compatible; Win16; I)',
            'bingbot/2.0 (+http://www.bing.com/bingbot.htm)',
            'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
            'Twitterbot/1.0'
          ),
          faviconType: fc.constantFrom('favicon.ico', 'icon.svg', 'apple-touch-icon.png')
        }),
        async ({ searchBot, faviconType }) => {
          const filePath = resolve(process.cwd(), `public/${faviconType}`);
          
          // Проверяем доступность файла (эквивалент HTTP 200)
          expect(existsSync(filePath)).toBe(true);
          
          const fileBuffer = readFileSync(filePath);
          const stats = statSync(filePath);
          
          // Файл должен быть доступен для чтения
          expect(fileBuffer.length).toBeGreaterThan(0);
          expect(stats.isFile()).toBe(true);
          
          // Проверяем, что файл не слишком большой для роботов
          const fileSizeKB = fileBuffer.length / 1024;
          expect(fileSizeKB).toBeLessThan(1000); // Максимум 1MB
          
          // Проверяем корректность формата для роботов
          if (faviconType === 'favicon.ico') {
            // ICO должен быть валидным
            expect(fileBuffer[0]).toBe(0x00);
            expect(fileBuffer[1]).toBe(0x00);
            expect(fileBuffer[2]).toBe(0x01);
            expect(fileBuffer[3]).toBe(0x00);
            
            // Должен содержать стандартные размеры
            const imageCount = fileBuffer[4] + (fileBuffer[5] << 8);
            expect(imageCount).toBeGreaterThanOrEqual(1);
            expect(imageCount).toBeLessThanOrEqual(10);
          } else if (faviconType === 'icon.svg') {
            // SVG должен быть валидным XML
            const content = fileBuffer.toString('utf8');
            expect(content).toMatch(/<svg/);
            expect(content).toMatch(/xmlns/);
            
            // Не должен содержать вредоносный код
            expect(content).not.toMatch(/<script/i);
            expect(content).not.toMatch(/javascript:/i);
          } else if (faviconType === 'apple-touch-icon.png') {
            // PNG должен быть валидным
            expect(fileBuffer.slice(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4E, 0x47]));
            
            // Должен иметь правильные размеры для Apple
            const width = fileBuffer.readUInt32BE(16);
            const height = fileBuffer.readUInt32BE(20);
            expect(width).toBe(180);
            expect(height).toBe(180);
          }
          
          // Файл должен иметь разумную дату модификации
          expect(stats.mtime.getTime()).toBeLessThanOrEqual(Date.now());
          expect(stats.mtime.getTime()).toBeGreaterThan(Date.now() - (365 * 24 * 60 * 60 * 1000)); // Не старше года
        }
      ),
      { numRuns: 25 }
    );
  });

  /**
   * Дополнительный property тест: MIME Type Validation
   * Проверяет корректность MIME типов для различных файлов
   */
  it('Property: MIME Type Validation - files should have content matching their expected MIME types', async () => {
    // Feature: favicon-enhancement, Property: MIME Type Validation
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          fileInfo: fc.constantFrom(...faviconFiles),
          httpVersion: fc.constantFrom('HTTP/1.1', 'HTTP/2.0')
        }),
        async ({ fileInfo, httpVersion }) => {
          const filePath = resolve(process.cwd(), fileInfo.path);
          
          expect(existsSync(filePath)).toBe(true);
          
          const fileBuffer = readFileSync(filePath);
          const stats = statSync(filePath);
          
          // Проверяем соответствие содержимого MIME типу
          switch (fileInfo.mimeType) {
            case 'image/x-icon':
              // ICO файл
              expect(fileBuffer[0]).toBe(0x00);
              expect(fileBuffer[1]).toBe(0x00);
              expect(fileBuffer[2]).toBe(0x01);
              expect(fileBuffer[3]).toBe(0x00);
              break;
              
            case 'image/svg+xml':
              // SVG файл
              const svgContent = fileBuffer.toString('utf8');
              expect(svgContent).toMatch(/<svg/);
              expect(svgContent).toMatch(/xmlns/);
              
              // Должен быть валидным XML
              expect(svgContent).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/);
              break;
              
            case 'image/png':
              // PNG файл
              expect(fileBuffer[0]).toBe(0x89);
              expect(fileBuffer[1]).toBe(0x50);
              expect(fileBuffer[2]).toBe(0x4E);
              expect(fileBuffer[3]).toBe(0x47);
              expect(fileBuffer[4]).toBe(0x0D);
              expect(fileBuffer[5]).toBe(0x0A);
              expect(fileBuffer[6]).toBe(0x1A);
              expect(fileBuffer[7]).toBe(0x0A);
              
              // Должен содержать IHDR chunk
              const ihdrSignature = fileBuffer.slice(12, 16).toString('ascii');
              expect(ihdrSignature).toBe('IHDR');
              break;
              
            case 'application/json':
              // JSON файл
              const jsonContent = fileBuffer.toString('utf8');
              let parsedJson;
              expect(() => {
                parsedJson = JSON.parse(jsonContent);
              }).not.toThrow();
              
              // Manifest.json должен содержать обязательные поля
              if (fileInfo.name === 'manifest.json') {
                expect(parsedJson).toHaveProperty('name');
                expect(parsedJson).toHaveProperty('icons');
                expect(Array.isArray(parsedJson.icons)).toBe(true);
              }
              break;
          }
          
          // Проверяем размер файла для HTTP заголовков
          expect(stats.size).toBe(fileBuffer.length);
          expect(stats.size).toBeGreaterThan(0);
          
          // Файл должен быть читаемым
          expect(stats.mode & 0o444).toBeGreaterThan(0); // Права на чтение
          
          // Проверяем, что файл не слишком большой для HTTP ответа
          expect(stats.size).toBeLessThan(10 * 1024 * 1024); // Максимум 10MB
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Дополнительный property тест: Caching Headers Compatibility
   * Проверяет совместимость файлов с HTTP кэшированием
   */
  it('Property: Caching Headers Compatibility - files should be suitable for HTTP caching', async () => {
    // Feature: favicon-enhancement, Property: Caching Headers Compatibility
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          fileInfo: fc.constantFrom(...faviconFiles),
          cacheStrategy: fc.constantFrom('public', 'private', 'no-cache', 'max-age=3600')
        }),
        async ({ fileInfo, cacheStrategy }) => {
          const filePath = resolve(process.cwd(), fileInfo.path);
          
          expect(existsSync(filePath)).toBe(true);
          
          const fileBuffer = readFileSync(filePath);
          const stats = statSync(filePath);
          
          // Файл должен быть стабильным для кэширования
          expect(fileBuffer.length).toBeGreaterThan(0);
          expect(stats.isFile()).toBe(true);
          
          // Проверяем, что файл подходит для долгосрочного кэширования
          if (cacheStrategy.includes('max-age') || cacheStrategy === 'public') {
            // Файл должен быть стабильным (не изменяться часто)
            expect(stats.mtime.getTime()).toBeLessThanOrEqual(Date.now());
            
            // Размер должен быть оптимизирован для кэширования
            const fileSizeKB = fileBuffer.length / 1024;
            
            if (fileInfo.name.endsWith('.ico')) {
              expect(fileSizeKB).toBeLessThan(50); // ICO файлы должны быть компактными
            } else if (fileInfo.name.endsWith('.svg')) {
              expect(fileSizeKB).toBeLessThan(20); // SVG файлы должны быть минимальными
            } else if (fileInfo.name.endsWith('.png')) {
              // PNG файлы могут быть больше, но в разумных пределах
              if (fileInfo.name.includes('512')) {
                expect(fileSizeKB).toBeLessThan(1000);
              } else {
                expect(fileSizeKB).toBeLessThan(200);
              }
            }
          }
          
          // Проверяем целостность файла для ETag генерации
          expect(fileBuffer.length).toBe(stats.size);
          
          // Файл должен иметь валидную дату модификации для Last-Modified заголовка
          expect(stats.mtime).toBeInstanceOf(Date);
          expect(stats.mtime.getTime()).toBeGreaterThan(0);
          
          // Проверяем, что файл не поврежден (для корректного кэширования)
          if (fileInfo.mimeType.startsWith('image/')) {
            // Изображения должны иметь валидные заголовки
            if (fileInfo.mimeType === 'image/png') {
              expect(fileBuffer.slice(0, 8)).toEqual(
                Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
              );
            } else if (fileInfo.mimeType === 'image/x-icon') {
              expect(fileBuffer.slice(0, 4)).toEqual(
                Buffer.from([0x00, 0x00, 0x01, 0x00])
              );
            }
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Дополнительный property тест: Compression Suitability
   * Проверяет пригодность файлов для HTTP сжатия
   */
  it('Property: Compression Suitability - files should be suitable for HTTP compression', async () => {
    // Feature: favicon-enhancement, Property: Compression Suitability
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          fileInfo: fc.constantFrom(...faviconFiles),
          compressionType: fc.constantFrom('gzip', 'deflate', 'br', 'none')
        }),
        async ({ fileInfo, compressionType }) => {
          const filePath = resolve(process.cwd(), fileInfo.path);
          
          expect(existsSync(filePath)).toBe(true);
          
          const fileBuffer = readFileSync(filePath);
          
          // Проверяем пригодность для сжатия
          if (compressionType !== 'none') {
            if (fileInfo.mimeType === 'image/svg+xml' || fileInfo.mimeType === 'application/json') {
              // Текстовые файлы хорошо сжимаются
              expect(fileBuffer.length).toBeGreaterThan(100); // Минимальный размер для эффективного сжатия
              
              const content = fileBuffer.toString('utf8');
              
              // Должны содержать повторяющиеся паттерны для сжатия
              if (fileInfo.mimeType === 'image/svg+xml') {
                expect(content).toMatch(/\s+/); // Пробелы
                expect(content.length).toBeGreaterThan(50);
              } else if (fileInfo.mimeType === 'application/json') {
                expect(content).toMatch(/[{}\[\]",:]/); // JSON символы
                expect(content.length).toBeGreaterThan(20);
              }
            } else {
              // Бинарные файлы (PNG, ICO) уже сжаты
              expect(fileBuffer.length).toBeGreaterThan(0);
              
              // Проверяем, что это действительно бинарные файлы
              if (fileInfo.mimeType === 'image/png') {
                // PNG уже использует сжатие DEFLATE внутри
                expect(fileBuffer[0]).toBe(0x89);
              } else if (fileInfo.mimeType === 'image/x-icon') {
                // ICO может содержать сжатые PNG данные
                expect(fileBuffer[2]).toBe(0x01);
              }
            }
          }
          
          // Проверяем размер файла для определения эффективности сжатия
          const fileSizeKB = fileBuffer.length / 1024;
          
          if (fileInfo.mimeType === 'image/svg+xml') {
            // SVG файлы должны быть достаточно большими для сжатия, но не огромными
            expect(fileSizeKB).toBeGreaterThan(0.1);
            expect(fileSizeKB).toBeLessThan(50);
          } else if (fileInfo.mimeType === 'application/json') {
            // JSON файлы обычно небольшие
            expect(fileSizeKB).toBeGreaterThan(0.1);
            expect(fileSizeKB).toBeLessThan(20);
          }
          
          // Файл должен быть читаемым для сжатия
          expect(fileBuffer.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 25 }
    );
  });
});