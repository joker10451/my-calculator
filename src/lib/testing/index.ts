/**
 * Система тестирования формул для финансовых калькуляторов
 * 
 * @author Calculator Testing System
 * @version 1.0.0
 */

export { FormulaTestSuite } from './FormulaTestSuite';

// Re-export types for convenience
export type {
  TestCase,
  TestResult,
  FormulaTestSuite as IFormulaTestSuite,
  CalculationResult
} from '@/types/validation';