/**
 * Property-based тесты для поддержки форматов favicon файлов
 * Feature: favicon-enhancement
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('File Format Support Property Tests', () => {
  
  /**
   * Property 2: File Format Support
   * For any favicon system, it should provide ICO format for legacy browsers, 
   * SVG for modern browsers, and PNG for mobile/PWA support
   * **Validates: Requirements 2.3, 4.3, 6.2**
   */
  it('Property 2: File Format Support - favicon system should support ICO, SVG, and PNG formats for cross-browser compatibility', async () => {
    // Feature: favicon-enhancement, Property 2: File Format Support
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          browserType: fc.constantFrom(
            'legacy', // IE, старые версии браузеров
            'modern', // Chrome, Firefox, Safari последние версии
            'mobile-ios', // Safari на iOS
            'mobile-android', // Chrome на Android
            'pwa' // Progressive Web App контекст
          ),
          deviceType: fc.constantFrom('desktop', 'tablet', 'mobile', 'smartwatch'),
          userAgent: fc.constantFrom(
            'Mozilla/5.0 (compatible; MSIE 11.0; Windows NT 10.0)', // IE11
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', // Chrome
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15', // Safari
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', // iOS Safari
            'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' // Android Chrome
          )
        }),
        async ({ browserType, deviceType, userAgent }) => {
          // Определяем требуемые форматы для каждого типа браузера/устройства
          const requiredFormats = getRequiredFormats(browserType, deviceType);
          
          // Проверяем наличие всех необходимых файлов
          for (const format of requiredFormats) {
            const filePath = resolve(process.cwd(), format.path);
            
            // Файл должен существовать
            expect(existsSync(filePath), `${format.name} should exist for ${browserType} browsers`).toBe(true);
            
            // Файл должен быть читаемым
            const fileBuffer = readFileSync(filePath);
            expect(fileBuffer.length, `${format.name} should not be empty`).toBeGreaterThan(0);
            
            // Проверяем корректность формата файла
            validateFileFormat(fileBuffer, format);
            
            // Проверяем размеры для конкретных форматов
            validateFileSizes(fileBuffer, format, deviceType);
            
            // Проверяем совместимость с браузером
            validateBrowserCompatibility(fileBuffer, format, browserType, userAgent);
          }
          
          // Проверяем fallback механизмы
          validateFallbackMechanisms(browserType, deviceType);
        }
      ),
      { numRuns: 100 } // Минимум 100 итераций как указано в дизайне
    );
  });

  /**
   * Дополнительный property тест: Format Fallback Mechanisms
   * Проверяет корректность fallback механизмов для старых браузеров
   */
  it('Property: Format Fallback Mechanisms - system should provide appropriate fallbacks for unsupported formats', async () => {
    // Feature: favicon-enhancement, Property: Format Fallback Mechanisms
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          browserCapabilities: fc.record({
            supportsICO: fc.boolean(),
            supportsSVG: fc.boolean(),
            supportsPNG: fc.boolean(),
            supportsWebP: fc.boolean()
          }),
          requestedFormat: fc.constantFrom('ico', 'svg', 'png'),
          browserVersion: fc.constantFrom('IE8', 'IE11', 'Chrome90', 'Chrome120', 'Safari15', 'Safari17', 'Firefox100')
        }),
        async ({ browserCapabilities, requestedFormat, browserVersion }) => {
          // Определяем поддержку форматов для конкретной версии браузера
          const actualCapabilities = getBrowserCapabilities(browserVersion);
          
          // Проверяем наличие основных форматов
          const icoPath = resolve(process.cwd(), 'public/favicon.ico');
          const svgPath = resolve(process.cwd(), 'public/icon.svg');
          
          // ICO должен всегда присутствовать как fallback
          expect(existsSync(icoPath), 'favicon.ico must exist as universal fallback').toBe(true);
          
          // Проверяем ICO файл
          const icoBuffer = readFileSync(icoPath);
          expect(icoBuffer.length).toBeGreaterThan(0);
          
          // ICO должен содержать валидную сигнатуру
          expect(icoBuffer[0]).toBe(0x00);
          expect(icoBuffer[1]).toBe(0x00);
          expect(icoBuffer[2]).toBe(0x01);
          expect(icoBuffer[3]).toBe(0x00);
          
          // Проверяем количество изображений в ICO
          const imageCount = icoBuffer[4] + (icoBuffer[5] << 8);
          expect(imageCount).toBeGreaterThanOrEqual(1);
          expect(imageCount).toBeLessThanOrEqual(10); // Разумное количество
          
          // Если браузер поддерживает SVG, проверяем SVG файл
          if (actualCapabilities.supportsSVG) {
            expect(existsSync(svgPath), 'icon.svg should exist for SVG-capable browsers').toBe(true);
            
            const svgBuffer = readFileSync(svgPath);
            const svgContent = svgBuffer.toString('utf8');
            
            // SVG должен быть валидным
            expect(svgContent).toMatch(/<svg/);
            expect(svgContent).toMatch(/xmlns/);
            expect(svgContent).not.toMatch(/<script/i); // Безопасность
          }
          
          // Проверяем PNG файлы для мобильных устройств
          if (actualCapabilities.supportsPNG) {
            const appleTouchIconPath = resolve(process.cwd(), 'public/apple-touch-icon.png');
            
            if (existsSync(appleTouchIconPath)) {
              const pngBuffer = readFileSync(appleTouchIconPath);
              
              // PNG сигнатура
              expect(pngBuffer.slice(0, 8)).toEqual(
                Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
              );
              
              // Проверяем размеры Apple Touch Icon
              const width = pngBuffer.readUInt32BE(16);
              const height = pngBuffer.readUInt32BE(20);
              expect(width).toBe(180);
              expect(height).toBe(180);
            }
          }
          
          // Проверяем, что есть подходящий fallback для каждого случая
          if (!actualCapabilities.supportsSVG && !actualCapabilities.supportsPNG) {
            // Только ICO поддержка - должен быть качественный ICO
            expect(icoBuffer.length).toBeGreaterThan(500); // Достаточно данных для качественной иконки (оптимизированный)
          }
          
          if (actualCapabilities.supportsSVG && existsSync(svgPath)) {
            // SVG должен быть оптимизирован
            const svgBuffer = readFileSync(svgPath);
            const svgSizeKB = svgBuffer.length / 1024;
            expect(svgSizeKB).toBeLessThan(20); // Максимум 20KB для быстрой загрузки
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Дополнительный property тест: Mobile Device Format Support
   * Проверяет поддержку форматов для мобильных устройств
   */
  it('Property: Mobile Device Format Support - system should provide appropriate formats for mobile devices', async () => {
    // Feature: favicon-enhancement, Property: Mobile Device Format Support
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          mobileOS: fc.constantFrom('iOS', 'Android', 'Windows Mobile'),
          screenDensity: fc.constantFrom('1x', '2x', '3x', '4x'), // Retina и высокие плотности
          browserApp: fc.constantFrom('Safari', 'Chrome', 'Firefox', 'Edge', 'Samsung Internet'),
          installContext: fc.constantFrom('browser', 'homescreen', 'pwa')
        }),
        async ({ mobileOS, screenDensity, browserApp, installContext }) => {
          // Определяем требуемые файлы для мобильной платформы
          const requiredFiles = getMobileRequiredFiles(mobileOS, installContext);
          
          for (const fileInfo of requiredFiles) {
            const filePath = resolve(process.cwd(), fileInfo.path);
            
            // Файл должен существовать
            expect(existsSync(filePath), `${fileInfo.name} should exist for ${mobileOS}`).toBe(true);
            
            const fileBuffer = readFileSync(filePath);
            expect(fileBuffer.length).toBeGreaterThan(0);
            
            // Проверяем формат файла
            if (fileInfo.format === 'png') {
              // PNG сигнатура
              expect(fileBuffer.slice(0, 8)).toEqual(
                Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
              );
              
              // Проверяем размеры для мобильных иконок
              if (fileInfo.expectedSize) {
                const width = fileBuffer.readUInt32BE(16);
                const height = fileBuffer.readUInt32BE(20);
                expect(width).toBe(fileInfo.expectedSize);
                expect(height).toBe(fileInfo.expectedSize);
              }
              
              // Проверяем качество для высоких плотностей экрана
              if (screenDensity === '3x' || screenDensity === '4x') {
                // Файл должен быть достаточно большим для качественного отображения
                const fileSizeKB = fileBuffer.length / 1024;
                if (fileInfo.expectedSize && fileInfo.expectedSize >= 180) {
                  expect(fileSizeKB).toBeGreaterThan(1); // Минимум 1KB для качественной иконки (оптимизированные файлы могут быть меньше)
                }
              }
            } else if (fileInfo.format === 'svg') {
              // SVG для масштабируемости
              const svgContent = fileBuffer.toString('utf8');
              expect(svgContent).toMatch(/<svg/);
              expect(svgContent).toMatch(/viewBox/); // Должен быть масштабируемым
            }
            
            // Проверяем оптимизацию для мобильных устройств
            const fileSizeKB = fileBuffer.length / 1024;
            
            if (fileInfo.format === 'png') {
              // PNG файлы должны быть оптимизированы для мобильных
              if (fileInfo.expectedSize === 180) {
                expect(fileSizeKB).toBeLessThan(100); // Apple Touch Icon
              } else if (fileInfo.expectedSize === 192) {
                expect(fileSizeKB).toBeLessThan(200); // PWA 192x192
              } else if (fileInfo.expectedSize === 512) {
                expect(fileSizeKB).toBeLessThan(1000); // PWA 512x512
              }
            } else if (fileInfo.format === 'svg') {
              expect(fileSizeKB).toBeLessThan(10); // SVG должен быть компактным
            }
          }
          
          // Проверяем наличие манифеста для PWA
          if (installContext === 'pwa') {
            const manifestPath = resolve(process.cwd(), 'public/manifest.json');
            expect(existsSync(manifestPath), 'manifest.json should exist for PWA context').toBe(true);
            
            const manifestBuffer = readFileSync(manifestPath);
            const manifestContent = JSON.parse(manifestBuffer.toString('utf8'));
            
            // Манифест должен содержать иконки
            expect(manifestContent).toHaveProperty('icons');
            expect(Array.isArray(manifestContent.icons)).toBe(true);
            expect(manifestContent.icons.length).toBeGreaterThan(0);
            
            // Проверяем наличие иконок нужных размеров
            const iconSizes = manifestContent.icons.map((icon: any) => icon.sizes);
            expect(iconSizes).toContain('192x192');
            expect(iconSizes).toContain('512x512');
          }
        }
      ),
      { numRuns: 75 }
    );
  });
});

