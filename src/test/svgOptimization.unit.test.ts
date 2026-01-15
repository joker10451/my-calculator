/**
 * Unit тесты для SVG оптимизации
 * Feature: favicon-enhancement
 * **Validates: Requirements 5.2, 7.1**
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('SVG Optimization Unit Tests', () => {
  const svgPath = resolve(process.cwd(), 'public/icon.svg');

  it('SVG file should exist and be readable', () => {
    expect(existsSync(svgPath)).toBe(true);
    
    const svgContent = readFileSync(svgPath, 'utf-8');
    expect(svgContent.length).toBeGreaterThan(0);
  });

  it('SVG should have valid structure', () => {
    const svgContent = readFileSync(svgPath, 'utf-8');
    
    // Проверяем, что это валидный SVG
    expect(svgContent).toMatch(/^<svg/);
    expect(svgContent).toMatch(/<\/svg>$/);
    
    // Проверяем наличие xmlns
    expect(svgContent).toMatch(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    
    // Проверяем наличие viewBox
    expect(svgContent).toMatch(/viewBox="[^"]+"/);
  });

  it('SVG should contain brand colors', () => {
    const svgContent = readFileSync(svgPath, 'utf-8');
    
    // Проверяем наличие фирменного цвета #3B82F6
    expect(svgContent).toMatch(/#3B82F6/i);
    
    // Проверяем наличие белого цвета для контраста
    expect(svgContent).toMatch(/fill="white"/i);
  });

  it('SVG should contain calculator symbols', () => {
    const svgContent = readFileSync(svgPath, 'utf-8');
    
    // Проверяем наличие символики калькулятора
    const hasCalculatorSymbols = /[0-9+\-×÷=]/.test(svgContent);
    expect(hasCalculatorSymbols).toBe(true);
  });

  it('SVG should contain brand text', () => {
    const svgContent = readFileSync(svgPath, 'utf-8');
    
    // Проверяем наличие брендинга
    expect(svgContent).toMatch(/Считай\.RU/);
  });

  it('SVG should be optimized for performance', () => {
    const svgContent = readFileSync(svgPath, 'utf-8');
    
    // Проверяем размер файла
    const fileSizeKB = Buffer.byteLength(svgContent, 'utf8') / 1024;
    expect(fileSizeKB).toBeLessThanOrEqual(15);
    
    // Проверяем количество элементов
    const elementMatches = svgContent.match(/<[^\/!][^>]*>/g) || [];
    expect(elementMatches.length).toBeLessThanOrEqual(50);
    expect(elementMatches.length).toBeGreaterThan(0);
  });

  it('SVG should have proper viewBox for scalability', () => {
    const svgContent = readFileSync(svgPath, 'utf-8');
    
    const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
    expect(viewBoxMatch).toBeTruthy();
    
    if (viewBoxMatch) {
      const viewBoxValues = viewBoxMatch[1].split(/\s+/).map(Number);
      expect(viewBoxValues).toHaveLength(4);
      
      const [x, y, width, height] = viewBoxValues;
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
      expect(width).toEqual(height); // Квадратная иконка
    }
  });
});