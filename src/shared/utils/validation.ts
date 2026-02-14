import type { ValidationRule, ValidationResult, ValidationError } from '../types/calculator';

/**
 * Универсальная система валидации для калькуляторов
 */
export class ValidationEngine<T = Record<string, unknown>> {
  private rules: ValidationRule<T>[] = [];

  constructor(rules: ValidationRule<T>[] = []) {
    this.rules = rules;
  }

  /**
   * Добавить правило валидации
   */
  addRule(rule: ValidationRule<T>): this {
    this.rules.push(rule);
    return this;
  }

  /**
   * Валидировать объект
   */
  validate(data: T): ValidationResult {
    const errors: ValidationError[] = [];

    for (const rule of this.rules) {
      const value = data[rule.field];
      const result = rule.validator(value);

      if (result !== true) {
        errors.push({
          field: String(rule.field),
          message: typeof result === 'string' ? result : rule.message || 'Неверное значение',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Валидировать одно поле
   */
  validateField(field: keyof T, value: unknown): ValidationError | null {
    const rule = this.rules.find(r => r.field === field);
    if (!rule) return null;

    const result = rule.validator(value);
    if (result === true) return null;

    return {
      field: String(field),
      message: typeof result === 'string' ? result : rule.message || 'Неверное значение',
    };
  }
}

/**
 * Предустановленные валидаторы
 */
export const validators = {
  /**
   * Проверка на обязательное поле
   */
  required: (message = 'Поле обязательно для заполнения') => 
    (value: unknown): boolean | string => {
      if (value === null || value === undefined || value === '') {
        return message;
      }
      return true;
    },

  /**
   * Проверка минимального значения
   */
  min: (minValue: number, message?: string) => 
    (value: unknown): boolean | string => {
      const num = Number(value);
      if (isNaN(num) || num < minValue) {
        return message || `Значение должно быть не менее ${minValue}`;
      }
      return true;
    },

  /**
   * Проверка максимального значения
   */
  max: (maxValue: number, message?: string) => 
    (value: unknown): boolean | string => {
      const num = Number(value);
      if (isNaN(num) || num > maxValue) {
        return message || `Значение должно быть не более ${maxValue}`;
      }
      return true;
    },

  /**
   * Проверка диапазона
   */
  range: (minValue: number, maxValue: number, message?: string) => 
    (value: unknown): boolean | string => {
      const num = Number(value);
      if (isNaN(num) || num < minValue || num > maxValue) {
        return message || `Значение должно быть от ${minValue} до ${maxValue}`;
      }
      return true;
    },

  /**
   * Проверка на число
   */
  number: (message = 'Значение должно быть числом') => 
    (value: unknown): boolean | string => {
      const num = Number(value);
      if (isNaN(num)) {
        return message;
      }
      return true;
    },

  /**
   * Проверка на положительное число
   */
  positive: (message = 'Значение должно быть положительным') => 
    (value: unknown): boolean | string => {
      const num = Number(value);
      if (isNaN(num) || num <= 0) {
        return message;
      }
      return true;
    },

  /**
   * Проверка на целое число
   */
  integer: (message = 'Значение должно быть целым числом') => 
    (value: unknown): boolean | string => {
      const num = Number(value);
      if (isNaN(num) || !Number.isInteger(num)) {
        return message;
      }
      return true;
    },

  /**
   * Проверка процента (0-100)
   */
  percent: (message = 'Значение должно быть от 0 до 100') => 
    (value: unknown): boolean | string => {
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > 100) {
        return message;
      }
      return true;
    },

  /**
   * Проверка email
   */
  email: (message = 'Неверный формат email') => 
    (value: unknown): boolean | string => {
      const email = String(value);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return message;
      }
      return true;
    },

  /**
   * Проверка телефона (российский формат)
   */
  phone: (message = 'Неверный формат телефона') => 
    (value: unknown): boolean | string => {
      const phone = String(value).replace(/\D/g, '');
      if (phone.length !== 11 || !phone.startsWith('7')) {
        return message;
      }
      return true;
    },

  /**
   * Кастомный валидатор
   */
  custom: (validator: (value: unknown) => boolean, message: string) => 
    (value: unknown): boolean | string => {
      return validator(value) ? true : message;
    },
};

/**
 * Создать валидатор для конкретного калькулятора
 */
export function createCalculatorValidator<T>(rules: ValidationRule<T>[]): ValidationEngine<T> {
  return new ValidationEngine(rules);
}

/**
 * Быстрая валидация значения
 */
export function validateValue(
  value: unknown,
  rules: Array<(value: unknown) => boolean | string>
): ValidationError | null {
  for (const rule of rules) {
    const result = rule(value);
    if (result !== true) {
      return {
        field: 'value',
        message: typeof result === 'string' ? result : 'Неверное значение',
      };
    }
  }
  return null;
}

/**
 * Проверка на безопасность значения (защита от XSS)
 */
export function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  return value;
}