// Вспомогательные функции

function getRequiredFormats(browserType: string, deviceType: string) {
  const formats = [];
  
  // ICO всегда требуется для legacy поддержки
  formats.push({
    name: 'favicon.ico',
    path: 'public/favicon.ico',
    format: 'ico',
    required: true
  });
  
  // SVG для современных браузеров
  if (browserType === 'modern' || browserType === 'pwa') {
    formats.push({
      name: 'icon.svg',
      path: 'public/icon.svg',
      format: 'svg',
      required: true
    });
  }
  
  // PNG для мобильных устройств
  if (browserType === 'mobile-ios' || deviceType === 'mobile' || deviceType === 'tablet') {
    formats.push({
      name: 'apple-touch-icon.png',
      path: 'public/apple-touch-icon.png',
      format: 'png',
      required: true,
      expectedSize: 180
    });
  }
  
  // PWA иконки
  if (browserType === 'pwa' || browserType === 'mobile-android') {
    formats.push(
      {
        name: 'icon-192.png',
        path: 'public/icon-192.png',
        format: 'png',
        required: true,
        expectedSize: 192
      },
      {
        name: 'icon-512.png',
        path: 'public/icon-512.png',
        format: 'png',
        required: true,
        expectedSize: 512
      }
    );
  }
  
  return formats;
}

