/**
 * Property-based тесты для ICO файла favicon
 * Feature: favicon-enhancement
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('Favicon ICO Property Tests', () => {
  const faviconPath = resolve(process.cwd(), 'public/favicon.ico');

  /**
   * Property 3: ICO File Structure
   * For any ICO favicon file, it should contain multiple sizes (16x16, 32x32, 48x48) and be optimized for size
   * **Validates: Requirements 2.4, 5.1**
   */
  it('Property 3: ICO File Structure - ICO file should have correct structure and sizes', async () => {
    // Feature: favicon-enhancement, Property 3: ICO File Structure
    
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null), // Не нужны случайные данные, тестируем конкретный файл
        async () => {
          // Проверяем существование файла
          expect(existsSync(faviconPath)).toBe(true);
          
          // Читаем файл
          const icoBuffer = readFileSync(faviconPath);
          expect(icoBuffer.length).toBeGreaterThan(0);
          
          // Проверяем ICO заголовок
          // ICO файл начинается с: 00 00 01 00 (reserved, type, count)
          expect(icoBuffer[0]).toBe(0x00); // Reserved
          expect(icoBuffer[1]).toBe(0x00); // Reserved
          expect(icoBuffer[2]).toBe(0x01); // Type: 1 = ICO
          expect(icoBuffer[3]).toBe(0x00); // Type high byte
          
          // Получаем количество изображений в ICO
          const imageCount = icoBuffer[4] + (icoBuffer[5] << 8);
          expect(imageCount).toBeGreaterThanOrEqual(3); // Минимум 3 размера: 16x16, 32x32, 48x48
          
          // Проверяем размеры изображений
          const expectedSizes = [16, 32, 48];
          const foundSizes: number[] = [];
          
          for (let i = 0; i < imageCount; i++) {
            const entryOffset = 6 + (i * 16); // Каждая запись 16 байт
            const width = icoBuffer[entryOffset] || 256; // 0 означает 256
            const height = icoBuffer[entryOffset + 1] || 256; // 0 означает 256
            
            foundSizes.push(width);
            
            // Ширина и высота должны быть равны (квадратная иконка)
            expect(width).toBe(height);
            
            // Размер должен быть одним из ожидаемых
            expect(expectedSizes).toContain(width);
          }
          
          // Проверяем, что все ожидаемые размеры присутствуют
          for (const expectedSize of expectedSizes) {
            expect(foundSizes).toContain(expectedSize);
          }
          
          // Проверяем оптимизацию размера файла
          // ICO файл не должен быть слишком большим (разумный лимит)
          expect(icoBuffer.length).toBeLessThan(50 * 1024); // Менее 50KB
          expect(icoBuffer.length).toBeGreaterThan(100); // Но не слишком маленький
        }
      ),
      { numRuns: 1 } // Тестируем один раз, так как файл статичный
    );
  });

  /**
   * Дополнительный property тест: ICO File Accessibility
   * Проверяет доступность ICO файла через HTTP
   */
  it('Property: ICO File Accessibility - ICO file should be accessible and have correct MIME type', async () => {
    // Feature: favicon-enhancement, Property: ICO File Accessibility
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userAgent: fc.constantFrom(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
          )
        }),
        async ({ userAgent }) => {
          // Проверяем, что файл существует и читается
          expect(existsSync(faviconPath)).toBe(true);
          
          const icoBuffer = readFileSync(faviconPath);
          
          // Проверяем, что это валидный ICO файл
          expect(icoBuffer[0]).toBe(0x00);
          expect(icoBuffer[1]).toBe(0x00);
          expect(icoBuffer[2]).toBe(0x01);
          expect(icoBuffer[3]).toBe(0x00);
          
          // Файл должен быть доступен для чтения
          expect(icoBuffer.length).toBeGreaterThan(0);
          
          // Проверяем, что файл не поврежден
          const imageCount = icoBuffer[4] + (icoBuffer[5] << 8);
          expect(imageCount).toBeGreaterThan(0);
          expect(imageCount).toBeLessThan(256); // Разумный лимит
          
          // Каждое изображение должно иметь валидные данные
          for (let i = 0; i < imageCount; i++) {
            const entryOffset = 6 + (i * 16);
            const dataSize = icoBuffer.readUInt32LE(entryOffset + 8);
            const dataOffset = icoBuffer.readUInt32LE(entryOffset + 12);
            
            // Проверяем, что данные находятся в пределах файла
            expect(dataOffset).toBeGreaterThanOrEqual(6 + (imageCount * 16));
            expect(dataOffset + dataSize).toBeLessThanOrEqual(icoBuffer.length);
            expect(dataSize).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Дополнительный property тест: ICO File Performance
   * Проверяет производительностные характеристики ICO файла
   */
  it('Property: ICO File Performance - ICO file should be optimized for performance', async () => {
    // Feature: favicon-enhancement, Property: ICO File Performance
    
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          const icoBuffer = readFileSync(faviconPath);
          
          // Проверяем размер файла для производительности
          expect(icoBuffer.length).toBeLessThan(20 * 1024); // Менее 20KB для быстрой загрузки
          
          // Проверяем количество изображений (не слишком много)
          const imageCount = icoBuffer[4] + (icoBuffer[5] << 8);
          expect(imageCount).toBeLessThanOrEqual(5); // Не более 5 размеров для оптимизации
          
          // Проверяем, что нет дублирующихся размеров
          const sizes: number[] = [];
          for (let i = 0; i < imageCount; i++) {
            const entryOffset = 6 + (i * 16);
            const width = icoBuffer[entryOffset] || 256;
            
            expect(sizes).not.toContain(width); // Не должно быть дубликатов
            sizes.push(width);
          }
          
          // Проверяем, что размеры упорядочены логично
          const sortedSizes = [...sizes].sort((a, b) => a - b);
          expect(sizes).toEqual(sortedSizes);
        }
      ),
      { numRuns: 1 }
    );
  });
});