/**
 * Движок валидации для финансовых калькуляторов
 * Обеспечивает проверку входных данных и предотвращение ошибок расчетов
 * 
 * @author Calculator Testing System
 * @version 1.0.0
 */

import { 
  ValidationRule, 
  ValidationResult, 
  ValidationError, 
  ValidationContext,
  InputValidator,
  CalculationError 
} from '@/types/validation';

/**
 * Основной класс для валидации входных данных калькуляторов
 * 
 * Поддерживает:
 * - Валидацию числовых значений с диапазонами
 * - Проверку специфичных для калькулятора правил
 * - Санитизацию входных данных
 * - Обработку ошибок с восстановлением состояния
 */
export class ValidationEngine implements InputValidator {
  private static instance: ValidationEngine;
  
  // Константы для валидации (источник: российское законодательство 2026)
  private static readonly MINIMUM_WAGE_2026 = 19242; // МРОТ на 2026 год
  private static readonly MAXIMUM_SALARY = 10000000; // Максимальная зарплата для расчетов
  private static readonly MIN_CREDIT_AMOUNT = 10000; // Минимальная сумма кредита
  private static readonly MAX_CREDIT_AMOUNT = 100000000; // Максимальная сумма кредита
  private static readonly MIN_INTEREST_RATE = 0.1; // Минимальная процентная ставка (0.1%)
  private static readonly MAX_INTEREST_RATE = 50; // Максимальная процентная ставка (50%)
  private static readonly MIN_LOAN_TERM = 1; // Минимальный срок кредита (месяцы)
  private static readonly MAX_LOAN_TERM = 360; // Максимальный срок кредита (30 лет)
  private static readonly MIN_COURT_FEE_AMOUNT = 1; // Минимальная цена иска
  private static readonly MAX_COURT_FEE_AMOUNT = 1000000000; // Максимальная цена иска

  private constructor() {}

  /**
   * Получить единственный экземпляр ValidationEngine (Singleton)
   */
  public static getInstance(): ValidationEngine {
    if (!ValidationEngine.instance) {
      ValidationEngine.instance = new ValidationEngine();
    }
    return ValidationEngine.instance;
  }

  /**
   * Валидация входных данных для калькулятора зарплаты
   * 
   * @param salary - Размер заработной платы в рублях
   * @returns Результат валидации с сообщениями об ошибках
   * 
   * @example
   * ```typescript
   * const validator = ValidationEngine.getInstance();
   * const result = validator.validateSalaryInput(50000);
   * if (!result.isValid) {
   *   console.error(result.errorMessage);
   * }
   * ```
   */
  public validateSalaryInput(salary: number): ValidationResult {
    // Проверка на корректность типа данных
    if (typeof salary !== 'number' || isNaN(salary)) {
      return {
        isValid: false,
        errorMessage: 'Заработная плата должна быть числом',
        code: 'INVALID_TYPE'
      };
    }

    // Проверка на отрицательные значения
    if (salary < 0) {
      return {
        isValid: false,
        errorMessage: 'Заработная плата не может быть отрицательной',
        code: 'NEGATIVE_VALUE'
      };
    }

    // Проверка минимального размера (МРОТ)
    if (salary < ValidationEngine.MINIMUM_WAGE_2026) {
      return {
        isValid: false,
        errorMessage: `Заработная плата не может быть меньше МРОТ (${ValidationEngine.MINIMUM_WAGE_2026.toLocaleString('ru-RU')} ₽)`,
        code: 'BELOW_MINIMUM_WAGE'
      };
    }

    // Предупреждение о высокой зарплате
    if (salary > ValidationEngine.MAXIMUM_SALARY) {
      return {
        isValid: false,
        errorMessage: `Заработная плата превышает максимально допустимое значение (${ValidationEngine.MAXIMUM_SALARY.toLocaleString('ru-RU')} ₽)`,
        code: 'ABOVE_MAXIMUM'
      };
    }

    // Предупреждение о необычно высокой зарплате
    if (salary > 1000000) {
      return {
        isValid: true,
        warningMessage: 'Указана очень высокая заработная плата. Проверьте правильность ввода.',
        code: 'HIGH_SALARY_WARNING'
      };
    }

    return { isValid: true };
  }