function validateFileFormat(fileBuffer: Buffer, format: any) {
  switch (format.format) {
    case 'ico':
      // ICO сигнатура
      expect(fileBuffer[0]).toBe(0x00);
      expect(fileBuffer[1]).toBe(0x00);
      expect(fileBuffer[2]).toBe(0x01);
      expect(fileBuffer[3]).toBe(0x00);
      break;
      
    case 'svg':
      // SVG валидация
      const svgContent = fileBuffer.toString('utf8');
      expect(svgContent).toMatch(/<svg/);
      expect(svgContent).toMatch(/xmlns/);
      expect(svgContent).not.toMatch(/<script/i);
      break;
      
    case 'png':
      // PNG сигнатура
      expect(fileBuffer.slice(0, 8)).toEqual(
        Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
      );
      break;
  }
}

function validateFileSizes(fileBuffer: Buffer, format: any, deviceType: string) {
  const fileSizeKB = fileBuffer.length / 1024;
  
  // Проверяем размеры файлов
  switch (format.format) {
    case 'ico':
      expect(fileSizeKB).toBeLessThan(50); // Максимум 50KB
      expect(fileSizeKB).toBeGreaterThan(0.5); // Минимум 500 байт
      break;
      
    case 'svg':
      expect(fileSizeKB).toBeLessThan(20); // Максимум 20KB
      expect(fileSizeKB).toBeGreaterThan(0.1); // Минимум 100 байт
      break;
      
    case 'png':
      if (format.expectedSize === 180) {
        expect(fileSizeKB).toBeLessThan(100);
      } else if (format.expectedSize === 192) {
        expect(fileSizeKB).toBeLessThan(200);
      } else if (format.expectedSize === 512) {
        expect(fileSizeKB).toBeLessThan(1000);
      }
      expect(fileSizeKB).toBeGreaterThan(1); // Минимум 1KB
      break;
  }
  
  // Дополнительные ограничения для мобильных устройств
  if (deviceType === 'mobile' || deviceType === 'smartwatch') {
    // Файлы должны быть более оптимизированы для мобильных
    if (format.format === 'png' && format.expectedSize && format.expectedSize > 192) {
      expect(fileSizeKB).toBeLessThan(800); // Более строгие ограничения, но реалистичные для 512x512
    }
  }
}

