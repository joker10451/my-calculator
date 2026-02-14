/**
 * Система валидации и обработки ошибок для финансовых калькуляторов
 * 
 * @author Calculator Testing System
 * @version 1.0.0
 */

export { ValidationEngine } from './ValidationEngine';
export { ErrorHandler } from './ErrorHandler';

// Re-export types for convenience
export type {
  ValidationRule,
  ValidationResult,
  ValidationError,
  ValidationContext,
  InputValidator,
  ErrorHandler as IErrorHandler,
  CalculationError
} from '@/types/validation';