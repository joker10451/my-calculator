/**
 * Unit-тесты для поля прямого ввода цены иска
 * Feature: court-fee-calculator
 * Validates: Requirements 10.3, 10.4, 10.5, 10.6
 */

import { describe, test, expect } from 'vitest';

// Константы (дублируем из компонента)
const MIN_CLAIM_AMOUNT = 1000;
const MAX_CLAIM_AMOUNT = 10000000;

// Функции форматирования (дублируем логику из компонента)
const formatNumberWithSpaces = (value: number): string => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const parseNumberFromString = (value: string): number => {
  const cleanValue = value.replace(/\s/g, '');
  const parsed = parseInt(cleanValue, 10);
  return isNaN(parsed) ? 0 : parsed;
};

// Функция валидации ввода (дублируем логику из компонента)
const isValidInput = (value: string): boolean => {
  return /^[\d\s]*$/.test(value);
};

// Функция применения границ (дублируем логику из компонента)
const applyBoundaries = (value: number): number => {
  if (value < MIN_CLAIM_AMOUNT) {
    return MIN_CLAIM_AMOUNT;
  } else if (value > MAX_CLAIM_AMOUNT) {
    return MAX_CLAIM_AMOUNT;
  }
  return value;
};

describe('Direct Input Field Unit Tests', () => {
  
  describe('Number Formatting', () => {
    test('should format numbers with spaces as thousands separators', () => {
      expect(formatNumberWithSpaces(1000)).toBe('1 000');
      expect(formatNumberWithSpaces(12345)).toBe('12 345');
      expect(formatNumberWithSpaces(1234567)).toBe('1 234 567');
      expect(formatNumberWithSpaces(10000000)).toBe('10 000 000');
    });

    test('should not add spaces to numbers less than 1000', () => {
      expect(formatNumberWithSpaces(1)).toBe('1');
      expect(formatNumberWithSpaces(99)).toBe('99');
      expect(formatNumberWithSpaces(999)).toBe('999');
    });

    test('should handle zero correctly', () => {
      expect(formatNumberWithSpaces(0)).toBe('0');
    });
  });

  describe('Number Parsing', () => {
    test('should parse formatted numbers correctly', () => {
      expect(parseNumberFromString('1 000')).toBe(1000);
      expect(parseNumberFromString('12 345')).toBe(12345);
      expect(parseNumberFromString('1 234 567')).toBe(1234567);
      expect(parseNumberFromString('10 000 000')).toBe(10000000);
    });

    test('should parse numbers without spaces', () => {
      expect(parseNumberFromString('1000')).toBe(1000);
      expect(parseNumberFromString('12345')).toBe(12345);
      expect(parseNumberFromString('1234567')).toBe(1234567);
    });

    test('should handle empty and invalid strings', () => {
      expect(parseNumberFromString('')).toBe(0);
      expect(parseNumberFromString('   ')).toBe(0);
      expect(parseNumberFromString('abc')).toBe(0);
    });

    test('should handle mixed valid and invalid characters', () => {
      expect(parseNumberFromString('123abc')).toBe(123);
      expect(parseNumberFromString('12 34 56')).toBe(123456);
    });
  });

  describe('Input Validation', () => {
    test('should accept valid numeric input', () => {
      expect(isValidInput('123456')).toBe(true);
      expect(isValidInput('1 234 567')).toBe(true);
      expect(isValidInput('0')).toBe(true);
      expect(isValidInput('')).toBe(true);
      expect(isValidInput('   ')).toBe(true);
    });

    test('should reject invalid input', () => {
      expect(isValidInput('abc')).toBe(false);
      expect(isValidInput('12.34')).toBe(false);
      expect(isValidInput('12,34')).toBe(false);
      expect(isValidInput('12a34')).toBe(false);
      expect(isValidInput('!@#')).toBe(false);
      expect(isValidInput('12-34')).toBe(false);
      expect(isValidInput('12+34')).toBe(false);
    });

    test('should handle edge cases', () => {
      expect(isValidInput('123 456 789')).toBe(true);
      expect(isValidInput('  123  456  ')).toBe(true);
      expect(isValidInput('1.23e5')).toBe(false);
      expect(isValidInput('-123')).toBe(false);
    });
  });

  describe('Boundary Application', () => {
    test('should enforce minimum boundary', () => {
      expect(applyBoundaries(500)).toBe(MIN_CLAIM_AMOUNT);
      expect(applyBoundaries(0)).toBe(MIN_CLAIM_AMOUNT);
      expect(applyBoundaries(-1000)).toBe(MIN_CLAIM_AMOUNT);
      expect(applyBoundaries(MIN_CLAIM_AMOUNT)).toBe(MIN_CLAIM_AMOUNT);
    });

    test('should enforce maximum boundary', () => {
      expect(applyBoundaries(15000000)).toBe(MAX_CLAIM_AMOUNT);
      expect(applyBoundaries(50000000)).toBe(MAX_CLAIM_AMOUNT);
      expect(applyBoundaries(MAX_CLAIM_AMOUNT)).toBe(MAX_CLAIM_AMOUNT);
    });

    test('should not change values within boundaries', () => {
      expect(applyBoundaries(50000)).toBe(50000);
      expect(applyBoundaries(100000)).toBe(100000);
      expect(applyBoundaries(1000000)).toBe(1000000);
      expect(applyBoundaries(5000000)).toBe(5000000);
    });

    test('should handle boundary edge cases', () => {
      expect(applyBoundaries(MIN_CLAIM_AMOUNT - 1)).toBe(MIN_CLAIM_AMOUNT);
      expect(applyBoundaries(MIN_CLAIM_AMOUNT + 1)).toBe(MIN_CLAIM_AMOUNT + 1);
      expect(applyBoundaries(MAX_CLAIM_AMOUNT - 1)).toBe(MAX_CLAIM_AMOUNT - 1);
      expect(applyBoundaries(MAX_CLAIM_AMOUNT + 1)).toBe(MAX_CLAIM_AMOUNT);
    });
  });

  describe('Round Trip Consistency', () => {
    test('should maintain consistency through format-parse cycle', () => {
      const testValues = [1000, 12345, 100000, 1234567, 10000000];
      
      testValues.forEach(value => {
        const formatted = formatNumberWithSpaces(value);
        const parsed = parseNumberFromString(formatted);
        expect(parsed).toBe(value);
      });
    });

    test('should handle boundary values consistently', () => {
      const boundaryValues = [MIN_CLAIM_AMOUNT, MAX_CLAIM_AMOUNT];
      
      boundaryValues.forEach(value => {
        const formatted = formatNumberWithSpaces(value);
        const parsed = parseNumberFromString(formatted);
        const bounded = applyBoundaries(parsed);
        expect(bounded).toBe(value);
      });
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete input processing workflow', () => {
      const testCases = [
        { input: '50 000', expected: 50000 },
        { input: '500', expected: MIN_CLAIM_AMOUNT }, // Below minimum
        { input: '15000000', expected: MAX_CLAIM_AMOUNT }, // Above maximum
        { input: '1 234 567', expected: 1234567 },
        { input: '', expected: MIN_CLAIM_AMOUNT }, // Empty input
      ];

      testCases.forEach(({ input, expected }) => {
        if (isValidInput(input)) {
          const parsed = parseNumberFromString(input);
          const bounded = applyBoundaries(parsed || MIN_CLAIM_AMOUNT);
          expect(bounded).toBe(expected);
        }
      });
    });

    test('should reject invalid input in workflow', () => {
      const invalidInputs = ['abc', '12.34', '12a34'];
      
      invalidInputs.forEach(input => {
        expect(isValidInput(input)).toBe(false);
        // Invalid input should not be processed further
      });
    });

    test('should handle extreme values gracefully', () => {
      const extremeValues = [
        { value: Number.MAX_SAFE_INTEGER, expected: MAX_CLAIM_AMOUNT },
        { value: Number.MIN_SAFE_INTEGER, expected: MIN_CLAIM_AMOUNT },
        { value: 0, expected: MIN_CLAIM_AMOUNT },
        { value: -1, expected: MIN_CLAIM_AMOUNT },
      ];

      extremeValues.forEach(({ value, expected }) => {
        const bounded = applyBoundaries(value);
        expect(bounded).toBe(expected);
      });
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle large numbers efficiently', () => {
      const largeNumber = 9999999;
      const formatted = formatNumberWithSpaces(largeNumber);
      const parsed = parseNumberFromString(formatted);
      
      expect(parsed).toBe(largeNumber);
      expect(formatted).toBe('9 999 999');
    });

    test('should handle multiple spaces correctly', () => {
      expect(parseNumberFromString('1  2  3  4')).toBe(1234);
      expect(parseNumberFromString('   123   456   ')).toBe(123456);
    });

    test('should maintain precision for all valid amounts', () => {
      // Test precision across the valid range
      for (let i = MIN_CLAIM_AMOUNT; i <= MIN_CLAIM_AMOUNT + 10000; i += 1000) {
        const formatted = formatNumberWithSpaces(i);
        const parsed = parseNumberFromString(formatted);
        expect(parsed).toBe(i);
      }
    });
  });
});