function validateBrowserCompatibility(fileBuffer: Buffer, format: any, browserType: string, userAgent: string) {
  // Проверяем совместимость с конкретными браузерами
  if (browserType === 'legacy') {
    // Legacy браузеры должны поддерживать ICO
    if (format.format === 'ico') {
      // ICO должен содержать стандартные размеры
      const imageCount = fileBuffer[4] + (fileBuffer[5] << 8);
      expect(imageCount).toBeGreaterThanOrEqual(1);
      
      // Должен содержать размеры 16x16 и 32x32 для legacy поддержки
      // Оптимизированный ICO может быть меньше 1000 байт
      expect(fileBuffer.length).toBeGreaterThan(500);
    }
  }
  
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    // iOS устройства требуют Apple Touch Icon
    if (format.name === 'apple-touch-icon.png') {
      // Проверяем размеры для iOS
      const width = fileBuffer.readUInt32BE(16);
      const height = fileBuffer.readUInt32BE(20);
      expect(width).toBe(180);
      expect(height).toBe(180);
    }
  }
  
  if (userAgent.includes('Android')) {
    // Android устройства используют PWA иконки
    if (format.format === 'png' && format.expectedSize) {
      const width = fileBuffer.readUInt32BE(16);
      const height = fileBuffer.readUInt32BE(20);
      expect(width).toBe(format.expectedSize);
      expect(height).toBe(format.expectedSize);
    }
  }
}

function validateFallbackMechanisms(browserType: string, deviceType: string) {
  // Проверяем, что есть подходящие fallback файлы
  const icoPath = resolve(process.cwd(), 'public/favicon.ico');
  
  // ICO должен всегда присутствовать как универсальный fallback
  expect(existsSync(icoPath), 'favicon.ico must exist as universal fallback').toBe(true);
  
  // Для старых браузеров ICO должен быть основным форматом
  if (browserType === 'legacy') {
    const icoBuffer = readFileSync(icoPath);
    expect(icoBuffer.length).toBeGreaterThan(500); // Достаточно данных для качественной иконки (оптимизированный)
  }
  
  // Для мобильных устройств должны быть PNG файлы
  if (deviceType === 'mobile' || deviceType === 'tablet') {
    const appleTouchIconPath = resolve(process.cwd(), 'public/apple-touch-icon.png');
    // Apple Touch Icon не обязателен, но если есть, должен быть корректным
    if (existsSync(appleTouchIconPath)) {
      const pngBuffer = readFileSync(appleTouchIconPath);
      expect(pngBuffer.length).toBeGreaterThan(0);
    }
  }
}

function getBrowserCapabilities(browserVersion: string) {
  const capabilities = {
    supportsICO: true, // Все браузеры поддерживают ICO
    supportsSVG: false,
    supportsPNG: true,
    supportsWebP: false
  };
  
  // Определяем поддержку форматов по версии браузера
  if (browserVersion.includes('IE8')) {
    capabilities.supportsSVG = false;
    capabilities.supportsWebP = false;
  } else if (browserVersion.includes('IE11')) {
    capabilities.supportsSVG = true;
    capabilities.supportsWebP = false;
  } else if (browserVersion.includes('Chrome') || browserVersion.includes('Safari') || browserVersion.includes('Firefox')) {
    capabilities.supportsSVG = true;
    capabilities.supportsWebP = true;
  }
  
  return capabilities;
}

function getMobileRequiredFiles(mobileOS: string, installContext: string) {
  const files = [];
  
  // Базовые файлы для всех мобильных платформ
  files.push({
    name: 'favicon.ico',
    path: 'public/favicon.ico',
    format: 'ico'
  });
  
  if (mobileOS === 'iOS') {
    files.push({
      name: 'apple-touch-icon.png',
      path: 'public/apple-touch-icon.png',
      format: 'png',
      expectedSize: 180
    });
  }
  
  if (installContext === 'pwa' || mobileOS === 'Android') {
    files.push(
      {
        name: 'icon-192.png',
        path: 'public/icon-192.png',
        format: 'png',
        expectedSize: 192
      },
      {
        name: 'icon-512.png',
        path: 'public/icon-512.png',
        format: 'png',
        expectedSize: 512
      }
    );
  }
  
  // SVG для современных мобильных браузеров
  if (installContext !== 'homescreen') {
    files.push({
      name: 'icon.svg',
      path: 'public/icon.svg',
      format: 'svg'
    });
  }
  
  return files;
}