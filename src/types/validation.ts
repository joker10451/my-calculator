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
  customValidator?: (value: any) => ValidationResult;
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
  currentValues: Record<string, any>;
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
  recoverFromError(error: Error, context: any): any;
  logError(error: Error, context: any): void;
}

export interface CalculationError extends Error {
  type: 'division_by_zero' | 'overflow' | 'invalid_input' | 'configuration_error';
  context?: any;
  recoverable: boolean;
}

export interface TestCase {
  name: string;
  inputs: Record<string, any>;
  expectedOutput: any;
  tolerance?: number;
}

export interface TestResult {
  testName: string;
  passed: boolean;
  actualOutput?: any;
  expectedOutput?: any;
  error?: string;
  executionTime?: number;
}

export interface FormulaTestSuite {
  testCases: TestCase[];
  runTests(): TestResult[];
  addTestCase(testCase: TestCase): void;
  validateFormula(formula: Function, testCases: TestCase[]): TestResult[];
}

export interface CalculationResult<T> {
  result: T;
  metadata: {
    calculationTime: number;
    formula: string;
    inputs: Record<string, any>;
  };
}