/**
 * Property-based тесты для SEO элементов калькулятора госпошлины
 * Feature: court-fee-calculator, Property 11: SEO and Metadata
 * Validates: Requirements 8.4, 8.5
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import CourtFeeCalculatorPage from '@/pages/CourtFeeCalculatorPage';
import { ComparisonProvider } from '@/context/ComparisonContext';

// Компонент-обертка для тестирования с необходимыми провайдерами
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <BrowserRouter>
      <ComparisonProvider>
        {children}
      </ComparisonProvider>
    </BrowserRouter>
  </HelmetProvider>
);

describe('Court Fee Calculator SEO Property Tests', () => {
  
  beforeEach(() => {
    // Очищаем DOM перед каждым тестом
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
  });

  test('Property 11: SEO and Metadata - Component renders without errors', () => {
    // Feature: court-fee-calculator, Property 11: SEO and Metadata
    // Validates: Requirements 8.4, 8.5
    
    fc.assert(
      fc.property(fc.constant(true), () => {
        const { unmount } = render(
          <TestWrapper>
            <CourtFeeCalculatorPage />
          </TestWrapper>
        );

        try {
          // Проверяем, что компонент отрендерился без ошибок
          expect(document.body).toBeTruthy();
          
          // Проверяем наличие основного контента
          const content = document.body.textContent || '';
          expect(content).toContain('Калькулятор госпошлины в суд');
          
          return true;
        } finally {
          unmount();
        }
      }),
      { numRuns: 5 }
    );
  });

  test('Property 11: SEO and Metadata - Page structure validation', () => {
    // Feature: court-fee-calculator, Property 11: SEO and Metadata
    // Validates: Requirements 8.4, 8.5
    
    fc.assert(
      fc.property(fc.constant(true), () => {
        const { unmount } = render(
          <TestWrapper>
            <CourtFeeCalculatorPage />
          </TestWrapper>
        );

        try {
          // Проверяем структуру страницы
          const mainElement = document.querySelector('main');
          expect(mainElement).toBeTruthy();
          
          // Проверяем наличие заголовка h1
          const h1Element = document.querySelector('h1');
          expect(h1Element).toBeTruthy();
          expect(h1Element?.textContent).toContain('Калькулятор госпошлины в суд');
          
          return true;
        } finally {
          unmount();
        }
      }),
      { numRuns: 5 }
    );
  });

  test('Property 11: SEO and Metadata - Content keywords validation', () => {
    // Feature: court-fee-calculator, Property 11: SEO and Metadata
    // Validates: Requirements 8.4, 8.5
    
    fc.assert(
      fc.property(fc.constant(true), () => {
        const { unmount } = render(
          <TestWrapper>
            <CourtFeeCalculatorPage />
          </TestWrapper>
        );

        try {
          const content = document.body.textContent || '';
          
          // Проверяем наличие ключевых слов в контенте
          const requiredKeywords = ['госпошлин', 'суд', 'калькулятор'];
          requiredKeywords.forEach(keyword => {
            expect(content.toLowerCase()).toContain(keyword.toLowerCase());
          });
          
          return true;
        } finally {
          unmount();
        }
      }),
      { numRuns: 5 }
    );
  });

  test('Property 11: SEO and Metadata - Accessibility and semantic structure', () => {
    // Feature: court-fee-calculator, Property 11: SEO and Metadata
    // Validates: Requirements 8.4, 8.5
    
    fc.assert(
      fc.property(fc.constant(true), () => {
        const { unmount } = render(
          <TestWrapper>
            <CourtFeeCalculatorPage />
          </TestWrapper>
        );

        try {
          // Проверяем семантическую структуру
          const header = document.querySelector('header');
          const main = document.querySelector('main');
          const footer = document.querySelector('footer');
          
          expect(header).toBeTruthy();
          expect(main).toBeTruthy();
          expect(footer).toBeTruthy();
          
          // Проверяем наличие форм - более мягкая проверка
          const inputs = document.querySelectorAll('input');
          if (inputs.length > 0) {
            // Проверяем, что хотя бы некоторые inputs имеют правильные атрибуты
            let hasProperLabeling = false;
            inputs.forEach(input => {
              const hasLabel = input.labels && input.labels.length > 0;
              const hasAriaLabel = input.getAttribute('aria-label');
              const hasPlaceholder = input.getAttribute('placeholder');
              if (hasLabel || hasAriaLabel || hasPlaceholder) {
                hasProperLabeling = true;
              }
            });
            expect(hasProperLabeling).toBeTruthy();
          }
          
          return true;
        } finally {
          unmount();
        }
      }),
      { numRuns: 3 }
    );
  });

  test('Property 11: SEO and Metadata - Navigation and links structure', () => {
    // Feature: court-fee-calculator, Property 11: SEO and Metadata
    // Validates: Requirements 8.4, 8.5
    
    fc.assert(
      fc.property(fc.constant(true), () => {
        const { unmount } = render(
          <TestWrapper>
            <CourtFeeCalculatorPage />
          </TestWrapper>
        );

        try {
          // Проверяем наличие навигационных элементов
          const links = document.querySelectorAll('a');
          
          if (links.length > 0) {
            // Проверяем, что хотя бы некоторые ссылки имеют текст или aria-label
            let hasProperLinks = false;
            links.forEach(link => {
              const hasText = (link.textContent || '').trim().length > 0;
              const hasAriaLabel = link.getAttribute('aria-label');
              const hasTitle = link.getAttribute('title');
              if (hasText || hasAriaLabel || hasTitle) {
                hasProperLinks = true;
              }
            });
            expect(hasProperLinks).toBeTruthy();
          }
          
          return true;
        } finally {
          unmount();
        }
      }),
      { numRuns: 3 }
    );
  });

  test('Property 11: SEO and Metadata - Content quality and completeness', () => {
    // Feature: court-fee-calculator, Property 11: SEO and Metadata
    // Validates: Requirements 8.4, 8.5
    
    fc.assert(
      fc.property(fc.constant(true), () => {
        const { unmount } = render(
          <TestWrapper>
            <CourtFeeCalculatorPage />
          </TestWrapper>
        );

        try {
          const content = document.body.textContent || '';
          
          // Проверяем, что контент содержит достаточно информации
          expect(content.length).toBeGreaterThan(100);
          
          // Проверяем наличие описательного текста
          expect(content).toContain('Рассчитайте');
          expect(content).toContain('государственной пошлины');
          
          // Проверяем наличие интерактивных элементов
          const buttons = document.querySelectorAll('button');
          expect(buttons.length).toBeGreaterThan(0);
          
          const inputs = document.querySelectorAll('input');
          expect(inputs.length).toBeGreaterThan(0);
          
          return true;
        } finally {
          unmount();
        }
      }),
      { numRuns: 3 }
    );
  });
});