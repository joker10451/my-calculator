/**
 * Property-based тесты для HTML Link структуры
 * Feature: favicon-enhancement
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

describe('HTML Link Structure Property Tests', () => {
  const htmlPath = resolve(process.cwd(), 'index.html');

  /**
   * Property 7: HTML Link Structure
   * For any HTML document, it should contain all necessary favicon link elements with proper fallback order (ICO before SVG)
   * **Validates: Requirements 6.3, 6.4**
   */
  it('Property 7: HTML Link Structure - HTML should have correct favicon link structure and order', async () => {
    // Feature: favicon-enhancement, Property 7: HTML Link Structure
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          checkOrder: fc.boolean(),
          validatePaths: fc.boolean(),
          checkAttributes: fc.boolean()
        }),
        async ({ checkOrder, validatePaths, checkAttributes }) => {
          // Проверяем существование HTML файла
          expect(existsSync(htmlPath)).toBe(true);
          
          // Читаем и парсим HTML
          const htmlContent = readFileSync(htmlPath, 'utf-8');
          const dom = new JSDOM(htmlContent);
          const document = dom.window.document;
          
          // Получаем все favicon-связанные link элементы
          const faviconLinks = Array.from(document.querySelectorAll('link[rel*="icon"], link[rel="manifest"]'));
          
          // Проверяем наличие обязательных элементов
          const icoLink = faviconLinks.find(link => 
            link.getAttribute('href')?.includes('favicon.ico')
          );
          const svgLink = faviconLinks.find(link => 
            link.getAttribute('href')?.includes('icon.svg')
          );
          const appleTouchLink = faviconLinks.find(link => 
            link.getAttribute('rel') === 'apple-touch-icon'
          );
          const manifestLink = faviconLinks.find(link => 
            link.getAttribute('rel') === 'manifest'
          );
          
          // Обязательные элементы должны присутствовать
          expect(icoLink).toBeTruthy();
          expect(svgLink).toBeTruthy();
          expect(appleTouchLink).toBeTruthy();
          expect(manifestLink).toBeTruthy();
          
          if (checkOrder) {
            // Проверяем правильный порядок fallback (ICO перед SVG)
            const icoIndex = faviconLinks.indexOf(icoLink!);
            const svgIndex = faviconLinks.indexOf(svgLink!);
            expect(icoIndex).toBeLessThan(svgIndex);
          }
          
          if (validatePaths) {
            // Проверяем корректность путей
            expect(icoLink!.getAttribute('href')).toBe('/favicon.ico');
            expect(svgLink!.getAttribute('href')).toBe('/icon.svg');
            expect(appleTouchLink!.getAttribute('href')).toBe('/apple-touch-icon.png');
            expect(manifestLink!.getAttribute('href')).toBe('/manifest.json');
          }
          
          if (checkAttributes) {
            // Проверяем корректность атрибутов
            expect(icoLink!.getAttribute('rel')).toMatch(/icon/);
            expect(svgLink!.getAttribute('type')).toBe('image/svg+xml');
            expect(appleTouchLink!.getAttribute('rel')).toBe('apple-touch-icon');
            expect(manifestLink!.getAttribute('rel')).toBe('manifest');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: HTML Meta Tags Completeness
   * For any HTML document with favicon, it should have proper meta tags for theme color and viewport
   */
  it('Property: HTML Meta Tags Completeness - should have proper meta tags for favicon support', async () => {
    // Feature: favicon-enhancement, Property: HTML Meta Tags Completeness
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          checkThemeColor: fc.boolean(),
          checkViewport: fc.boolean(),
          validateColors: fc.boolean()
        }),
        async ({ checkThemeColor, checkViewport, validateColors }) => {
          const htmlContent = readFileSync(htmlPath, 'utf-8');
          const dom = new JSDOM(htmlContent);
          const document = dom.window.document;
          
          if (checkThemeColor) {
            // Проверяем наличие theme-color meta тега
            const themeColorMeta = document.querySelector('meta[name="theme-color"]');
            expect(themeColorMeta).toBeTruthy();
            
            if (validateColors) {
              const themeColor = themeColorMeta!.getAttribute('content');
              expect(themeColor).toBe('#3B82F6'); // Фирменный цвет бренда
            }
          }
          
          if (checkViewport) {
            // Проверяем наличие viewport meta тега
            const viewportMeta = document.querySelector('meta[name="viewport"]');
            expect(viewportMeta).toBeTruthy();
            expect(viewportMeta!.getAttribute('content')).toContain('width=device-width');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: HTML Document Structure Validity
   * For any HTML document, favicon links should be properly placed in head section
   */
  it('Property: HTML Document Structure Validity - favicon links should be in head section', async () => {
    // Feature: favicon-enhancement, Property: HTML Document Structure Validity
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          checkHeadPlacement: fc.boolean(),
          validateDoctype: fc.boolean()
        }),
        async ({ checkHeadPlacement, validateDoctype }) => {
          const htmlContent = readFileSync(htmlPath, 'utf-8');
          const dom = new JSDOM(htmlContent);
          const document = dom.window.document;
          
          if (validateDoctype) {
            // Проверяем наличие DOCTYPE
            expect(htmlContent.toLowerCase()).toMatch(/<!doctype\s+html>/);
          }
          
          if (checkHeadPlacement) {
            // Проверяем, что все favicon ссылки находятся в head
            const headLinks = document.head.querySelectorAll('link[rel*="icon"], link[rel="manifest"]');
            const bodyLinks = document.body.querySelectorAll('link[rel*="icon"], link[rel="manifest"]');
            
            expect(headLinks.length).toBeGreaterThan(0);
            expect(bodyLinks.length).toBe(0); // В body не должно быть favicon ссылок
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});