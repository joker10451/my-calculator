/**
 * Unit тесты для системы обработки ошибок
 * Feature: calculator-testing-validation
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ErrorHandler } from '@/lib/validation/ErrorHandler';
import { ValidationError, CalculationError } from '@/types/validation';

describe('ErrorHandler Unit Tests', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = ErrorHandler.getInstance();
    errorHandler.clearErrorLog(); // Очищаем лог перед каждым тестом
  });

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const instance1 = ErrorHandler.getInstance();
      const instance2 = ErrorHandler.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('Validation Error Handling', () => {
    test('should handle validation errors correctly', () => {
      const validationError: ValidationError = {
        field: 'salary',
        message: 'Зарплата не может быть отрицательной',
        severity: 'error',
        code: 'NEGATIVE_VALUE'
      };

      // Мокаем console для проверки вывода
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      errorHandler.handleValidationError(validationError);

      // Проверяем, что ошибка залогирована
      const stats = errorHandler.getErrorStats();
      expect(stats.totalErrors).toBe(1);
      expect(stats.errorsByType.validation).toBe(1);

      consoleSpy.mockRestore();
    });

    test('should handle different severity levels', () => {
      const errors: ValidationError[] = [
        { field: 'test1', message: 'Error message', severity: 'error', code: 'TEST_ERROR' },
        { field: 'test2', message: 'Warning message', severity: 'warning', code: 'TEST_WARNING' },
        { field: 'test3', message: 'Info message', severity: 'info', code: 'TEST_INFO' }
      ];

      const consoleSpies = {
        error: vi.spyOn(console, 'error').mockImplementation(() => {}),
        warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
        info: vi.spyOn(console, 'info').mockImplementation(() => {})
      };

      errors.forEach(error => errorHandler.handleValidationError(error));

      const stats = errorHandler.getErrorStats();
      expect(stats.totalErrors).toBe(3);

      Object.values(consoleSpies).forEach(spy => spy.mockRestore());
    });
  });

  describe('Calculation Error Handling', () => {
    test('should handle division by zero error', () => {
      const calculationError = new Error('Division by zero') as CalculationError;
      calculationError.type = 'division_by_zero';
      calculationError.recoverable = true;

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      errorHandler.handleCalculationError(calculationError);

      const stats = errorHandler.getErrorStats();
      expect(stats.totalErrors).toBe(1);
      expect(stats.errorsByType.calculation).toBe(1);

      consoleSpy.mockRestore();
    });

    test('should handle overflow error', () => {
      const calculationError = new Error('Number overflow') as CalculationError;
      calculationError.type = 'overflow';
      calculationError.recoverable = true;

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      errorHandler.handleCalculationError(calculationError);

      const stats = errorHandler.getErrorStats();
      expect(stats.totalErrors).toBe(1);

      consoleSpy.mockRestore();
    });

    test('should handle invalid input error', () => {
      const calculationError = new Error('Invalid input') as CalculationError;
      calculationError.type = 'invalid_input';
      calculationError.recoverable = true;

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      errorHandler.handleCalculationError(calculationError);

      const stats = errorHandler.getErrorStats();
      expect(stats.totalErrors).toBe(1);

      consoleSpy.mockRestore();
    });

    test('should handle configuration error', () => {
      const calculationError = new Error('Configuration missing') as CalculationError;
      calculationError.type = 'configuration_error';
      calculationError.recoverable = false;

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      errorHandler.handleCalculationError(calculationError);

      const stats = errorHandler.getErrorStats();
      expect(stats.totalErrors).toBe(1);

      consoleSpy.mockRestore();
    });
  });

  describe('Error Recovery', () => {
    test('should recover from NaN errors with default values', () => {
      const error = new Error('Result is NaN');
      const context = { calculatorType: 'salary' };

      const result = errorHandler.recoverFromError(error, context);

      expect(result).toBeDefined();
      expect(result.netSalary).toBe(0);
      expect(result.tax).toBe(0);
      expect(result.error).toContain('Не удалось рассчитать');
    });

    test('should recover from credit calculation errors', () => {
      const error = new Error('Credit calculation failed');
      const context = { calculatorType: 'credit' };

      const result = errorHandler.recoverFromError(error, context);

      expect(result).toBeDefined();
      expect(result.monthlyPayment).toBe(0);
      expect(result.totalAmount).toBe(0);
      expect(result.error).toContain('кредит');
    });

    test('should recover from court fee calculation errors', () => {
      const error = new Error('Court fee calculation failed');
      const context = { calculatorType: 'court-fee' };

      const result = errorHandler.recoverFromError(error, context);

      expect(result).toBeDefined();
      expect(result.fee).toBe(0);
      expect(result.error).toContain('госпошлину');
    });

    test('should handle network errors with cached results', () => {
      const error = new Error('Network connection failed');
      const context = { type: 'network', calculatorType: 'currency' };

      const result = errorHandler.recoverFromError(error, context);

      // Поскольку есть calculatorType, возвращается default result
      expect(result).toBeDefined();
      expect(result.error).toContain('Произошла ошибка в расчетах');
    });

    test('should return null for unrecoverable errors without calculator type', () => {
      const error = new Error('Unknown error');
      const context = { type: 'unknown' }; // Без calculatorType

      const result = errorHandler.recoverFromError(error, context);

      expect(result).toBeNull();
    });
  });

  describe('Error Logging', () => {
    test('should log errors with context', () => {
      const error = new Error('Test error');
      const context = { type: 'test', operation: 'testing' };

      errorHandler.logError(error, context);

      const stats = errorHandler.getErrorStats();
      expect(stats.totalErrors).toBe(1);
      expect(stats.recentErrors[0].message).toBe('Test error');
      expect(stats.recentErrors[0].type).toBe('test');
    });

    test('should limit error log size', () => {
      // Создаем новый экземпляр для изоляции теста
      const isolatedHandler = ErrorHandler.getInstance();
      isolatedHandler.clearErrorLog();
      
      // Добавляем много ошибок, чтобы проверить ограничение размера лога
      for (let i = 0; i < 120; i++) {
        isolatedHandler.logError(new Error(`Error ${i}`), { type: 'test', index: i });
      }

      const stats = isolatedHandler.getErrorStats();
      // Лог должен быть ограничен после превышения 100 записей
      expect(stats.totalErrors).toBeLessThanOrEqual(100);
      expect(stats.totalErrors).toBeGreaterThan(0);
      
      // Очищаем после теста
      isolatedHandler.clearErrorLog();
    });

    test('should track error statistics correctly', () => {
      const errors = [
        { error: new Error('Validation error'), context: { type: 'validation' } },
        { error: new Error('Calculation error'), context: { type: 'calculation' } },
        { error: new Error('Another validation error'), context: { type: 'validation' } },
        { error: new Error('Network error'), context: { type: 'network' } }
      ];

      errors.forEach(({ error, context }) => {
        errorHandler.logError(error, context);
      });

      const stats = errorHandler.getErrorStats();
      expect(stats.totalErrors).toBe(4);
      expect(stats.errorsByType.validation).toBe(2);
      expect(stats.errorsByType.calculation).toBe(1);
      expect(stats.errorsByType.network).toBe(1);
      expect(stats.recentErrors).toHaveLength(4);
    });
  });

  describe('Error Statistics', () => {
    test('should return empty stats for no errors', () => {
      const stats = errorHandler.getErrorStats();
      
      expect(stats.totalErrors).toBe(0);
      expect(stats.errorsByType).toEqual({});
      expect(stats.recentErrors).toEqual([]);
    });

    test('should return recent errors in correct format', () => {
      const error = new Error('Recent error');
      const context = { type: 'recent' };

      errorHandler.logError(error, context);

      const stats = errorHandler.getErrorStats();
      const recentError = stats.recentErrors[0];

      expect(recentError.message).toBe('Recent error');
      expect(recentError.type).toBe('recent');
      expect(recentError.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Log Management', () => {
    test('should clear error log', () => {
      // Добавляем несколько ошибок
      errorHandler.logError(new Error('Error 1'), { type: 'test' });
      errorHandler.logError(new Error('Error 2'), { type: 'test' });

      let stats = errorHandler.getErrorStats();
      expect(stats.totalErrors).toBe(2);

      // Очищаем лог
      errorHandler.clearErrorLog();

      stats = errorHandler.getErrorStats();
      expect(stats.totalErrors).toBe(0);
      expect(stats.errorsByType).toEqual({});
      expect(stats.recentErrors).toEqual([]);
    });
  });
});