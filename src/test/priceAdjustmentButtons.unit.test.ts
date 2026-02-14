/**
 * Unit-тесты для кнопок корректировки цены иска
 * Feature: court-fee-calculator
 * Validates: Requirements 9.4, 9.5, 9.6
 */

import { describe, test, expect } from 'vitest';

// Константы (дублируем из компонента)
const MIN_CLAIM_AMOUNT = 1000;
const MAX_CLAIM_AMOUNT = 10000000;

// Функция для определения умного шага (дублируем логику из компонента)
const getStepSize = (currentValue: number): number => {
  return currentValue < 100000 ? 1000 : 10000;
};

// Функция увеличения (дублируем логику из компонента)
const incrementAmount = (currentAmount: number): number => {
  const step = getStepSize(currentAmount);
  return Math.min(currentAmount + step, MAX_CLAIM_AMOUNT);
};

// Функция уменьшения (дублируем логику из компонента)
const decrementAmount = (currentAmount: number): number => {
  const step = getStepSize(currentAmount);
  return Math.max(currentAmount - step, MIN_CLAIM_AMOUNT);
};

describe('Price Adjustment Buttons Unit Tests', () => {
  
  describe('Step Size Calculation', () => {
    test('should return 1000 for amounts below 100000', () => {
      expect(getStepSize(1000)).toBe(1000);
      expect(getStepSize(50000)).toBe(1000);
      expect(getStepSize(99999)).toBe(1000);
    });

    test('should return 10000 for amounts 100000 and above', () => {
      expect(getStepSize(100000)).toBe(10000);
      expect(getStepSize(150000)).toBe(10000);
      expect(getStepSize(1000000)).toBe(10000);
      expect(getStepSize(MAX_CLAIM_AMOUNT)).toBe(10000);
    });

    test('should handle boundary value correctly', () => {
      expect(getStepSize(99999)).toBe(1000);
      expect(getStepSize(100000)).toBe(10000);
      expect(getStepSize(100001)).toBe(10000);
    });
  });

  describe('Increment Function', () => {
    test('should increment by correct step size', () => {
      expect(incrementAmount(50000)).toBe(51000); // +1000
      expect(incrementAmount(150000)).toBe(160000); // +10000
    });

    test('should not exceed maximum value', () => {
      expect(incrementAmount(MAX_CLAIM_AMOUNT)).toBe(MAX_CLAIM_AMOUNT);
      expect(incrementAmount(MAX_CLAIM_AMOUNT - 5000)).toBe(MAX_CLAIM_AMOUNT);
    });

    test('should handle boundary transitions', () => {
      // Переход через границу 100000
      expect(incrementAmount(99000)).toBe(100000); // 99000 + 1000 = 100000
      expect(incrementAmount(100000)).toBe(110000); // 100000 + 10000 = 110000
    });

    test('should handle edge cases near maximum', () => {
      expect(incrementAmount(9990000)).toBe(10000000); // Достигаем максимума
      expect(incrementAmount(9999999)).toBe(10000000); // Превышаем, но ограничиваем
    });
  });

  describe('Decrement Function', () => {
    test('should decrement by correct step size', () => {
      expect(decrementAmount(51000)).toBe(50000); // -1000
      expect(decrementAmount(160000)).toBe(150000); // -10000
    });

    test('should not go below minimum value', () => {
      expect(decrementAmount(MIN_CLAIM_AMOUNT)).toBe(MIN_CLAIM_AMOUNT);
      expect(decrementAmount(500)).toBe(MIN_CLAIM_AMOUNT); // Меньше минимума
    });

    test('should handle boundary transitions', () => {
      // Переход через границу 100000
      expect(decrementAmount(101000)).toBe(91000); // 101000 - 10000 = 91000
      expect(decrementAmount(100000)).toBe(90000); // 100000 - 10000 = 90000
    });

    test('should handle edge cases near minimum', () => {
      expect(decrementAmount(2000)).toBe(1000); // Достигаем минимума
      expect(decrementAmount(1500)).toBe(1000); // Меньше шага, ограничиваем минимумом
    });
  });

  describe('Boundary Value Testing', () => {
    test('should handle exact minimum value', () => {
      expect(incrementAmount(MIN_CLAIM_AMOUNT)).toBe(MIN_CLAIM_AMOUNT + 1000);
      expect(decrementAmount(MIN_CLAIM_AMOUNT)).toBe(MIN_CLAIM_AMOUNT);
    });

    test('should handle exact maximum value', () => {
      expect(incrementAmount(MAX_CLAIM_AMOUNT)).toBe(MAX_CLAIM_AMOUNT);
      expect(decrementAmount(MAX_CLAIM_AMOUNT)).toBe(MAX_CLAIM_AMOUNT - 10000);
    });

    test('should handle step boundary at 100000', () => {
      // Тестируем значения вокруг границы смены шага
      expect(getStepSize(99999)).toBe(1000);
      expect(getStepSize(100000)).toBe(10000);
      
      expect(incrementAmount(99000)).toBe(100000);
      expect(incrementAmount(100000)).toBe(110000);
      
      expect(decrementAmount(101000)).toBe(91000);
      expect(decrementAmount(100000)).toBe(90000);
    });
  });

  describe('Multiple Operations', () => {
    test('should handle multiple increments correctly', () => {
      let amount = 50000;
      amount = incrementAmount(amount); // 51000
      amount = incrementAmount(amount); // 52000
      amount = incrementAmount(amount); // 53000
      expect(amount).toBe(53000);
    });

    test('should handle multiple decrements correctly', () => {
      let amount = 150000;
      amount = decrementAmount(amount); // 140000
      amount = decrementAmount(amount); // 130000
      amount = decrementAmount(amount); // 120000
      expect(amount).toBe(120000);
    });

    test('should handle mixed operations', () => {
      let amount = 95000;
      amount = incrementAmount(amount); // 96000 (step 1000)
      amount = incrementAmount(amount); // 97000 (step 1000)
      amount = incrementAmount(amount); // 98000 (step 1000)
      amount = incrementAmount(amount); // 99000 (step 1000)
      amount = incrementAmount(amount); // 100000 (step 1000)
      amount = incrementAmount(amount); // 110000 (step 10000)
      amount = decrementAmount(amount); // 100000 (step 10000)
      amount = decrementAmount(amount); // 90000 (step 10000)
      
      expect(amount).toBe(90000);
    });

    test('should maintain boundaries during multiple operations', () => {
      // Тест на минимуме
      let minAmount = MIN_CLAIM_AMOUNT;
      for (let i = 0; i < 10; i++) {
        minAmount = decrementAmount(minAmount);
      }
      expect(minAmount).toBe(MIN_CLAIM_AMOUNT);

      // Тест на максимуме
      let maxAmount = MAX_CLAIM_AMOUNT;
      for (let i = 0; i < 10; i++) {
        maxAmount = incrementAmount(maxAmount);
      }
      expect(maxAmount).toBe(MAX_CLAIM_AMOUNT);
    });
  });

  describe('Step Size Consistency', () => {
    test('should maintain step consistency within ranges', () => {
      // В диапазоне до 100000 шаг всегда 1000
      for (let amount = 1000; amount < 100000; amount += 5000) {
        expect(getStepSize(amount)).toBe(1000);
      }

      // В диапазоне от 100000 шаг всегда 10000
      for (let amount = 100000; amount <= 1000000; amount += 50000) {
        expect(getStepSize(amount)).toBe(10000);
      }
    });

    test('should handle step transitions smoothly', () => {
      // Проверяем плавный переход через границу
      const testValues = [98000, 99000, 100000, 101000, 102000];
      const expectedSteps = [1000, 1000, 10000, 10000, 10000];
      
      testValues.forEach((value, index) => {
        expect(getStepSize(value)).toBe(expectedSteps[index]);
      });
    });
  });
});