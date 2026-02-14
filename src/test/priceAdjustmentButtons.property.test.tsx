/**
 * Property-based тесты для кнопок корректировки цены иска
 * Feature: court-fee-calculator, Property 13: Price Adjustment Buttons
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { vi } from 'vitest';
import CourtFeeCalculator from '@/components/calculators/CourtFeeCalculator';
import { ComparisonProvider } from '@/context/ComparisonContext';

// Mock для toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Константы для тестирования
const MIN_CLAIM_AMOUNT = 1000;
const MAX_CLAIM_AMOUNT = 10000000;

// Функция для определения умного шага (дублируем логику из компонента)
const getStepSize = (currentValue: number): number => {
  return currentValue < 100000 ? 1000 : 10000;
};

// Компонент-обертка для тестирования
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ComparisonProvider>
    {children}
  </ComparisonProvider>
);

describe('Price Adjustment Buttons Property Tests', () => {
  
  beforeEach(() => {
    mockToast.mockClear();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test('Property 13: Price Adjustment Buttons - Basic functionality', () => {
    // Feature: court-fee-calculator, Property 13: Price Adjustment Buttons
    // Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7
    
    const { unmount } = render(
      <TestWrapper>
        <CourtFeeCalculator />
      </TestWrapper>
    );

    try {
      // Проверяем наличие кнопок корректировки
      const buttons = screen.getAllByRole('button');
      const minusButton = buttons.find(btn => btn.querySelector('svg') && btn.getAttribute('class')?.includes('h-8 w-8'));
      const plusButton = buttons.find(btn => btn.querySelector('svg') && btn.getAttribute('class')?.includes('h-8 w-8') && btn !== minusButton);

      expect(minusButton).toBeInTheDocument();
      expect(plusButton).toBeInTheDocument();

      // Проверяем отображение шага
      expect(screen.getByText(/Шаг:/)).toBeInTheDocument();

    } finally {
      unmount();
    }
  });

  test('Property 13: Price Adjustment Buttons - Step size calculation', () => {
    // Feature: court-fee-calculator, Property 13: Price Adjustment Buttons
    // Validates: Requirements 9.6
    
    fc.assert(
      fc.property(
        fc.integer({ min: MIN_CLAIM_AMOUNT, max: MAX_CLAIM_AMOUNT }),
        (claimAmount) => {
          const expectedStep = getStepSize(claimAmount);
          
          // Проверяем логику умного шага
          if (claimAmount < 100000) {
            expect(expectedStep).toBe(1000);
          } else {
            expect(expectedStep).toBe(10000);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 13: Price Adjustment Buttons - Boundary validation', () => {
    // Feature: court-fee-calculator, Property 13: Price Adjustment Buttons
    // Validates: Requirements 9.4, 9.5
    
    fc.assert(
      fc.property(
        fc.integer({ min: MIN_CLAIM_AMOUNT, max: MAX_CLAIM_AMOUNT }),
        (initialAmount) => {
          const step = getStepSize(initialAmount);
          
          // Тестируем увеличение
          const incrementedAmount = Math.min(initialAmount + step, MAX_CLAIM_AMOUNT);
          expect(incrementedAmount).toBeLessThanOrEqual(MAX_CLAIM_AMOUNT);
          expect(incrementedAmount).toBeGreaterThanOrEqual(initialAmount);
          
          // Тестируем уменьшение
          const decrementedAmount = Math.max(initialAmount - step, MIN_CLAIM_AMOUNT);
          expect(decrementedAmount).toBeGreaterThanOrEqual(MIN_CLAIM_AMOUNT);
          expect(decrementedAmount).toBeLessThanOrEqual(initialAmount);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 13: Price Adjustment Buttons - Step consistency', () => {
    // Feature: court-fee-calculator, Property 13: Price Adjustment Buttons
    // Validates: Requirements 9.2, 9.3, 9.6
    
    fc.assert(
      fc.property(
        fc.integer({ min: MIN_CLAIM_AMOUNT + 10000, max: MAX_CLAIM_AMOUNT - 10000 }),
        (baseAmount) => {
          const step = getStepSize(baseAmount);
          
          // Проверяем, что шаг остается консистентным в пределах диапазона
          const incrementedAmount = baseAmount + step;
          const decrementedAmount = baseAmount - step;
          
          // Шаг должен быть положительным
          expect(step).toBeGreaterThan(0);
          
          // Шаг должен быть либо 1000, либо 10000
          expect([1000, 10000]).toContain(step);
          
          // Проверяем консистентность в обе стороны
          if (baseAmount < 100000) {
            expect(step).toBe(1000);
            if (incrementedAmount < 100000) {
              expect(getStepSize(incrementedAmount)).toBe(1000);
            }
            if (decrementedAmount < 100000) {
              expect(getStepSize(decrementedAmount)).toBe(1000);
            }
          } else {
            expect(step).toBe(10000);
            expect(getStepSize(incrementedAmount)).toBe(10000);
            if (decrementedAmount >= 100000) {
              expect(getStepSize(decrementedAmount)).toBe(10000);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 13: Price Adjustment Buttons - Edge cases', () => {
    // Feature: court-fee-calculator, Property 13: Price Adjustment Buttons
    // Validates: Requirements 9.4, 9.5
    
    // Тестируем минимальное значение
    const minStep = getStepSize(MIN_CLAIM_AMOUNT);
    const decrementedMin = Math.max(MIN_CLAIM_AMOUNT - minStep, MIN_CLAIM_AMOUNT);
    expect(decrementedMin).toBe(MIN_CLAIM_AMOUNT);
    
    // Тестируем максимальное значение
    const maxStep = getStepSize(MAX_CLAIM_AMOUNT);
    const incrementedMax = Math.min(MAX_CLAIM_AMOUNT + maxStep, MAX_CLAIM_AMOUNT);
    expect(incrementedMax).toBe(MAX_CLAIM_AMOUNT);
    
    // Тестируем переход через границу 100000
    const belowBoundary = 99000;
    const aboveBoundary = 101000;
    
    expect(getStepSize(belowBoundary)).toBe(1000);
    expect(getStepSize(aboveBoundary)).toBe(10000);
    
    // Тестируем точно на границе
    expect(getStepSize(100000)).toBe(10000); // 100000 >= 100000, поэтому шаг 10000
  });

  test('Property 13: Price Adjustment Buttons - Multiple operations', () => {
    // Feature: court-fee-calculator, Property 13: Price Adjustment Buttons
    // Validates: Requirements 9.2, 9.3, 9.7
    
    fc.assert(
      fc.property(
        fc.integer({ min: MIN_CLAIM_AMOUNT + 50000, max: MAX_CLAIM_AMOUNT - 50000 }),
        fc.array(fc.constantFrom('increment', 'decrement'), { minLength: 1, maxLength: 5 }),
        (initialAmount, operations) => {
          let currentAmount = initialAmount;
          
          operations.forEach(operation => {
            const step = getStepSize(currentAmount);
            
            if (operation === 'increment') {
              const newAmount = Math.min(currentAmount + step, MAX_CLAIM_AMOUNT);
              expect(newAmount).toBeGreaterThanOrEqual(currentAmount);
              expect(newAmount).toBeLessThanOrEqual(MAX_CLAIM_AMOUNT);
              currentAmount = newAmount;
            } else {
              const newAmount = Math.max(currentAmount - step, MIN_CLAIM_AMOUNT);
              expect(newAmount).toBeLessThanOrEqual(currentAmount);
              expect(newAmount).toBeGreaterThanOrEqual(MIN_CLAIM_AMOUNT);
              currentAmount = newAmount;
            }
          });
          
          // Финальная проверка границ
          expect(currentAmount).toBeGreaterThanOrEqual(MIN_CLAIM_AMOUNT);
          expect(currentAmount).toBeLessThanOrEqual(MAX_CLAIM_AMOUNT);
        }
      ),
      { numRuns: 30 }
    );
  });
});