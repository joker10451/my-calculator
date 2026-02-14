/**
 * Система тестирования математических формул калькуляторов
 * Обеспечивает автоматическую проверку точности расчетов
 * 
 * @author Calculator Testing System
 * @version 1.0.0
 */

import { TestCase, TestResult, FormulaTestSuite as IFormulaTestSuite } from '@/types/validation';

/**
 * Набор тестов для проверки математических формул
 * 
 * Возможности:
 * - Добавление и выполнение тест-кейсов
 * - Проверка результатов с заданной точностью
 * - Измерение времени выполнения
 * - Генерация отчетов о тестировании
 */
export class FormulaTestSuite implements IFormulaTestSuite {
  public testCases: TestCase[] = [];
  private tolerance: number = 0.01; // Допустимая погрешность по умолчанию

  constructor(tolerance?: number) {
    if (tolerance !== undefined) {
      this.tolerance = tolerance;
    }
  }

  /**
   * Добавить тест-кейс в набор
   * 
   * @param testCase - Тест-кейс для добавления
   * 
   * @example
   * ```typescript
   * const testSuite = new FormulaTestSuite();
   * testSuite.addTestCase({
   *   name: 'Расчет НДФЛ для зарплаты 50000',
   *   inputs: { salary: 50000 },
   *   expectedOutput: 6500,
   *   tolerance: 0.01
   * });
   * ```
   */
  public addTestCase(testCase: TestCase): void {
    this.testCases.push(testCase);
  }

  /**
   * Выполнить все тест-кейсы
   * 
   * @returns Массив результатов тестирования
   */
  public runTests(): TestResult[] {
    return this.testCases.map(testCase => this.runSingleTest(testCase));
  }

  /**
   * Валидация формулы с набором тест-кейсов
   * 
   * @param formula - Функция для тестирования
   * @param testCases - Массив тест-кейсов
   * @returns Результаты тестирования
   * 
   * @example
   * ```typescript
   * const results = testSuite.validateFormula(
   *   (salary) => salary * 0.13,
   *   [
   *     { name: 'НДФЛ 50000', inputs: { salary: 50000 }, expectedOutput: 6500 },
   *     { name: 'НДФЛ 100000', inputs: { salary: 100000 }, expectedOutput: 13000 }
   *   ]
   * );
   * ```
   */
  public validateFormula(formula: (...args: unknown[]) => unknown, testCases: TestCase[]): TestResult[] {
    return testCases.map(testCase => {
      const startTime = performance.now();
      
      try {
        // Выполняем формулу с входными параметрами
        const actualOutput = this.executeFormula(formula, testCase.inputs);
        const endTime = performance.now();
        
        // Проверяем результат
        const passed = this.compareResults(
          actualOutput, 
          testCase.expectedOutput, 
          testCase.tolerance || this.tolerance
        );

        return {
          testName: testCase.name,
          passed,
          actualOutput,
          expectedOutput: testCase.expectedOutput,
          executionTime: endTime - startTime
        };
      } catch (error) {
        const endTime = performance.now();
        
        return {
          testName: testCase.name,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          expectedOutput: testCase.expectedOutput,
          executionTime: endTime - startTime
        };
      }
    });
  }

  /**
   * Получить статистику выполнения тестов
   * 
   * @param results - Результаты тестирования
   * @returns Статистика тестов
   */
  public getTestStats(results: TestResult[]): {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
    averageExecutionTime: number;
    slowestTest?: TestResult;
  } {
    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = total - passed;
    const passRate = total > 0 ? (passed / total) * 100 : 0;
    
    const executionTimes = results
      .filter(r => r.executionTime !== undefined)
      .map(r => r.executionTime!);
    
    const averageExecutionTime = executionTimes.length > 0 
      ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length 
      : 0;

    const slowestTest = results
      .filter(r => r.executionTime !== undefined)
      .reduce((slowest, current) => 
        !slowest || (current.executionTime! > slowest.executionTime!) 
          ? current 
          : slowest, 
        undefined as TestResult | undefined
      );

    return {
      total,
      passed,
      failed,
      passRate,
      averageExecutionTime,
      slowestTest
    };
  }

