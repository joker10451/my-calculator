/**
 * Property-based тесты для Apple Touch Icon
 * Feature: favicon-enhancement
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('Apple Touch Icon Property Tests', () => {
  const appleTouchIconPath = resolve(process.cwd(), 'public/apple-touch-icon.png');

  /**
   * Property 4: Mobile Icon Specifications
   * For any Apple Touch Icon file, it should be exactly 180x180 pixels in PNG format
   * **Validates: Requirements 3.1**
   */
  it('Property 4: Mobile Icon Specifications - Apple Touch Icon should meet iOS requirements', async () => {
    // Feature: favicon-enhancement, Property 4: Mobile Icon Specifications
    
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null), // Тестируем конкретный файл
        async () => {
          // Проверяем существование файла
          expect(existsSync(appleTouchIconPath)).toBe(true);
          
          // Читаем файл
          const pngBuffer = readFileSync(appleTouchIconPath);
          expect(pngBuffer.length).toBeGreaterThan(0);
          
          // Проверяем PNG заголовок
          // PNG файл начинается с: 89 50 4E 47 0D 0A 1A 0A
          expect(pngBuffer[0]).toBe(0x89);
          expect(pngBuffer[1]).toBe(0x50); // 'P'
          expect(pngBuffer[2]).toBe(0x4E); // 'N'
          expect(pngBuffer[3]).toBe(0x47); // 'G'
          expect(pngBuffer[4]).toBe(0x0D);
          expect(pngBuffer[5]).toBe(0x0A);
          expect(pngBuffer[6]).toBe(0x1A);
          expect(pngBuffer[7]).toBe(0x0A);
          
          // Читаем IHDR chunk для получения размеров
          // IHDR начинается с байта 8, длина chunk 4 байта, затем "IHDR"
          const ihdrLength = pngBuffer.readUInt32BE(8);
          expect(ihdrLength).toBe(13); // IHDR всегда 13 байт
          
          // Проверяем IHDR signature
          expect(pngBuffer[12]).toBe(0x49); // 'I'
          expect(pngBuffer[13]).toBe(0x48); // 'H'
          expect(pngBuffer[14]).toBe(0x44); // 'D'
          expect(pngBuffer[15]).toBe(0x52); // 'R'
          
          // Читаем ширину и высоту (4 байта каждая, big-endian)
          const width = pngBuffer.readUInt32BE(16);
          const height = pngBuffer.readUInt32BE(20);
          
          // Apple Touch Icon должен быть точно 180x180 пикселей
          expect(width).toBe(180);
          expect(height).toBe(180);
          
          // Проверяем bit depth (должен быть 8 для качественного изображения)
          const bitDepth = pngBuffer[24];
          expect(bitDepth).toBeGreaterThanOrEqual(8);
          
          // Проверяем color type (2 = RGB, 6 = RGBA)
          const colorType = pngBuffer[25];
          expect([2, 6]).toContain(colorType);
          
          // Проверяем размер файла (должен быть оптимизирован, но не слишком маленький)
          expect(pngBuffer.length).toBeGreaterThan(1000); // Минимум 1KB
          expect(pngBuffer.length).toBeLessThan(100 * 1024); // Максимум 100KB для производительности
        }
      ),
      { numRuns: 1 } // Тестируем один раз, так как файл статичный
    );
  });

  /**
   * Дополнительный property тест: Apple Touch Icon Quality
   * Проверяет качество и оптимизацию для Retina дисплеев
   */
  it('Property: Apple Touch Icon Quality - should be optimized for Retina displays', async () => {
    // Feature: favicon-enhancement, Property: Apple Touch Icon Quality
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          devicePixelRatio: fc.constantFrom(1, 2, 3) // Различные плотности пикселей
        }),
        async ({ devicePixelRatio }) => {
          expect(existsSync(appleTouchIconPath)).toBe(true);
          
          const pngBuffer = readFileSync(appleTouchIconPath);
          
          // Проверяем PNG заголовок
          expect(pngBuffer.slice(0, 8)).toEqual(
            Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
          );
          
          // Читаем размеры
          const width = pngBuffer.readUInt32BE(16);
          const height = pngBuffer.readUInt32BE(20);
          
          // 180x180 подходит для всех плотностей пикселей iOS
          expect(width).toBe(180);
          expect(height).toBe(180);
          
          // Проверяем качество изображения
          const bitDepth = pngBuffer[24];
          const colorType = pngBuffer[25];
          
          // Для Retina дисплеев нужно высокое качество
          if (devicePixelRatio >= 2) {
            expect(bitDepth).toBeGreaterThanOrEqual(8);
            expect([2, 6]).toContain(colorType); // RGB или RGBA
          }
          
          // Проверяем оптимизацию размера файла
          const fileSizeKB = pngBuffer.length / 1024;
          expect(fileSizeKB).toBeGreaterThan(1); // Не слишком сжато
          expect(fileSizeKB).toBeLessThan(50); // Но и не слишком большое
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Дополнительный property тест: Apple Touch Icon Accessibility
   * Проверяет доступность файла и корректность формата
   */
  it('Property: Apple Touch Icon Accessibility - should be accessible and valid PNG', async () => {
    // Feature: favicon-enhancement, Property: Apple Touch Icon Accessibility
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userAgent: fc.constantFrom(
            'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
            'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
          )
        }),
        async ({ userAgent }) => {
          // Проверяем существование и доступность файла
          expect(existsSync(appleTouchIconPath)).toBe(true);
          
          const pngBuffer = readFileSync(appleTouchIconPath);
          expect(pngBuffer.length).toBeGreaterThan(0);
          
          // Проверяем валидность PNG формата
          const pngSignature = pngBuffer.slice(0, 8);
          const expectedSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
          expect(pngSignature).toEqual(expectedSignature);
          
          // Проверяем наличие обязательных PNG chunks
          let offset = 8;
          let foundIHDR = false;
          let foundIEND = false;
          
          while (offset < pngBuffer.length - 8) {
            const chunkLength = pngBuffer.readUInt32BE(offset);
            const chunkType = pngBuffer.slice(offset + 4, offset + 8).toString('ascii');
            
            if (chunkType === 'IHDR') {
              foundIHDR = true;
              expect(chunkLength).toBe(13); // IHDR всегда 13 байт
            }
            
            if (chunkType === 'IEND') {
              foundIEND = true;
              expect(chunkLength).toBe(0); // IEND всегда 0 байт данных
              break;
            }
            
            // Переходим к следующему chunk
            offset += 4 + 4 + chunkLength + 4; // length + type + data + crc
          }
          
          expect(foundIHDR).toBe(true);
          expect(foundIEND).toBe(true);
          
          // Проверяем, что файл не поврежден
          expect(offset).toBeLessThanOrEqual(pngBuffer.length);
        }
      ),
      { numRuns: 5 }
    );
  });

  /**
   * Дополнительный property тест: Brand Requirements
   * Проверяет соответствие требованиям бренда (косвенно через размер и качество)
   */
  it('Property: Brand Requirements - should meet branding requirements for mobile', async () => {
    // Feature: favicon-enhancement, Property: Brand Requirements
    
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          expect(existsSync(appleTouchIconPath)).toBe(true);
          
          const pngBuffer = readFileSync(appleTouchIconPath);
          
          // Проверяем размеры (важно для брендинга)
          const width = pngBuffer.readUInt32BE(16);
          const height = pngBuffer.readUInt32BE(20);
          
          expect(width).toBe(180);
          expect(height).toBe(180);
          
          // Проверяем качество (важно для представления бренда)
          const bitDepth = pngBuffer[24];
          const colorType = pngBuffer[25];
          
          // Высокое качество для профессионального вида
          expect(bitDepth).toBeGreaterThanOrEqual(8);
          expect([2, 6]).toContain(colorType);
          
          // Размер файла должен быть достаточным для качественного изображения
          // но не слишком большим для производительности
          const fileSizeKB = pngBuffer.length / 1024;
          expect(fileSizeKB).toBeGreaterThan(0.5); // Минимум для валидного изображения
          expect(fileSizeKB).toBeLessThan(80); // Максимум для мобильной производительности
          
          // Проверяем, что изображение квадратное (требование Apple)
          expect(width).toBe(height);
        }
      ),
      { numRuns: 1 }
    );
  });
});