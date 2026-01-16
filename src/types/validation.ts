/**
 * Типы для системы валидации калькуляторов
 * Feature: calculator-testing-validation
 */

export interface ValidationRule {
  field: string;
  min?: number;
  max?: number;
  required: boolean;
  type: 'number' | 'string' | 'date';
  customValidator?: (value: unknown) => ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  warningMessage?: string;
  code?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code: string;
}

export interface ValidationContext {
  calculatorType: 'salary' | 'credit' | 'mortgage' | 'deposit' | 'court-fee';
  currentValues: Record<string, unknown>;
  validationRules: ValidationRule[];
}

export interface InputValidator {
  validateSalaryInput(salary: number): ValidationResult;
  validateCreditInput(amount: number, term: number, rate: number): ValidationResult;
  validateNumericInput(value: number, rules: ValidationRule): ValidationResult;
  validateCourtFeeInput(claimAmount: number): ValidationResult;
}

export interface ErrorHandler {
  handleValidationError(error: ValidationError): void;
  handleCalculationError(error: CalculationError): void;
  recoverFromError(error: Error, context: Record<string, unknown>): unknown;
  logError(error: Error, context: Record<string, unknown>): void;
}

export interface CalculationError extends Error {
  type: 'division_by_zero' | 'overflow' | 'invalid_input' | 'configuration_error';
  context?: Record<string, unknown>;
  recoverable: boolean;
}

export interface TestCase {
  name: string;
  inputs: Record<string, unknown>;
  expectedOutput: unknown;
  tolerance?: number;
}

export interface TestResult {
  testName: string;
  passed: boolean;
  actualOutput?: unknown;
  expectedOutput?: unknown;
  error?: string;
  executionTime?: number;
}

export interface FormulaTestSuite {
  testCases: TestCase[];
  runTests(): TestResult[];
  addTestCase(testCase: TestCase): void;
  validateFormula(formula: (...args: unknown[]) => unknown, testCases: TestCase[]): TestResult[];
}

export interface CalculationResult<T> {
  result: T;
  metadata: {
    calculationTime: number;
    formula: string;
    inputs: Record<string, unknown>;
  };
}