  /**
   * Создать отчет о тестировании в текстовом формате
   * 
   * @param results - Результаты тестирования
   * @returns Текстовый отчет
   */
  public generateReport(results: TestResult[]): string {
    const stats = this.getTestStats(results);
    
    let report = `\n=== Отчет о тестировании формул ===\n`;
    report += `Всего тестов: ${stats.total}\n`;
    report += `Прошло: ${stats.passed}\n`;
    report += `Провалилось: ${stats.failed}\n`;
    report += `Процент успеха: ${stats.passRate.toFixed(1)}%\n`;
    report += `Среднее время выполнения: ${stats.averageExecutionTime.toFixed(2)}ms\n`;
    
    if (stats.slowestTest) {
      report += `Самый медленный тест: ${stats.slowestTest.testName} (${stats.slowestTest.executionTime?.toFixed(2)}ms)\n`;
    }
    
    report += `\n=== Детали тестов ===\n`;
    
    results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      report += `${status} ${result.testName}`;
      
      if (result.executionTime) {
        report += ` (${result.executionTime.toFixed(2)}ms)`;
      }
      
      if (!result.passed) {
        if (result.error) {
          report += `\n   Ошибка: ${result.error}`;
        } else {
          report += `\n   Ожидалось: ${result.expectedOutput}, получено: ${result.actualOutput}`;
        }
      }
      
      report += `\n`;
    });
    
    return report;
  }

  /**
   * Выполнить одиночный тест
   * 
   * @param testCase - Тест-кейс
   * @returns Результат теста
   */
  private runSingleTest(testCase: TestCase): TestResult {
    const startTime = performance.now();
    
    try {
      // Здесь должна быть логика выполнения конкретного теста
      // В реальном использовании это будет вызов соответствующей функции калькулятора
      throw new Error('Test execution not implemented. Use validateFormula() method instead.');
    } catch (error) {
      const endTime = performance.now();
      
      return {
        testName: testCase.name,
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        expectedOutput: testCase.expectedOutput,
        executionTime: endTime - startTime
      };
    }
  }

  /**
   * Выполнить формулу с входными параметрами
   * 
   * @param formula - Функция формулы
   * @param inputs - Входные параметры
   * @returns Результат выполнения
   */
  private executeFormula(formula: (...args: unknown[]) => unknown, inputs: Record<string, unknown>): unknown {
    // Определяем количество параметров функции
    const paramCount = formula.length;
    
    if (paramCount === 1) {
      // Функция принимает один параметр (объект или значение)
      const keys = Object.keys(inputs);
      return keys.length === 1 ? formula(inputs[keys[0]]) : formula(inputs);
    } else {
      // Функция принимает несколько параметров
      const values = Object.values(inputs);
      return formula(...values);
    }
  }

  /**
   * Сравнить результаты с учетом допустимой погрешности
   * 
   * @param actual - Фактический результат
   * @param expected - Ожидаемый результат
   * @param tolerance - Допустимая погрешность
   * @returns true если результаты совпадают в пределах погрешности
   */
  private compareResults(actual: unknown, expected: unknown, tolerance: number): boolean {
    // Точное сравнение для не-числовых значений
    if (typeof actual !== 'number' || typeof expected !== 'number') {
      return actual === expected;
    }

    // Проверка на NaN
    if (isNaN(actual) && isNaN(expected)) {
      return true;
    }
    
    if (isNaN(actual) || isNaN(expected)) {
      return false;
    }

    // Проверка на бесконечность
    if (!isFinite(actual) || !isFinite(expected)) {
      return actual === expected;
    }

    // Сравнение с допустимой погрешностью
    const difference = Math.abs(actual - expected);
    const relativeTolerance = Math.abs(expected) * tolerance;
    
    return difference <= Math.max(tolerance, relativeTolerance);
  }
}