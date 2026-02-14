/**
 * Property-based тесты для SVG оптимизации
 * Feature: favicon-enhancement
 * **Validates: Requirements 5.2, 7.1**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('SVG Optimization Property Tests', () => {
  const svgPath = resolve(process.cwd(), 'public/icon.svg');

  /**
   * Property 6: SVG Optimization
   * For any SVG favicon file, it should use minimal elements for performance and contain brand colors (#3B82F6)
   * **Validates: Requirements 5.2, 7.1**
   */
  it('Property 6: SVG Optimization - SVG should be optimized with minimal elements and brand colors', () => {
    // Feature: favicon-enhancement, Property 6: SVG Optimization
    
    fc.assert(
      fc.property(
        fc.constant(true),
        (testValue) => {
          // Проверяем существование файла
          expect(existsSync(svgPath)).toBe(true);
          
          // Читаем SVG файл
          const svgContent = readFileSync(svgPath, 'utf-8');
          expect(svgContent.length).toBeGreaterThan(0);
          
          // Проверяем, что это валидный SVG
          expect(svgContent.startsWith('<svg')).toBe(true);
          expect(svgContent.endsWith('</svg>')).toBe(true);
          
          // Проверяем наличие фирменного цвета #3B82F6
          expect(svgContent.includes('#3B82F6')).toBe(true);
          
          // Проверяем наличие viewBox для масштабируемости
          expect(svgContent.includes('viewBox=')).toBe(true);
          
          // Проверяем разумное количество элементов (не более 50 элементов для оптимизации)
          const elementMatches = svgContent.match(/<[^\/!][^>]*>/g) || [];
          expect(elementMatches.length).toBeLessThanOrEqual(50);
          expect(elementMatches.length).toBeGreaterThan(0);
          
          // Проверяем наличие xmlns для корректного отображения
          expect(svgContent.includes('xmlns="http://www.w3.org/2000/svg"')).toBe(true);
          
          // Проверяем размер файла для производительности (не более 15KB)
          const fileSizeKB = Buffer.byteLength(svgContent, 'utf8') / 1024;
          expect(fileSizeKB).toBeLessThanOrEqual(15);
          
          // Проверяем наличие брендинга "Считай.RU" в тексте
          expect(svgContent.includes('Считай.RU')).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: SVG Scalability
   * For any SVG favicon file, it should maintain readability at different sizes
   */
  it('Property: SVG Scalability - SVG should be scalable and readable at different sizes', () => {
    // Feature: favicon-enhancement, Property: SVG Scalability
    
    fc.assert(
      fc.property(
        fc.integer({ min: 16, max: 512 }),
        (size) => {
          const svgContent = readFileSync(svgPath, 'utf-8');
          
          // Проверяем наличие viewBox для правильного масштабирования
          const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
          expect(viewBoxMatch).toBeTruthy();
          
          if (viewBoxMatch) {
            const viewBoxValues = viewBoxMatch[1].split(/\s+/).map(Number);
            expect(viewBoxValues).toHaveLength(4);
            
            // Проверяем, что viewBox имеет правильные пропорции
            const [x, y, width, height] = viewBoxValues;
            expect(width).toBeGreaterThan(0);
            expect(height).toBeGreaterThan(0);
            expect(width).toEqual(height); // Квадратная иконка
          }
          
          // Проверяем, что элементы используют координаты в пределах viewBox
          const coordinateMatches = svgContent.match(/[xy]="([0-9]+)"/g);
          if (coordinateMatches) {
            coordinateMatches.forEach(match => {
              const value = parseInt(match.split('=')[1].replace(/"/g, ''));
              expect(value).toBeLessThanOrEqual(192); // Максимальный размер viewBox
              expect(value).toBeGreaterThanOrEqual(0); // Минимальный размер
            });
          }
          
          // Проверяем, что размер не влияет на валидность SVG
          expect(size).toBeGreaterThanOrEqual(16);
          expect(size).toBeLessThanOrEqual(512);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: SVG Brand Consistency
   * For any SVG favicon file, it should maintain brand consistency with colors and elements
   */
  it('Property: SVG Brand Consistency - SVG should maintain brand colors and elements', () => {
    // Feature: favicon-enhancement, Property: SVG Brand Consistency
    
    fc.assert(
      fc.property(
        fc.constant(true),
        (testValue) => {
          const svgContent = readFileSync(svgPath, 'utf-8');
          
          // Проверяем основной фирменный цвет
          expect(svgContent.includes('#3B82F6')).toBe(true);
          
          // Проверяем наличие белого цвета для контраста
          expect(svgContent.includes('fill="white"')).toBe(true);
          
          // Проверяем наличие символики калькулятора (цифры или математические символы)
          const hasCalculatorSymbols = /[0-9+\-×÷=]/.test(svgContent);
          expect(hasCalculatorSymbols).toBe(true);
          
          // Проверяем наличие брендинга
          expect(svgContent.includes('Считай.RU')).toBe(true);
          
          // Проверяем отсутствие конфликтующих ярких цветов (красный, зеленый)
          expect(svgContent.includes('#ff0000')).toBe(false);
          expect(svgContent.includes('#00ff00')).toBe(false);
          expect(svgContent.toLowerCase().includes('red')).toBe(false);
          expect(svgContent.toLowerCase().includes('green')).toBe(false);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});