  /**
   * Валидация входных данных для кредитного калькулятора
   * 
   * @param amount - Сумма кредита в рублях
   * @param term - Срок кредита в месяцах
   * @param rate - Процентная ставка в процентах годовых
   * @returns Результат валидации
   * 
   * @example
   * ```typescript
   * const result = validator.validateCreditInput(1000000, 120, 12.5);
   * ```
   */
  public validateCreditInput(amount: number, term: number, rate: number): ValidationResult {
    // Валидация суммы кредита
    const amountValidation = this.validateNumericInput(amount, {
      field: 'amount',
      min: ValidationEngine.MIN_CREDIT_AMOUNT,
      max: ValidationEngine.MAX_CREDIT_AMOUNT,
      required: true,
      type: 'number'
    });

    if (!amountValidation.isValid) {
      return {
        ...amountValidation,
        errorMessage: `Сумма кредита: ${amountValidation.errorMessage}`
      };
    }

    // Валидация срока кредита
    const termValidation = this.validateNumericInput(term, {
      field: 'term',
      min: ValidationEngine.MIN_LOAN_TERM,
      max: ValidationEngine.MAX_LOAN_TERM,
      required: true,
      type: 'number'
    });

    if (!termValidation.isValid) {
      return {
        ...termValidation,
        errorMessage: `Срок кредита: ${termValidation.errorMessage}`
      };
    }

    // Валидация процентной ставки
    const rateValidation = this.validateNumericInput(rate, {
      field: 'rate',
      min: ValidationEngine.MIN_INTEREST_RATE,
      max: ValidationEngine.MAX_INTEREST_RATE,
      required: true,
      type: 'number'
    });

    if (!rateValidation.isValid) {
      return {
        ...rateValidation,
        errorMessage: `Процентная ставка: ${rateValidation.errorMessage}`
      };
    }

    return { isValid: true };
  }

  /**
   * Валидация входных данных для калькулятора госпошлины
   * 
   * @param claimAmount - Цена иска в рублях
   * @returns Результат валидации
   */
  public validateCourtFeeInput(claimAmount: number): ValidationResult {
    return this.validateNumericInput(claimAmount, {
      field: 'claimAmount',
      min: ValidationEngine.MIN_COURT_FEE_AMOUNT,
      max: ValidationEngine.MAX_COURT_FEE_AMOUNT,
      required: true,
      type: 'number'
    });
  }

  /**
   * Универсальная валидация числовых значений
   * 
   * @param value - Значение для проверки
   * @param rules - Правила валидации
   * @returns Результат валидации
   */
  public validateNumericInput(value: number, rules: ValidationRule): ValidationResult {
    // Проверка обязательности поля
    if (rules.required && (value === null || value === undefined)) {
      return {
        isValid: false,
        errorMessage: `Поле "${rules.field}" обязательно для заполнения`,
        code: 'REQUIRED_FIELD'
      };
    }

    // Проверка типа данных
    if (rules.type === 'number' && (typeof value !== 'number' || isNaN(value))) {
      return {
        isValid: false,
        errorMessage: `Поле "${rules.field}" должно быть числом`,
        code: 'INVALID_TYPE'
      };
    }

    // Проверка минимального значения
    if (rules.min !== undefined && value < rules.min) {
      return {
        isValid: false,
        errorMessage: `Значение не может быть меньше ${rules.min.toLocaleString('ru-RU')}`,
        code: 'BELOW_MINIMUM'
      };
    }

    // Проверка максимального значения
    if (rules.max !== undefined && value > rules.max) {
      return {
        isValid: false,
        errorMessage: `Значение не может быть больше ${rules.max.toLocaleString('ru-RU')}`,
        code: 'ABOVE_MAXIMUM'
      };
    }

    // Кастомная валидация
    if (rules.customValidator) {
      return rules.customValidator(value);
    }

    return { isValid: true };
  }

  /**
   * Санитизация входных данных для предотвращения инъекций
   * 
   * @param input - Входные данные
   * @returns Очищенные данные
   */
  public sanitizeInput(input: unknown): unknown {
    if (typeof input === 'string') {
      // Удаляем потенциально опасные символы
      return input.replace(/[<>"'&]/g, '').trim();
    }
    
    if (typeof input === 'number') {
      // Проверяем на конечность числа
      return isFinite(input) ? input : 0;
    }

    return input;
  }

  /**
   * Создание ошибки расчета с контекстом
   * 
   * @param type - Тип ошибки
   * @param message - Сообщение об ошибке
   * @param context - Контекст ошибки
   * @returns Объект ошибки расчета
   */
  public createCalculationError(
    type: CalculationError['type'], 
    message: string, 
    context?: unknown
  ): CalculationError {
    const error = new Error(message) as CalculationError;
    error.type = type;
    error.context = context;
    error.recoverable = type !== 'configuration_error';
    return error;
  }
}