/**
 * Интеграционные property-based тесты для полного цикла favicon
 * Feature: favicon-enhancement
 * Validates: Requirements 3.2, 4.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

// Мок для браузерного окружения
const mockBrowserEnvironments = [
  { name: 'Chrome', version: '120.0', supportsSVG: true, supportsICO: true, supportsPWA: true },
  { name: 'Firefox', version: '121.0', supportsSVG: true, supportsICO: true, supportsPWA: true },
  { name: 'Safari', version: '17.0', supportsSVG: true, supportsICO: true, supportsPWA: true },
  { name: 'Edge', version: '120.0', supportsSVG: true, supportsICO: true, supportsPWA: true },
  { name: 'IE', version: '11.0', supportsSVG: false, supportsICO: true, supportsPWA: false },
  { name: 'Opera', version: '106.0', supportsSVG: true, supportsICO: true, supportsPWA: true }
];

// Мок для мобильных устройств
const mockMobileDevices = [
  { name: 'iPhone', os: 'iOS', version: '17.0', requiresAppleTouchIcon: true, supportsPWA: true },
  { name: 'iPad', os: 'iOS', version: '17.0', requiresAppleTouchIcon: true, supportsPWA: true },
  { name: 'Android Phone', os: 'Android', version: '14.0', requiresAppleTouchIcon: false, supportsPWA: true },
  { name: 'Android Tablet', os: 'Android', version: '14.0', requiresAppleTouchIcon: false, supportsPWA: true }
];

describe('Favicon Integration Property Tests', () => {
  
  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    vi.clearAllMocks();
  });

  /**
   * Интеграционный тест для загрузки favicon в различных браузерах
   * Validates: Requirements 3.2
   */
  it('Integration: Favicon Loading Across Browsers - should load appropriate favicon format for each browser', async () => {
    // Feature: favicon-enhancement, Integration: Favicon Loading Across Browsers
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          browser: fc.constantFrom(...mockBrowserEnvironments),
          userAgent: fc.string({ minLength: 10, maxLength: 200 }),
          acceptHeader: fc.constantFrom(
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'image/webp,image/apng,image/*,*/*;q=0.8'
          )
        }),
        async ({ browser, userAgent, acceptHeader }) => {
          // Проверяем наличие всех необходимых favicon файлов
          const faviconFiles = [
            { path: 'public/favicon.ico', required: true },
            { path: 'public/icon.svg', required: browser.supportsSVG },
            { path: 'public/apple-touch-icon.png', required: false },
            { path: 'public/icon-192.png', required: browser.supportsPWA },
            { path: 'public/icon-512.png', required: browser.supportsPWA }
          ];

          for (const file of faviconFiles) {
            const filePath = resolve(process.cwd(), file.path);
            const fileExists = existsSync(filePath);
            
            if (file.required) {
              expect(fileExists).toBe(true);
              
              if (fileExists) {
                const fileBuffer = readFileSync(filePath);
                expect(fileBuffer.length).toBeGreaterThan(0);
                
                // Проверяем формат файла
                if (file.path.endsWith('.ico')) {
                  // ICO файл должен начинаться с правильной сигнатуры
                  expect(fileBuffer[0]).toBe(0x00);
                  expect(fileBuffer[1]).toBe(0x00);
                  expect(fileBuffer[2]).toBe(0x01); // Тип: иконка
                  expect(fileBuffer[3]).toBe(0x00);
                } else if (file.path.endsWith('.svg')) {
                  const content = fileBuffer.toString('utf8');
                  expect(content).toMatch(/^<\?xml|^<svg/);
                  expect(content).toContain('</svg>');
                } else if (file.path.endsWith('.png')) {
                  // PNG сигнатура
                  expect(fileBuffer.slice(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4E, 0x47]));
                }
              }
            }
          }

          // Симулируем выбор favicon браузером
          let selectedFavicon: string;
          if (browser.supportsSVG && existsSync(resolve(process.cwd(), 'public/icon.svg'))) {
            selectedFavicon = 'icon.svg';
          } else if (browser.supportsICO && existsSync(resolve(process.cwd(), 'public/favicon.ico'))) {
            selectedFavicon = 'favicon.ico';
          } else {
            throw new Error(`No suitable favicon found for browser ${browser.name}`);
          }

          expect(selectedFavicon).toBeDefined();
          expect(['favicon.ico', 'icon.svg']).toContain(selectedFavicon);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Интеграционный тест для PWA установки с корректными иконками
   * Validates: Requirements 4.2
   */
  it('Integration: PWA Installation with Icons - should provide correct icons for PWA installation', async () => {
    // Feature: favicon-enhancement, Integration: PWA Installation with Icons
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          device: fc.constantFrom(...mockMobileDevices),
          installationContext: fc.constantFrom('homescreen', 'browser_menu', 'app_banner'),
          networkCondition: fc.constantFrom('online', 'offline', 'slow_3g', 'fast_3g')
        }),
        async ({ device, installationContext, networkCondition }) => {
          // Проверяем наличие manifest.json
          const manifestPath = resolve(process.cwd(), 'public/manifest.json');
          expect(existsSync(manifestPath)).toBe(true);
          
          const manifestContent = readFileSync(manifestPath, 'utf8');
          const manifest = JSON.parse(manifestContent);
          
          // Проверяем структуру манифеста
          expect(manifest).toHaveProperty('name');
          expect(manifest).toHaveProperty('short_name');
          expect(manifest).toHaveProperty('icons');
          expect(manifest).toHaveProperty('theme_color');
          expect(manifest).toHaveProperty('background_color');
          expect(manifest).toHaveProperty('display');
          
          // Проверяем иконки в манифесте
          expect(Array.isArray(manifest.icons)).toBe(true);
          expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
          
          // Проверяем наличие обязательных размеров для PWA
          const iconSizes = manifest.icons.map((icon: any) => icon.sizes);
          expect(iconSizes).toContain('192x192');
          expect(iconSizes).toContain('512x512');
          
          // Проверяем физическое наличие файлов иконок
          for (const icon of manifest.icons) {
            const iconPath = resolve(process.cwd(), 'public', icon.src.replace(/^\//, ''));
            expect(existsSync(iconPath)).toBe(true);
            
            const iconBuffer = readFileSync(iconPath);
            expect(iconBuffer.length).toBeGreaterThan(0);
            
            // Проверяем PNG сигнатуру
            expect(iconBuffer.slice(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4E, 0x47]));
          }
          
          // Для iOS устройств проверяем Apple Touch Icon
          if (device.requiresAppleTouchIcon) {
            const appleTouchIconPath = resolve(process.cwd(), 'public/apple-touch-icon.png');
            expect(existsSync(appleTouchIconPath)).toBe(true);
            
            const appleTouchIconBuffer = readFileSync(appleTouchIconPath);
            expect(appleTouchIconBuffer.length).toBeGreaterThan(0);
            expect(appleTouchIconBuffer.slice(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4E, 0x47]));
          }
          
          // Проверяем цветовую схему
          expect(manifest.theme_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
          expect(manifest.background_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
          
          // Проверяем режим отображения
          expect(['standalone', 'fullscreen', 'minimal-ui', 'browser']).toContain(manifest.display);
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Интеграционный тест для полного цикла favicon в различных контекстах
   */
  it('Integration: Complete Favicon Lifecycle - should handle favicon across all contexts', async () => {
    // Feature: favicon-enhancement, Integration: Complete Favicon Lifecycle
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          context: fc.constantFrom('browser_tab', 'bookmark', 'history', 'search_results', 'homescreen', 'pwa_install'),
          browser: fc.constantFrom(...mockBrowserEnvironments),
          device: fc.constantFrom(...mockMobileDevices),
          cacheStatus: fc.constantFrom('fresh', 'cached', 'expired')
        }),
        async ({ context, browser, device, cacheStatus }) => {
          // Проверяем HTML структуру
          const indexPath = resolve(process.cwd(), 'index.html');
          expect(existsSync(indexPath)).toBe(true);
          
          const htmlContent = readFileSync(indexPath, 'utf8');
          
          // Проверяем наличие всех необходимых link элементов
          expect(htmlContent).toMatch(/<link[^>]*rel=["']icon["'][^>]*>/);
          expect(htmlContent).toMatch(/<link[^>]*rel=["']manifest["'][^>]*>/);
          
          // Для мобильных контекстов проверяем Apple Touch Icon
          if (['homescreen', 'pwa_install'].includes(context) && device.requiresAppleTouchIcon) {
            expect(htmlContent).toMatch(/<link[^>]*rel=["']apple-touch-icon["'][^>]*>/);
          }
          
          // Проверяем порядок fallback (ICO перед SVG)
          const iconMatches = htmlContent.match(/<link[^>]*rel=["']icon["'][^>]*>/g) || [];
          if (iconMatches.length > 1) {
            const icoIndex = htmlContent.indexOf('favicon.ico');
            const svgIndex = htmlContent.indexOf('icon.svg');
            
            if (icoIndex !== -1 && svgIndex !== -1) {
              expect(icoIndex).toBeLessThan(svgIndex);
            }
          }
          
          // Проверяем соответствие файлов контексту
          const requiredFiles = [];
          
          if (browser.supportsICO) {
            requiredFiles.push('public/favicon.ico');
          }
          
          if (browser.supportsSVG && ['browser_tab', 'bookmark'].includes(context)) {
            requiredFiles.push('public/icon.svg');
          }
          
          if (device.requiresAppleTouchIcon && ['homescreen', 'pwa_install'].includes(context)) {
            requiredFiles.push('public/apple-touch-icon.png');
          }
          
          if (browser.supportsPWA && context === 'pwa_install') {
            requiredFiles.push('public/icon-192.png', 'public/icon-512.png', 'public/manifest.json');
          }
          
          // Проверяем наличие всех требуемых файлов
          for (const filePath of requiredFiles) {
            const fullPath = resolve(process.cwd(), filePath);
            expect(existsSync(fullPath)).toBe(true);
            
            const fileBuffer = readFileSync(fullPath);
            expect(fileBuffer.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 40 }
    );
  });

  /**
   * Интеграционный тест для кроссбраузерной совместимости
   */
  it('Integration: Cross-Browser Compatibility - should work consistently across all browsers', async () => {
    // Feature: favicon-enhancement, Integration: Cross-Browser Compatibility
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          browsers: fc.shuffledSubarray(mockBrowserEnvironments, { minLength: 2, maxLength: 6 }),
          testScenario: fc.constantFrom('initial_load', 'cache_refresh', 'offline_mode', 'slow_network')
        }),
        async ({ browsers, testScenario }) => {
          const results = [];
          
          for (const browser of browsers) {
            // Симулируем поведение каждого браузера
            const browserResult = {
              browser: browser.name,
              faviconLoaded: false,
              formatUsed: null as string | null,
              errorOccurred: false
            };
            
            try {
              // Определяем какой формат будет использовать браузер
              if (browser.supportsSVG && existsSync(resolve(process.cwd(), 'public/icon.svg'))) {
                browserResult.formatUsed = 'svg';
                browserResult.faviconLoaded = true;
              } else if (browser.supportsICO && existsSync(resolve(process.cwd(), 'public/favicon.ico'))) {
                browserResult.formatUsed = 'ico';
                browserResult.faviconLoaded = true;
              }
              
              // Проверяем качество загруженного файла
              if (browserResult.faviconLoaded && browserResult.formatUsed) {
                const fileName = browserResult.formatUsed === 'svg' ? 'icon.svg' : 'favicon.ico';
                const filePath = resolve(process.cwd(), 'public', fileName);
                const fileBuffer = readFileSync(filePath);
                
                // Файл должен быть валидным
                expect(fileBuffer.length).toBeGreaterThan(0);
                
                if (browserResult.formatUsed === 'ico') {
                  // Проверяем ICO структуру
                  expect(fileBuffer[0]).toBe(0x00);
                  expect(fileBuffer[1]).toBe(0x00);
                } else if (browserResult.formatUsed === 'svg') {
                  // Проверяем SVG структуру
                  const content = fileBuffer.toString('utf8');
                  expect(content).toMatch(/^<\?xml|^<svg/);
                }
              }
              
            } catch (error) {
              browserResult.errorOccurred = true;
            }
            
            results.push(browserResult);
          }
          
          // Все браузеры должны успешно загрузить favicon
          const successfulLoads = results.filter(r => r.faviconLoaded && !r.errorOccurred);
          expect(successfulLoads.length).toBe(browsers.length);
          
          // Должны использоваться только поддерживаемые форматы
          for (const result of results) {
            if (result.formatUsed) {
              expect(['ico', 'svg']).toContain(result.formatUsed);
            }
          }
        }
      ),
      { numRuns: 25 }
    );
  });
});