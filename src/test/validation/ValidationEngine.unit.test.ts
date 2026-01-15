/**
 * Unit тесты для системы валидации
 * Проверяют конкретные случаи и граничные значения
 * Feature: calculator-testing-validation
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { ValidationEngine } from '@/lib/validation/ValidationEngine';

describe('ValidationEngine Unit Tests', () => {
  let validator: ValidationEngine;

  beforeEach(() => {
    validator = ValidationEngine.getInstance();
  });

  describe('Salary Input Validation', () => {
    test('should accept minimum wage (МРОТ 2026)', () => {
      const result = validator.validateSalaryInput(19242);
      
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    test('should reject salary below minimum wage', () => {
      const result = validator.validateSalaryInput(19241);
      
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('BELOW_MINIMUM_WAGE');
      expect(result.errorMessage).toContain('МРОТ');
    });

    test('should reject negative salary', () => {
      const result = validator.validateSalaryInput(-1000);
      
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('NEGATIVE_VALUE');
      expect(result.errorMessage).toContain('отрицательной');
    });

    test('should reject salary above maximum', () => {
      const result = validator.validateSalaryInput(10000001);
      
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('ABOVE_MAXIMUM');
      expect(result.errorMessage).toContain('превышает максимально');
    });

    test('should show warning for very high salary', () => {
      const result = validator.validateSalaryInput(2000000);
      
      expect(result.isValid).toBe(true);
      expect(result.warningMessage).toBeDefined();
      expect(result.code).toBe('HIGH_SALARY_WARNING');
    });

    test('should reject NaN input', () => {
      const result = validator.validateSalaryInput(NaN);
      
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('INVALID_TYPE');
    });

    test('should reject string input', () => {
      const result = validator.validateSalaryInput('50000' as any);
      
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('INVALID_TYPE');
    });
  });

  describe('Credit Input Validation', () => {
    test('should accept valid credit parameters', () => {
      const result = validator.validateCreditInput(1000000, 120, 12.5);
      
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    test('should reject credit amount below minimum', () => {
      const result = validator.validateCreditInput(9999, 120, 12.5);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Сумма кредита');
    });

    test('should reject credit amount above maximum', () => {
      const result = validator.validateCreditInput(100000001, 120, 12.5);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Сумма кредита');
    });

    test('should reject zero loan term', () => {
      const result = validator.validateCreditInput(1000000, 0, 12.5);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Срок кредита');
    });

    test('should reject loan term above maximum', () => {
      const result = validator.validateCreditInput(1000000, 361, 12.5);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Срок кредита');
    });

    test('should reject interest rate below minimum', () => {
      const result = validator.validateCreditInput(1000000, 120, 0.05);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Процентная ставка');
    });

    test('should reject interest rate above maximum', () => {
      const result = validator.validateCreditInput(1000000, 120, 51);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Процентная ставка');
    });

    test('should accept minimum valid parameters', () => {
      const result = validator.validateCreditInput(10000, 1, 0.1);
      
      expect(result.isValid).toBe(true);
    });

    test('should accept maximum valid parameters', () => {
      const result = validator.validateCreditInput(100000000, 360, 50);
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('Court Fee Input Validation', () => {
    test('should accept valid claim amounts', () => {
      const testCases = [1, 1000, 50000, 1000000, 1000000000];
      
      testCases.forEach(amount => {
        const result = validator.validateCourtFeeInput(amount);
        expect(result.isValid).toBe(true);
      });
    });

    test('should reject zero claim amount', () => {
      const result = validator.validateCourtFeeInput(0);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('не может быть меньше');
    });

    test('should reject negative claim amount', () => {
      const result = validator.validateCourtFeeInput(-1000);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('не может быть меньше');
    });

    test('should reject claim amount above maximum', () => {
      const result = validator.validateCourtFeeInput(1000000001);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('не может быть больше');
    });
  });

  describe('Numeric Input Validation', () => {
    test('should validate required field', () => {
      const result = validator.validateNumericInput(null as any, {
        field: 'testField',
        required: true,
        type: 'number'
      });
      
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('REQUIRED_FIELD');
      expect(result.errorMessage).toContain('обязательно');
    });

    test('should validate type checking', () => {
      const result = validator.validateNumericInput('not a number' as any, {
        field: 'testField',
        required: true,
        type: 'number'
      });
      
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('INVALID_TYPE');
      expect(result.errorMessage).toContain('должно быть числом');
    });

    test('should validate minimum value', () => {
      const result = validator.validateNumericInput(5, {
        field: 'testField',
        min: 10,
        required: true,
        type: 'number'
      });
      
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('BELOW_MINIMUM');
    });

    test('should validate maximum value', () => {
      const result = validator.validateNumericInput(15, {
        field: 'testField',
        max: 10,
        required: true,
        type: 'number'
      });
      
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('ABOVE_MAXIMUM');
    });

    test('should use custom validator', () => {
      const customValidator = (value: number) => ({
        isValid: value % 2 === 0,
        errorMessage: value % 2 !== 0 ? 'Число должно быть четным' : undefined
      });

      const result = validator.validateNumericInput(7, {
        field: 'testField',
        required: true,
        type: 'number',
        customValidator
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('четным');
    });
  });

  describe('Input Sanitization', () => {
    test('should sanitize malicious strings', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'test"quote',
        "test'quote",
        'test&amp;',
        'test<>brackets'
      ];

      maliciousInputs.forEach(input => {
        const sanitized = validator.sanitizeInput(input);
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('>');
        expect(sanitized).not.toContain('"');
        expect(sanitized).not.toContain("'");
        expect(sanitized).not.toContain('&');
      });
    });

    test('should handle infinite numbers', () => {
      expect(validator.sanitizeInput(Infinity)).toBe(0);
      expect(validator.sanitizeInput(-Infinity)).toBe(0);
    });

    test('should handle NaN', () => {
      expect(validator.sanitizeInput(NaN)).toBe(0);
    });

    test('should preserve valid numbers', () => {
      const validNumbers = [0, 1, -1, 3.14, -2.71, 1000000];
      
      validNumbers.forEach(num => {
        expect(validator.sanitizeInput(num)).toBe(num);
      });
    });

    test('should trim whitespace from strings', () => {
      expect(validator.sanitizeInput('  test  ')).toBe('test');
      expect(validator.sanitizeInput('\n\ttest\n\t')).toBe('test');
    });
  });

  describe('Error Creation', () => {
    test('should create calculation error with context', () => {
      const error = validator.createCalculationError(
        'division_by_zero',
        'Cannot divide by zero',
        { operation: 'divide', dividend: 10, divisor: 0 }
      );

      expect(error.type).toBe('division_by_zero');
      expect(error.message).toBe('Cannot divide by zero');
      expect(error.context).toEqual({ operation: 'divide', dividend: 10, divisor: 0 });
      expect(error.recoverable).toBe(true);
    });

    test('should mark configuration errors as non-recoverable', () => {
      const error = validator.createCalculationError(
        'configuration_error',
        'Missing tax configuration'
      );

      expect(error.recoverable).toBe(false);
    });
  });

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const instance1 = ValidationEngine.getInstance();
      const instance2 = ValidationEngine.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });
});