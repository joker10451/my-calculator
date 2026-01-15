/**
 * Система обработки ошибок для финансовых калькуляторов
 * Обеспечивает graceful degradation и восстановление после ошибок
 * 
 * @author Calculator Testing System
 * @version 1.0.0
 */

import { ValidationError, CalculationError, ErrorHandler as IErrorHandler } from '@/types/validation';

/**
 * Централизованный обработчик ошибок для всех калькуляторов
 * 
 * Функции:
 * - Классификация и обработка различных типов ошибок
 * - Логирование ошибок с контекстом
 * - Стратегии восстановления после ошибок
 * - Пользовательские уведомления об ошибках
 */
export class ErrorHandler implements IErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: Array<{ timestamp: Date; error: Error; context: any }> = [];

  private constructor() {}

  /**
   * Получить единственный экземпляр ErrorHandler (Singleton)
   */
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Обработка ошибок валидации входных данных
   * 
   * @param error - Ошибка валидации
   * 
   * @example
   * ```typescript
   * const errorHandler = ErrorHandler.getInstance();
   * errorHandler.handleValidationError({
   *   field: 'salary',
   *   message: 'Зарплата не может быть отрицательной',
   *   severity: 'error',
   *   code: 'NEGATIVE_VALUE'
   * });
   * ```
   */
  public handleValidationError(error: ValidationError): void {
    this.logError(new Error(error.message), { 
      type: 'validation', 
      field: error.field, 
      code: error.code,
      severity: error.severity 
    });

    // Показываем пользователю сообщение об ошибке
    this.displayUserMessage(error.message, error.severity);
  }

  /**
   * Обработка ошибок математических расчетов
   * 
   * @param error - Ошибка расчета
   * 
   * @example
   * ```typescript
   * try {
   *   const result = calculateTax(income);
   * } catch (error) {
   *   errorHandler.handleCalculationError(error as CalculationError);
   * }
   * ```
   */
  public handleCalculationError(error: CalculationError): void {
    this.logError(error, { type: 'calculation', calculationType: error.type });

    let userMessage: string;
    
    switch (error.type) {
      case 'division_by_zero':
        userMessage = 'Ошибка в расчетах: деление на ноль. Проверьте входные данные.';
        break;
      case 'overflow':
        userMessage = 'Результат расчета слишком большой. Попробуйте уменьшить входные значения.';
        break;
      case 'invalid_input':
        userMessage = 'Некорректные входные данные. Проверьте правильность ввода.';
        break;
      case 'configuration_error':
        userMessage = 'Ошибка конфигурации системы. Обратитесь к администратору.';
        break;
      default:
        userMessage = 'Произошла ошибка при расчете. Попробуйте еще раз.';
    }

    this.displayUserMessage(userMessage, 'error');
  }

  /**
   * Восстановление после ошибки с fallback значениями
   * 
   * @param error - Произошедшая ошибка
   * @param context - Контекст выполнения
   * @returns Fallback значение или null
   */
  public recoverFromError(error: Error, context: any): any {
    this.logError(error, { ...context, recovery: true });

    // Стратегии восстановления в зависимости от типа ошибки
    if (error instanceof Error && (error.message.includes('NaN') || context.calculatorType)) {
      return this.getDefaultCalculationResult(context.calculatorType);
    }

    if (error instanceof Error && error.message.includes('network')) {
      return this.getCachedResult(context);
    }

    // Если восстановление невозможно, возвращаем null
    return null;
  }

  /**
   * Логирование ошибки с контекстом и временной меткой
   * 
   * @param error - Ошибка для логирования
   * @param context - Дополнительный контекст
   */
  public logError(error: Error, context: any): void {
    const logEntry = {
      timestamp: new Date(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    };

    // Добавляем в локальный лог
    this.errorLog.push({ timestamp: logEntry.timestamp, error, context });

    // В продакшене здесь был бы отправка на сервер логирования
    if (process.env.NODE_ENV === 'development') {
      console.error('Calculator Error:', logEntry);
    }

    // Ограничиваем размер лога
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-50);
    }
  }

  /**
   * Получить статистику ошибок для мониторинга
   * 
   * @returns Статистика ошибок
   */
  public getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    recentErrors: Array<{ timestamp: Date; message: string; type: string }>;
  } {
    const errorsByType: Record<string, number> = {};
    
    this.errorLog.forEach(entry => {
      const type = entry.context?.type || 'unknown';
      errorsByType[type] = (errorsByType[type] || 0) + 1;
    });

    const recentErrors = this.errorLog
      .slice(-10)
      .map(entry => ({
        timestamp: entry.timestamp,
        message: entry.error.message,
        type: entry.context?.type || 'unknown'
      }));

    return {
      totalErrors: this.errorLog.length,
      errorsByType,
      recentErrors
    };
  }

  /**
   * Очистка лога ошибок (для тестирования)
   */
  public clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Показать сообщение пользователю
   * 
   * @param message - Текст сообщения
   * @param severity - Уровень важности
   */
  private displayUserMessage(message: string, severity: 'error' | 'warning' | 'info'): void {
    // В реальном приложении здесь была бы интеграция с toast/notification системой
    if (typeof window !== 'undefined' && window.console) {
      const method = severity === 'error' ? 'error' : severity === 'warning' ? 'warn' : 'info';
      console[method](`Calculator ${severity}:`, message);
    }
  }

  /**
   * Получить значения по умолчанию для калькулятора
   * 
   * @param calculatorType - Тип калькулятора
   * @returns Значения по умолчанию
   */
  private getDefaultCalculationResult(calculatorType: string): any {
    switch (calculatorType) {
      case 'salary':
        return {
          netSalary: 0,
          tax: 0,
          socialContributions: 0,
          error: 'Не удалось рассчитать. Проверьте входные данные.'
        };
      case 'credit':
        return {
          monthlyPayment: 0,
          totalAmount: 0,
          overpayment: 0,
          error: 'Не удалось рассчитать кредит. Проверьте параметры.'
        };
      case 'court-fee':
        return {
          fee: 0,
          breakdown: [],
          error: 'Не удалось рассчитать госпошлину.'
        };
      default:
        return { error: 'Произошла ошибка в расчетах' };
    }
  }

  /**
   * Получить кэшированный результат (заглушка)
   * 
   * @param context - Контекст запроса
   * @returns Кэшированный результат или null
   */
  private getCachedResult(context: any): any {
    // В реальном приложении здесь была бы работа с localStorage или другим кэшем
    return null;
  }
}