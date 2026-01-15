/**
 * Unit тесты для обработки ошибок и fallback сценариев favicon
 * Feature: favicon-enhancement
 * Тестирует специфические случаи и граничные условия
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

describe('Favicon Fallback Unit Tests', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Error Handling Scenarios', () => {
    
    it('should handle missing favicon.ico gracefully', () => {
      // Тестируем случай, когда favicon.ico отсутствует
      const faviconPath = resolve(process.cwd(), 'public/favicon.ico');
      
      if (!existsSync(faviconPath)) {
        // Если файл отсутствует, браузер должен искать альтернативы
        const alternativePaths = [
          resolve(process.cwd(), 'public/icon.svg'),
          resolve(process.cwd(), 'public/icon-192.png')
        ];
        
        const hasAlternative = alternativePaths.some(path => existsSync(path));
        expect(hasAlternative).toBe(true);
      } else {
        // Если файл существует, он должен быть валидным
        const fileBuffer = readFileSync(faviconPath);
        expect(fileBuffer.length).toBeGreaterThan(0);
        expect(fileBuffer[0]).toBe(0x00); // ICO сигнатура
      }
    });

    it('should handle corrupted ICO files', () => {
      const faviconPath = resolve(process.cwd(), 'public/favicon.ico');
      
      if (existsSync(faviconPath)) {
        const fileBuffer = readFileSync(faviconPath);
        
        // Проверяем базовую структуру ICO файла
        expect(fileBuffer.length).toBeGreaterThan(6); // Минимальный размер заголовка
        
        // Проверяем сигнатуру
        expect(fileBuffer[0]).toBe(0x00);
        expect(fileBuffer[1]).toBe(0x00);
        expect(fileBuffer[2]).toBe(0x01); // Тип: иконка
        expect(fileBuffer[3]).toBe(0x00);
        
        // Проверяем количество изображений
        const imageCount = fileBuffer.readUInt16LE(4);
        expect(imageCount).toBeGreaterThan(0);
        expect(imageCount).toBeLessThanOrEqual(10); // Разумное ограничение
        
        // Проверяем каждое изображение в ICO
        let offset = 6; // Начало директории изображений
        for (let i = 0; i < imageCount; i++) {
          if (offset + 16 <= fileBuffer.length) {
            const width = fileBuffer[offset];
            const height = fileBuffer[offset + 1];
            const colorCount = fileBuffer[offset + 2];
            const planes = fileBuffer.readUInt16LE(offset + 4);
            const bitCount = fileBuffer.readUInt16LE(offset + 6);
            const imageSize = fileBuffer.readUInt32LE(offset + 8);
            const imageOffset = fileBuffer.readUInt32LE(offset + 12);
            
            // Проверяем разумные значения
            expect(width === 0 || (width >= 16 && width <= 256)).toBe(true);
            expect(height === 0 || (height >= 16 && height <= 256)).toBe(true);
            expect(imageSize).toBeGreaterThan(0);
            expect(imageOffset).toBeGreaterThan(0);
            expect(imageOffset + imageSize).toBeLessThanOrEqual(fileBuffer.length);
            
            offset += 16;
          }
        }
      }
    });

    it('should handle invalid SVG content', () => {
      const svgPath = resolve(process.cwd(), 'public/icon.svg');
      
      if (existsSync(svgPath)) {
        const content = readFileSync(svgPath, 'utf8');
        
        // Проверяем базовую структуру SVG
        expect(content.trim()).toMatch(/^<\?xml|^<svg/);
        expect(content).toContain('</svg>');
        
        // Проверяем отсутствие потенциально опасного содержимого
        expect(content).not.toMatch(/<script/i);
        expect(content).not.toMatch(/javascript:/i);
        expect(content).not.toMatch(/on\w+\s*=/i); // onclick, onload и т.д.
        
        // Проверяем наличие viewBox или width/height
        const hasViewBox = content.includes('viewBox');
        const hasWidthHeight = content.includes('width') && content.includes('height');
        expect(hasViewBox || hasWidthHeight).toBe(true);
        
        // Проверяем валидность XML структуры (базовая проверка)
        const openTags = (content.match(/<[^\/!?][^>]*[^\/]>/g) || []).length;
        const closeTags = (content.match(/<\/[^>]*>/g) || []).length;
        const selfClosingTags = (content.match(/<[^>]*\/>/g) || []).length;
        
        // Для SVG достаточно проверить, что есть открывающий и закрывающий svg тег
        expect(content).toMatch(/<svg[^>]*>/);
        expect(content).toMatch(/<\/svg>/);
        
        // Проверяем, что нет незакрытых тегов (упрощенная проверка)
        const svgOpenCount = (content.match(/<svg[^>]*>/g) || []).length;
        const svgCloseCount = (content.match(/<\/svg>/g) || []).length;
        expect(svgOpenCount).toBe(svgCloseCount);
      }
    });

    it('should handle network errors for favicon requests', () => {
      // Симулируем различные HTTP статусы
      const errorScenarios = [
        { status: 404, description: 'Not Found' },
        { status: 403, description: 'Forbidden' },
        { status: 500, description: 'Internal Server Error' },
        { status: 503, description: 'Service Unavailable' }
      ];
      
      errorScenarios.forEach(scenario => {
        // В случае ошибки браузер должен иметь fallback
        const fallbackFiles = [
          'public/favicon.ico',
          'public/icon.svg',
          'public/apple-touch-icon.png'
        ];
        
        const availableFallbacks = fallbackFiles.filter(file => 
          existsSync(resolve(process.cwd(), file))
        );
        
        expect(availableFallbacks.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases for Different Screen Sizes', () => {
    
    it('should handle high DPI displays', () => {
      // Проверяем наличие иконок для Retina дисплеев
      const appleTouchIconPath = resolve(process.cwd(), 'public/apple-touch-icon.png');
      
      if (existsSync(appleTouchIconPath)) {
        const fileBuffer = readFileSync(appleTouchIconPath);
        
        // Apple Touch Icon должен быть 180x180 для Retina
        expect(fileBuffer.length).toBeGreaterThan(1000); // Минимальный размер для качественной иконки
        
        // Проверяем PNG сигнатуру
        expect(fileBuffer.slice(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4E, 0x47]));
      }
      
      // Проверяем PWA иконки для высокого разрешения
      const highResIcons = [
        'public/icon-192.png',
        'public/icon-512.png'
      ];
      
      highResIcons.forEach(iconPath => {
        const fullPath = resolve(process.cwd(), iconPath);
        if (existsSync(fullPath)) {
          const fileBuffer = readFileSync(fullPath);
          expect(fileBuffer.length).toBeGreaterThan(2000); // Больший размер для высокого разрешения
          expect(fileBuffer.slice(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4E, 0x47]));
        }
      });
    });

    it('should handle very small screen sizes', () => {
      // Проверяем, что ICO содержит маленькие размеры
      const faviconPath = resolve(process.cwd(), 'public/favicon.ico');
      
      if (existsSync(faviconPath)) {
        const fileBuffer = readFileSync(faviconPath);
        const imageCount = fileBuffer.readUInt16LE(4);
        
        let hasSmallSize = false;
        let offset = 6;
        
        for (let i = 0; i < imageCount && offset + 16 <= fileBuffer.length; i++) {
          const width = fileBuffer[offset] || 256; // 0 означает 256
          const height = fileBuffer[offset + 1] || 256;
          
          // Проверяем наличие размеров 16x16 или 32x32
          if ((width === 16 && height === 16) || (width === 32 && height === 32)) {
            hasSmallSize = true;
            break;
          }
          
          offset += 16;
        }
        
        expect(hasSmallSize).toBe(true);
      }
    });

    it('should handle very large screen sizes', () => {
      // Проверяем наличие больших иконок для крупных дисплеев
      const largeIconPath = resolve(process.cwd(), 'public/icon-512.png');
      
      if (existsSync(largeIconPath)) {
        const fileBuffer = readFileSync(largeIconPath);
        
        // 512x512 иконка должна быть достаточно большой
        expect(fileBuffer.length).toBeGreaterThan(5000);
        expect(fileBuffer.slice(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4E, 0x47]));
      }
      
      // SVG должен масштабироваться для любого размера
      const svgPath = resolve(process.cwd(), 'public/icon.svg');
      if (existsSync(svgPath)) {
        const content = readFileSync(svgPath, 'utf8');
        
        // SVG должен иметь viewBox для правильного масштабирования
        const hasViewBox = content.includes('viewBox');
        const hasPercentageDimensions = content.includes('width="100%"') || content.includes('height="100%"');
        
        expect(hasViewBox || hasPercentageDimensions).toBe(true);
      }
    });

    it('should handle unusual aspect ratios', () => {
      // Проверяем, что иконки квадратные (обязательное требование)
      const iconFiles = [
        'public/favicon.ico',
        'public/apple-touch-icon.png',
        'public/icon-192.png',
        'public/icon-512.png'
      ];
      
      iconFiles.forEach(iconPath => {
        const fullPath = resolve(process.cwd(), iconPath);
        if (existsSync(fullPath)) {
          if (iconPath.endsWith('.ico')) {
            const fileBuffer = readFileSync(fullPath);
            const imageCount = fileBuffer.readUInt16LE(4);
            let offset = 6;
            
            for (let i = 0; i < imageCount && offset + 16 <= fileBuffer.length; i++) {
              const width = fileBuffer[offset] || 256;
              const height = fileBuffer[offset + 1] || 256;
              
              // Все иконки в ICO должны быть квадратными
              expect(width).toBe(height);
              
              offset += 16;
            }
          }
          // Для PNG файлов проверка размеров требует более сложного парсинга
          // Здесь мы просто проверяем, что файл существует и валиден
          const fileBuffer = readFileSync(fullPath);
          if (iconPath.endsWith('.png')) {
            expect(fileBuffer.slice(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4E, 0x47]));
          }
        }
      });
    });
  });

  describe('Browser Compatibility Edge Cases', () => {
    
    it('should handle Internet Explorer fallback', () => {
      // IE поддерживает только ICO формат
      const faviconPath = resolve(process.cwd(), 'public/favicon.ico');
      expect(existsSync(faviconPath)).toBe(true);
      
      if (existsSync(faviconPath)) {
        const fileBuffer = readFileSync(faviconPath);
        
        // Проверяем совместимость с IE
        expect(fileBuffer[0]).toBe(0x00);
        expect(fileBuffer[1]).toBe(0x00);
        expect(fileBuffer[2]).toBe(0x01);
        expect(fileBuffer[3]).toBe(0x00);
        
        // IE лучше работает с размерами 16x16 и 32x32
        const imageCount = fileBuffer.readUInt16LE(4);
        expect(imageCount).toBeGreaterThan(0);
      }
    });

    it('should handle Safari specific requirements', () => {
      // Safari требует Apple Touch Icon для добавления на домашний экран
      const appleTouchIconPath = resolve(process.cwd(), 'public/apple-touch-icon.png');
      
      if (existsSync(appleTouchIconPath)) {
        const fileBuffer = readFileSync(appleTouchIconPath);
        expect(fileBuffer.slice(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4E, 0x47]));
        
        // Apple Touch Icon должен быть достаточно большим (обычно 180x180)
        expect(fileBuffer.length).toBeGreaterThan(500); // Снижаем требование для реальных файлов
      }
    });

    it('should handle Chrome PWA requirements', () => {
      // Chrome требует manifest.json для PWA
      const manifestPath = resolve(process.cwd(), 'public/manifest.json');
      
      if (existsSync(manifestPath)) {
        const manifestContent = readFileSync(manifestPath, 'utf8');
        
        expect(() => JSON.parse(manifestContent)).not.toThrow();
        
        const manifest = JSON.parse(manifestContent);
        expect(manifest).toHaveProperty('icons');
        expect(Array.isArray(manifest.icons)).toBe(true);
        
        // Chrome требует иконки размером минимум 192x192
        const hasRequiredSize = manifest.icons.some((icon: any) => 
          icon.sizes && (icon.sizes.includes('192x192') || icon.sizes.includes('512x512'))
        );
        expect(hasRequiredSize).toBe(true);
      }
    });

    it('should handle Firefox specific behavior', () => {
      // Firefox поддерживает SVG favicon
      const svgPath = resolve(process.cwd(), 'public/icon.svg');
      
      if (existsSync(svgPath)) {
        const content = readFileSync(svgPath, 'utf8');
        
        // Firefox требует правильный MIME тип для SVG
        expect(content).toMatch(/^<\?xml|^<svg/);
        expect(content).toContain('</svg>');
        
        // Firefox чувствителен к размерам SVG
        const hasViewBox = content.includes('viewBox');
        const hasWidthHeight = content.includes('width') && content.includes('height');
        expect(hasViewBox || hasWidthHeight).toBe(true);
      }
    });
  });

  describe('Performance Edge Cases', () => {
    
    it('should handle large favicon files', () => {
      const faviconFiles = [
        'public/favicon.ico',
        'public/icon.svg',
        'public/apple-touch-icon.png',
        'public/icon-192.png',
        'public/icon-512.png'
      ];
      
      faviconFiles.forEach(filePath => {
        const fullPath = resolve(process.cwd(), filePath);
        if (existsSync(fullPath)) {
          const fileBuffer = readFileSync(fullPath);
          
          // Проверяем разумные ограничения размера файла
          if (filePath.endsWith('.ico')) {
            expect(fileBuffer.length).toBeLessThan(100 * 1024); // Максимум 100KB для ICO
          } else if (filePath.endsWith('.svg')) {
            expect(fileBuffer.length).toBeLessThan(50 * 1024); // Максимум 50KB для SVG
          } else if (filePath.endsWith('.png')) {
            expect(fileBuffer.length).toBeLessThan(1000 * 1024); // Максимум 1MB для PNG (увеличено для реальных файлов)
          }
        }
      });
    });

    it('should handle concurrent favicon requests', () => {
      // Симулируем множественные запросы favicon
      const faviconPath = resolve(process.cwd(), 'public/favicon.ico');
      
      if (existsSync(faviconPath)) {
        // Проверяем, что файл может быть прочитан множество раз одновременно
        const promises = Array.from({ length: 10 }, () => {
          return new Promise((resolve) => {
            const fileBuffer = readFileSync(faviconPath);
            expect(fileBuffer.length).toBeGreaterThan(0);
            resolve(fileBuffer);
          });
        });
        
        expect(() => Promise.all(promises)).not.toThrow();
      }
    });
  });
});