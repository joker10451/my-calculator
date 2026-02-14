/**
 * Property-based тесты для инфраструктуры тестирования
 * Feature: calculator-testing-validation, Property 1: Comprehensive Test Coverage
 * Validates: Requirements 1.1, 1.2, 1.6
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { FormulaTestSuite } from '@/lib/testing/FormulaTestSuite';
import { ValidationEngine } from '@/lib/validation/ValidationEngine';
import { ErrorHandler } from '@/lib/validation/ErrorHandler';

describe('Test Framework Infrastructure Property Tests', () => {
  describe('Property 1: Comprehensive Test Coverage', () => {
    test('should execute property-based tests with fast-check integration', () => {
      // Feature: calculator-testing-validation, Property 1: Comprehensive Test Coverage
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }),
          (testValue) => {
            // Проверяем, что fast-check корректно генерирует значения
            expect(typeof testValue).toBe('number');
            expect(testValue).toBeGreaterThanOrEqual(1);
            expect(testValue).toBeLessThanOrEqual(1000);
            expect(Number.isInteger(testValue)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should validate test suite creation and execution', () => {
      // Feature: calculator-testing-validation, Property 1: Comprehensive Test Coverage
      const testSuite = new FormulaTestSuite(0.01);
      
      // Добавляем простой тест-кейс
      testSuite.addTestCase({
        name: 'Simple addition test',
        inputs: { a: 5, b: 3 },
        expectedOutput: 8
      });

      // Проверяем, что тест-кейс добавился
      expect(testSuite.testCases).toHaveLength(1);
      expect(testSuite.testCases[0].name).toBe('Simple addition test');
      
      // Тестируем выполнение формулы
      const additionFormula = (a: number, b: number) => a + b;
      const results = testSuite.validateFormula(additionFormula, testSuite.testCases);
      
      expect(results).toHaveLength(1);
      expect(results[0].passed).toBe(true);
      expect(results[0].actualOutput).toBe(8);
    });

    test('should handle test execution with various input types', () => {
      // Feature: calculator-testing-validation, Property 1: Comprehensive Test Coverage
      fc.assert(
        fc.property(
          fc.record({
            a: fc.integer({ min: -1000, max: 1000 }),
            b: fc.integer({ min: -1000, max: 1000 })
          }),
          ({ a, b }) => {
            const testSuite = new FormulaTestSuite();
            const multiplyFormula = (x: number, y: number) => x * y;
            
            const testCase = {
              name: `Multiply ${a} * ${b}`,
              inputs: { a, b },
              expectedOutput: a * b
            };

            const results = testSuite.validateFormula(multiplyFormula, [testCase]);
            
            expect(results).toHaveLength(1);
            expect(results[0].passed).toBe(true);
            expect(results[0].actualOutput).toBe(a * b);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should validate error handling in test execution', () => {
      // Feature: calculator-testing-validation, Property 1: Comprehensive Test Coverage
      const testSuite = new FormulaTestSuite();
      
      // Формула, которая вызывает ошибку при делении на ноль
      const divisionFormula = (a: number, b: number) => {
        if (b === 0) throw new Error('Division by zero');
        return a / b;
      };

      const testCase = {
        name: 'Division by zero test',
        inputs: { a: 10, b: 0 },
        expectedOutput: Infinity
      };

      const results = testSuite.validateFormula(divisionFormula, [testCase]);
      
      expect(results).toHaveLength(1);
      expect(results[0].passed).toBe(false);
      expect(results[0].error).toContain('Division by zero');
    });

    test('should generate comprehensive test statistics', () => {
      // Feature: calculator-testing-validation, Property 1: Comprehensive Test Coverage
      fc.assert(
        fc.property(
          fc.array(fc.boolean(), { minLength: 1, maxLength: 20 }),
          (testResults) => {
            const testSuite = new FormulaTestSuite();
            
            // Создаем результаты тестов на основе сгенерированных булевых значений
            const mockResults = testResults.map((passed, index) => ({
              testName: `Test ${index}`,
              passed,
              actualOutput: passed ? 'correct' : 'incorrect',
              expectedOutput: 'correct',
              executionTime: Math.random() * 100
            }));

            const stats = testSuite.getTestStats(mockResults);
            
            expect(stats.total).toBe(testResults.length);
            expect(stats.passed).toBe(testResults.filter(r => r).length);
            expect(stats.failed).toBe(testResults.filter(r => !r).length);
            expect(stats.passRate).toBe((stats.passed / stats.total) * 100);
            expect(stats.averageExecutionTime).toBeGreaterThanOrEqual(0);
            
            if (stats.slowestTest) {
              expect(stats.slowestTest.executionTime).toBeDefined();
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    test('should validate ValidationEngine singleton pattern', () => {
      // Feature: calculator-testing-validation, Property 1: Comprehensive Test Coverage
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          (iterations) => {
            const instances = [];
            
            // Создаем несколько экземпляров
            for (let i = 0; i < iterations; i++) {
              instances.push(ValidationEngine.getInstance());
            }
            
            // Все экземпляры должны быть одинаковыми
            const firstInstance = instances[0];
            instances.forEach(instance => {
              expect(instance).toBe(firstInstance);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should validate ErrorHandler singleton pattern', () => {
      // Feature: calculator-testing-validation, Property 1: Comprehensive Test Coverage
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          (iterations) => {
            const instances = [];
            
            // Создаем несколько экземпляров
            for (let i = 0; i < iterations; i++) {
              instances.push(ErrorHandler.getInstance());
            }
            
            // Все экземпляры должны быть одинаковыми
            const firstInstance = instances[0];
            instances.forEach(instance => {
              expect(instance).toBe(firstInstance);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should validate test tolerance handling', () => {
      // Feature: calculator-testing-validation, Property 1: Comprehensive Test Coverage
      fc.assert(
        fc.property(
          fc.record({
            value: fc.integer({ min: 1, max: 100 }),
            tolerance: fc.integer({ min: 1, max: 10 }).map(x => x / 100) // 0.01 to 0.1
          }),
          ({ value, tolerance }) => {
            const testSuite = new FormulaTestSuite(tolerance);
            
            // Создаем тест с небольшой погрешностью
            const slightlyOffValue = value + (tolerance * 0.5); // Половина от допустимой погрешности
            
            const identityFormula = (x: number) => x;
            const testCase = {
              name: 'Tolerance test',
              inputs: { x: value },
              expectedOutput: slightlyOffValue,
              tolerance
            };

            const results = testSuite.validateFormula(identityFormula, [testCase]);
            
            expect(results).toHaveLength(1);
            // Тест должен пройти, так как погрешность в пределах допустимой
            expect(results[0].passed).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should generate proper test reports', () => {
      // Feature: calculator-testing-validation, Property 1: Comprehensive Test Coverage
      const testSuite = new FormulaTestSuite();
      
      const mockResults = [
        { testName: 'Test 1', passed: true, executionTime: 10 },
        { testName: 'Test 2', passed: false, error: 'Test error', executionTime: 20 },
        { testName: 'Test 3', passed: true, executionTime: 15 }
      ];

      const report = testSuite.generateReport(mockResults);
      
      expect(report).toContain('Отчет о тестировании формул');
      expect(report).toContain('Всего тестов: 3');
      expect(report).toContain('Прошло: 2');
      expect(report).toContain('Провалилось: 1');
      expect(report).toContain('✅ PASS Test 1');
      expect(report).toContain('❌ FAIL Test 2');
      expect(report).toContain('✅ PASS Test 3');
      expect(report).toContain('Test error');
    });
  });
});