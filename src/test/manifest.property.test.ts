/**
 * Property-based тесты для Web App Manifest
 * Feature: favicon-enhancement
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('Web App Manifest Property Tests', () => {
  const manifestPath = resolve(process.cwd(), 'public/manifest.json');

  /**
   * Property 5: PWA Manifest Completeness
   * For any web app manifest file, it should contain icons of sizes 192x192 and 512x512 in PNG format and be properly linked in HTML
   * **Validates: Requirements 4.1, 4.4**
   */
  it('Property 5: PWA Manifest Completeness - should contain required PWA icons and structure', async () => {
    // Feature: favicon-enhancement, Property 5: PWA Manifest Completeness
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          requiredSizes: fc.constant([192, 512]),
          requiredFormat: fc.constant('image/png'),
          requiredPurpose: fc.constant('any')
        }),
        async ({ requiredSizes, requiredFormat, requiredPurpose }) => {
          // Проверяем существование manifest.json
          expect(existsSync(manifestPath)).toBe(true);
          
          // Читаем и парсим манифест
          const manifestContent = readFileSync(manifestPath, 'utf-8');
          expect(manifestContent.length).toBeGreaterThan(0);
          
          let manifest;
          expect(() => {
            manifest = JSON.parse(manifestContent);
          }).not.toThrow();
          
          // Проверяем обязательные поля PWA манифеста
          expect(manifest).toHaveProperty('name');
          expect(manifest).toHaveProperty('short_name');
          expect(manifest).toHaveProperty('start_url');
          expect(manifest).toHaveProperty('display');
          expect(manifest).toHaveProperty('theme_color');
          expect(manifest).toHaveProperty('background_color');
          expect(manifest).toHaveProperty('icons');
          
          // Проверяем массив иконок
          expect(Array.isArray(manifest.icons)).toBe(true);
          expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
          
          // Проверяем наличие всех требуемых размеров
          for (const requiredSize of requiredSizes) {
            const iconWithSize = manifest.icons.find((icon: any) => 
              icon.sizes === `${requiredSize}x${requiredSize}`
            );
            
            expect(iconWithSize).toBeDefined();
            expect(iconWithSize.type).toBe(requiredFormat);
            expect(iconWithSize.src).toMatch(/^\/icon-\d+\.png$/);
            
            // Проверяем существование файла иконки
            const iconPath = resolve(process.cwd(), 'public', iconWithSize.src.substring(1));
            expect(existsSync(iconPath)).toBe(true);
            
            // Проверяем размер файла иконки
            const iconBuffer = readFileSync(iconPath);
            expect(iconBuffer.length).toBeGreaterThan(0);
            
            // Проверяем PNG заголовок
            expect(iconBuffer[0]).toBe(0x89);
            expect(iconBuffer[1]).toBe(0x50); // 'P'
            expect(iconBuffer[2]).toBe(0x4E); // 'N'
            expect(iconBuffer[3]).toBe(0x47); // 'G'
          }
          
          // Проверяем цвета темы
          expect(manifest.theme_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
          expect(manifest.background_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
          
          // Проверяем display mode для PWA
          expect(['standalone', 'fullscreen', 'minimal-ui', 'browser']).toContain(manifest.display);
          
          // Проверяем start_url
          expect(manifest.start_url).toMatch(/^\/.*$/);
          
          // Проверяем имена
          expect(typeof manifest.name).toBe('string');
          expect(manifest.name.length).toBeGreaterThan(0);
          expect(typeof manifest.short_name).toBe('string');
          expect(manifest.short_name.length).toBeGreaterThan(0);
          expect(manifest.short_name.length).toBeLessThanOrEqual(12); // Рекомендация PWA
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Дополнительный property тест: Manifest JSON Validity
   * Проверяет корректность JSON структуры манифеста
   */
  it('Property: Manifest JSON Validity - should be valid JSON with proper structure', async () => {
    // Feature: favicon-enhancement, Property: Manifest JSON Validity
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          encoding: fc.constantFrom('utf-8', 'utf8'),
          expectedFields: fc.constant([
            'name', 'short_name', 'start_url', 'display', 
            'theme_color', 'background_color', 'icons'
          ])
        }),
        async ({ encoding, expectedFields }) => {
          expect(existsSync(manifestPath)).toBe(true);
          
          // Читаем файл с разными кодировками
          const manifestContent = readFileSync(manifestPath, encoding);
          expect(manifestContent.length).toBeGreaterThan(0);
          
          // Проверяем валидность JSON
          let manifest;
          expect(() => {
            manifest = JSON.parse(manifestContent);
          }).not.toThrow();
          
          expect(typeof manifest).toBe('object');
          expect(manifest).not.toBeNull();
          
          // Проверяем наличие всех обязательных полей
          for (const field of expectedFields) {
            expect(manifest).toHaveProperty(field);
            expect(manifest[field]).toBeDefined();
            expect(manifest[field]).not.toBeNull();
          }
          
          // Проверяем типы данных
          expect(typeof manifest.name).toBe('string');
          expect(typeof manifest.short_name).toBe('string');
          expect(typeof manifest.start_url).toBe('string');
          expect(typeof manifest.display).toBe('string');
          expect(typeof manifest.theme_color).toBe('string');
          expect(typeof manifest.background_color).toBe('string');
          expect(Array.isArray(manifest.icons)).toBe(true);
          
          // Проверяем структуру иконок
          for (const icon of manifest.icons) {
            expect(typeof icon).toBe('object');
            expect(icon).toHaveProperty('src');
            expect(icon).toHaveProperty('sizes');
            expect(icon).toHaveProperty('type');
            
            expect(typeof icon.src).toBe('string');
            expect(typeof icon.sizes).toBe('string');
            expect(typeof icon.type).toBe('string');
            
            // Проверяем формат sizes
            expect(icon.sizes).toMatch(/^\d+x\d+$/);
            
            // Проверяем MIME тип
            expect(icon.type).toMatch(/^image\//);
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  /**
   * Дополнительный property тест: PWA Standards Compliance
   * Проверяет соответствие стандартам PWA
   */
  it('Property: PWA Standards Compliance - should meet PWA manifest standards', async () => {
    // Feature: favicon-enhancement, Property: PWA Standards Compliance
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          minIconSizes: fc.constant([192, 512]),
          validDisplayModes: fc.constant(['standalone', 'fullscreen', 'minimal-ui', 'browser']),
          validOrientations: fc.constant(['any', 'natural', 'landscape', 'portrait', 'portrait-primary', 'portrait-secondary'])
        }),
        async ({ minIconSizes, validDisplayModes, validOrientations }) => {
          const manifestContent = readFileSync(manifestPath, 'utf-8');
          const manifest = JSON.parse(manifestContent);
          
          // Проверяем минимальные требования PWA
          expect(manifest.name.length).toBeGreaterThan(0);
          expect(manifest.name.length).toBeLessThanOrEqual(45); // Рекомендация
          
          expect(manifest.short_name.length).toBeGreaterThan(0);
          expect(manifest.short_name.length).toBeLessThanOrEqual(12); // Рекомендация
          
          // Проверяем display mode
          expect(validDisplayModes).toContain(manifest.display);
          
          // Проверяем start_url
          expect(manifest.start_url).toMatch(/^\/.*$/);
          
          // Проверяем иконки для PWA
          const iconSizes = manifest.icons.map((icon: any) => {
            const [width, height] = icon.sizes.split('x').map(Number);
            expect(width).toBe(height); // Квадратные иконки
            return width;
          });
          
          // Проверяем наличие минимальных размеров
          for (const minSize of minIconSizes) {
            expect(iconSizes).toContain(minSize);
          }
          
          // Проверяем цвета
          expect(manifest.theme_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
          expect(manifest.background_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
          
          // Проверяем ориентацию (если указана)
          if (manifest.orientation) {
            expect(validOrientations).toContain(manifest.orientation);
          }
          
          // Проверяем scope (если указан)
          if (manifest.scope) {
            expect(manifest.scope).toMatch(/^\/.*$/);
          }
          
          // Проверяем язык (если указан)
          if (manifest.lang) {
            expect(manifest.lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Дополнительный property тест: Icon File Integrity
   * Проверяет целостность файлов иконок, указанных в манифесте
   */
  it('Property: Icon File Integrity - should have valid icon files referenced in manifest', async () => {
    // Feature: favicon-enhancement, Property: Icon File Integrity
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          expectedFormat: fc.constant('PNG'),
          maxFileSizeKB: fc.constant(1000)
        }),
        async ({ expectedFormat, maxFileSizeKB }) => {
          const manifestContent = readFileSync(manifestPath, 'utf-8');
          const manifest = JSON.parse(manifestContent);
          
          expect(Array.isArray(manifest.icons)).toBe(true);
          expect(manifest.icons.length).toBeGreaterThan(0);
          
          for (const icon of manifest.icons) {
            // Проверяем путь к файлу
            expect(icon.src).toMatch(/^\/.*\.(png|jpg|jpeg|webp|svg)$/i);
            
            // Проверяем существование файла
            const iconPath = resolve(process.cwd(), 'public', icon.src.substring(1));
            expect(existsSync(iconPath)).toBe(true);
            
            // Читаем файл
            const iconBuffer = readFileSync(iconPath);
            expect(iconBuffer.length).toBeGreaterThan(0);
            
            // Проверяем размер файла
            const fileSizeKB = iconBuffer.length / 1024;
            expect(fileSizeKB).toBeLessThan(maxFileSizeKB);
            expect(fileSizeKB).toBeGreaterThan(0.1); // Минимальный размер
            
            // Проверяем формат файла по заголовку
            if (icon.type === 'image/png') {
              expect(iconBuffer[0]).toBe(0x89);
              expect(iconBuffer[1]).toBe(0x50); // 'P'
              expect(iconBuffer[2]).toBe(0x4E); // 'N'
              expect(iconBuffer[3]).toBe(0x47); // 'G'
              
              // Проверяем размеры из PNG заголовка
              const width = iconBuffer.readUInt32BE(16);
              const height = iconBuffer.readUInt32BE(20);
              
              const expectedSize = icon.sizes.split('x')[0];
              expect(width).toBe(parseInt(expectedSize));
              expect(height).toBe(parseInt(expectedSize));
            }
            
            // Проверяем соответствие MIME типа
            if (icon.src.endsWith('.png')) {
              expect(icon.type).toBe('image/png');
            } else if (icon.src.endsWith('.jpg') || icon.src.endsWith('.jpeg')) {
              expect(icon.type).toBe('image/jpeg');
            } else if (icon.src.endsWith('.webp')) {
              expect(icon.type).toBe('image/webp');
            } else if (icon.src.endsWith('.svg')) {
              expect(icon.type).toBe('image/svg+xml');
            }
          }
        }
      ),
      { numRuns: 8 }
    );
  });
});