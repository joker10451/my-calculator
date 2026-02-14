/**
 * Property-based тесты для системы валидации
 * Feature: calculator-testing-validation, Property 4: Input Boundary Validation
 * Feature: calculator-testing-validation, Property 5: Invalid Input Rejection
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
 */

import { describe, test, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { ValidationEngine } from '@/lib/validation/ValidationEngine';

describe('ValidationEngine Property Tests', () => {
  let validator: ValidationEngine;

  beforeEach(() => {
    validator = ValidationEngine.getInstance();
  });

  describe('Property 4: Input Boundary Validation', () => {
    test('should reject salary inputs below minimum wage', () => {
      // Feature: calculator-testing-validation, Property 4: Input Boundary Validation
      fc.assert(
        fc.property(
          fc.integer({ min: -1000000, max: 19241 }), // Значения ниже МРОТ 2026
          (salary) => {
            const result = validator.validateSalaryInput(salary);
            
            if (salary < 0) {
              expect(result.isValid).toBe(false);
              expect(result.code).toBe('NEGATIVE_VALUE');
            } else if (salary < 19242) {
              expect(result.isValid).toBe(false);
              expect(result.code).toBe('BELOW_MINIMUM_WAGE');
            }
            
            expect(result.errorMessage).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should reject salary inputs above maximum threshold', () => {
      // Feature: calculator-testing-validation, Property 4: Input Boundary Validation
      fc.assert(
        fc.property(
          fc.integer({ min: 10000001, max: 50000000 }), // Значения выше максимума
          (salary) => {
            const result = validator.validateSalaryInput(salary);
            
            expect(result.isValid).toBe(false);
            expect(result.code).toBe('ABOVE_MAXIMUM');
            expect(result.errorMessage).toContain('превышает максимально допустимое');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should accept valid salary inputs within range', () => {
      // Feature: calculator-testing-validation, Property 4: Input Boundary Validation
      fc.assert(
        fc.property(
          fc.integer({ min: 19242, max: 1000000 }), // Валидный диапазон
          (salary) => {
            const result = validator.validateSalaryInput(salary);
            
            expect(result.isValid).toBe(true);
            expect(result.errorMessage).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should show warning for very high but valid salaries', () => {
      // Feature: calculator-testing-validation, Property 4: Input Boundary Validation
      fc.assert(
        fc.property(
          fc.integer({ min: 1000001, max: 10000000 }), // Очень высокие зарплаты
          (salary) => {
            const result = validator.validateSalaryInput(salary);
            
            expect(result.isValid).toBe(true);
            expect(result.warningMessage).toBeDefined();
            expect(result.code).toBe('HIGH_SALARY_WARNING');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5: Invalid Input Rejection', () => {
    test('should reject non-numeric salary inputs', () => {
      // Feature: calculator-testing-validation, Property 5: Invalid Input Rejection
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string(),
            fc.constant(null),
            fc.constant(undefined),
            fc.constant(NaN)
          ),
          (invalidInput) => {
            const result = validator.validateSalaryInput(invalidInput as any);
            
            expect(result.isValid).toBe(false);
            expect(result.code).toBe('INVALID_TYPE');
            expect(result.errorMessage).toContain('должна быть числом');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should handle infinite salary inputs as above maximum', () => {
      // Feature: calculator-testing-validation, Property 5: Invalid Input Rejection
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(Infinity),
            fc.constant(-Infinity)
          ),
          (infiniteInput) => {
            const result = validator.validateSalaryInput(infiniteInput as any);
            
            expect(result.isValid).toBe(false);
            // Infinity обрабатывается как число выше максимума
            if (infiniteInput === Infinity) {
              expect(result.code).toBe('ABOVE_MAXIMUM');
            } else {
              expect(result.code).toBe('NEGATIVE_VALUE');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should reject invalid credit parameters', () => {
      // Feature: calculator-testing-validation, Property 5: Invalid Input Rejection
      fc.assert(
        fc.property(
          fc.record({
            amount: fc.oneof(
              fc.integer({ min: -1000000, max: 9999 }), // Слишком маленькая сумма
              fc.integer({ min: 100000001, max: 500000000 }) // Слишком большая сумма
            ),
            term: fc.integer({ min: 1, max: 360 }), // Валидный срок
            rate: fc.integer({ min: 1, max: 50 }) // Валидная ставка (целые числа)
          }),
          ({ amount, term, rate }) => {
            const result = validator.validateCreditInput(amount, term, rate);
            
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toContain('Сумма кредита');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should reject invalid loan terms', () => {
      // Feature: calculator-testing-validation, Property 5: Invalid Input Rejection
      fc.assert(
        fc.property(
          fc.record({
            amount: fc.integer({ min: 10000, max: 100000000 }), // Валидная сумма
            term: fc.oneof(
              fc.integer({ min: -100, max: 0 }), // Отрицательный или нулевой срок
              fc.integer({ min: 361, max: 1000 }) // Слишком большой срок
            ),
            rate: fc.integer({ min: 1, max: 50 }) // Валидная ставка (целые числа)
          }),
          ({ amount, term, rate }) => {
            const result = validator.validateCreditInput(amount, term, rate);
            
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toContain('Срок кредита');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should reject invalid interest rates', () => {
      // Feature: calculator-testing-validation, Property 5: Invalid Input Rejection
      fc.assert(
        fc.property(
          fc.record({
            amount: fc.integer({ min: 10000, max: 100000000 }), // Валидная сумма
            term: fc.integer({ min: 1, max: 360 }), // Валидный срок
            rate: fc.oneof(
              fc.integer({ min: -10, max: 0 }), // Слишком низкая ставка
              fc.integer({ min: 51, max: 100 }) // Слишком высокая ставка
            )
          }),
          ({ amount, term, rate }) => {
            const result = validator.validateCreditInput(amount, term, rate);
            
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toContain('Процентная ставка');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should accept valid credit parameters', () => {
      // Feature: calculator-testing-validation, Property 5: Invalid Input Rejection
      fc.assert(
        fc.property(
          fc.record({
            amount: fc.integer({ min: 10000, max: 100000000 }),
            term: fc.integer({ min: 1, max: 360 }),
            rate: fc.integer({ min: 1, max: 50 })
          }),
          ({ amount, term, rate }) => {
            const result = validator.validateCreditInput(amount, term, rate);
            
            expect(result.isValid).toBe(true);
            expect(result.errorMessage).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property: Court Fee Input Validation', () => {
    test('should validate court fee claim amounts correctly', () => {
      // Feature: calculator-testing-validation, Property 4: Input Boundary Validation
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000000000 }), // Валидный диапазон для цены иска
          (claimAmount) => {
            const result = validator.validateCourtFeeInput(claimAmount);
            
            expect(result.isValid).toBe(true);
            expect(result.errorMessage).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should reject invalid court fee claim amounts', () => {
      // Feature: calculator-testing-validation, Property 5: Invalid Input Rejection
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer({ min: -1000000, max: 0 }), // Отрицательные и нулевые значения
            fc.integer({ min: 1000000001, max: 2000000000 }) // Слишком большие значения
          ),
          (claimAmount) => {
            const result = validator.validateCourtFeeInput(claimAmount);
            
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property: Input Sanitization', () => {
    test('should sanitize string inputs correctly', () => {
      // Feature: calculator-testing-validation, Property 5: Invalid Input Rejection
      fc.assert(
        fc.property(
          fc.string().filter(s => s.includes('<') || s.includes('>') || s.includes('"')),
          (maliciousString) => {
            const sanitized = validator.sanitizeInput(maliciousString);
            
            expect(typeof sanitized).toBe('string');
            expect(sanitized).not.toContain('<');
            expect(sanitized).not.toContain('>');
            expect(sanitized).not.toContain('"');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should handle infinite and NaN numbers', () => {
      // Feature: calculator-testing-validation, Property 5: Invalid Input Rejection
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(Infinity),
            fc.constant(-Infinity),
            fc.constant(NaN)
          ),
          (invalidNumber) => {
            const sanitized = validator.sanitizeInput(invalidNumber);
            
            if (invalidNumber === Infinity || invalidNumber === -Infinity || isNaN(invalidNumber)) {
              expect(sanitized).toBe(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should preserve valid numbers', () => {
      // Feature: calculator-testing-validation, Property 4: Input Boundary Validation
      fc.assert(
        fc.property(
          fc.float({ min: -1000000, max: 1000000 }).filter(n => isFinite(n)),
          (validNumber) => {
            const sanitized = validator.sanitizeInput(validNumber);
            
            expect(sanitized).toBe(validNumber);
            expect(isFinite(sanitized)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});