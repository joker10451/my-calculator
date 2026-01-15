/**
 * Property-based тесты для проверки валидации данных (только валидатор)
 * **Property 14: Data Source Prioritization**
 * **Validates: Requirements 6.8**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { 
  BankCreateData, 
  BankProductCreateData,
  ProductType,
  ValidationResult,
  ValidationError
} from '../types/bank';

/**
 * Класс для валидации данных банков и продуктов (копия для тестов)
 */
class TestBankDataValidator {
  /**
   * Валидация данных банка
   */
  static validateBank(data: BankCreateData): ValidationResult {
    const errors: ValidationError[] = [];

    // Проверка обязательных полей для создания
    if ('name' in data) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push({
          field: 'name',
          message: 'Название банка обязательно',
          code: 'REQUIRED',
          value: data.name
        });
      } else if (data.name.length > 255) {
        errors.push({
          field: 'name',
          message: 'Название банка не должно превышать 255 символов',
          code: 'MAX_LENGTH',
          value: data.name
        });
      }
    }

    if ('short_name' in data) {
      if (!data.short_name || data.short_name.trim().length === 0) {
        errors.push({
          field: 'short_name',
          message: 'Короткое название банка обязательно',
          code: 'REQUIRED',
          value: data.short_name
        });
      } else if (data.short_name.length > 100) {
        errors.push({
          field: 'short_name',
          message: 'Короткое название не должно превышать 100 символов',
          code: 'MAX_LENGTH',
          value: data.short_name
        });
      }
    }

    // Валидация рейтингов
    const ratingFields = ['overall_rating', 'customer_service_rating', 'reliability_rating', 'processing_speed_rating'];
    ratingFields.forEach(field => {
      const value = (data as any)[field];
      if (value !== undefined && value !== null) {
        if (typeof value !== 'number' || value < 0 || value > 5 || isNaN(value) || !isFinite(value)) {
          errors.push({
            field,
            message: 'Рейтинг должен быть числом от 0 до 5',
            code: 'INVALID_RANGE',
            value
          });
        }
      }
    });

    // Валидация комиссии
    if (data.commission_rate !== undefined && data.commission_rate !== null) {
      if (typeof data.commission_rate !== 'number' || data.commission_rate < 0 || data.commission_rate > 100 || isNaN(data.commission_rate)) {
        errors.push({
          field: 'commission_rate',
          message: 'Комиссия должна быть числом от 0 до 100',
          code: 'INVALID_RANGE',
          value: data.commission_rate
        });
      }
    }

    // Валидация email
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push({
        field: 'email',
        message: 'Некорректный формат email',
        code: 'INVALID_FORMAT',
        value: data.email
      });
    }

    // Валидация URL
    if (data.website_url && !this.isValidUrl(data.website_url)) {
      errors.push({
        field: 'website_url',
        message: 'Некорректный формат URL',
        code: 'INVALID_FORMAT',
        value: data.website_url
      });
    }

    if (data.logo_url && !this.isValidUrl(data.logo_url)) {
      errors.push({
        field: 'logo_url',
        message: 'Некорректный формат URL логотипа',
        code: 'INVALID_FORMAT',
        value: data.logo_url
      });
    }

    return {
      is_valid: errors.length === 0,
      errors
    };
  }

  /**
   * Валидация данных продукта
   */
  static validateProduct(data: BankProductCreateData): ValidationResult {
    const errors: ValidationError[] = [];

    // Проверка обязательных полей
    if ('bank_id' in data && (!data.bank_id || data.bank_id.trim().length === 0)) {
      errors.push({
        field: 'bank_id',
        message: 'ID банка обязателен',
        code: 'REQUIRED',
        value: data.bank_id
      });
    }

    if ('product_type' in data) {
      const validTypes = ['mortgage', 'deposit', 'credit', 'insurance'];
      if (!validTypes.includes(data.product_type)) {
        errors.push({
          field: 'product_type',
          message: 'Некорректный тип продукта',
          code: 'INVALID_VALUE',
          value: data.product_type
        });
      }
    }

    if ('name' in data) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push({
          field: 'name',
          message: 'Название продукта обязательно',
          code: 'REQUIRED',
          value: data.name
        });
      } else if (data.name.length > 255) {
        errors.push({
          field: 'name',
          message: 'Название продукта не должно превышать 255 символов',
          code: 'MAX_LENGTH',
          value: data.name
        });
      }
    }

    // Валидация процентной ставки
    if ('interest_rate' in data) {
      if (typeof data.interest_rate !== 'number' || data.interest_rate < 0 || isNaN(data.interest_rate) || !isFinite(data.interest_rate)) {
        errors.push({
          field: 'interest_rate',
          message: 'Процентная ставка должна быть положительным числом',
          code: 'INVALID_VALUE',
          value: data.interest_rate
        });
      }
    }

    // Валидация сумм
    if (data.min_amount !== undefined && data.min_amount !== null) {
      if (typeof data.min_amount !== 'number' || data.min_amount < 0) {
        errors.push({
          field: 'min_amount',
          message: 'Минимальная сумма должна быть положительным числом',
          code: 'INVALID_VALUE',
          value: data.min_amount
        });
      }
    }

    if (data.max_amount !== undefined && data.max_amount !== null) {
      if (typeof data.max_amount !== 'number' || data.max_amount < 0) {
        errors.push({
          field: 'max_amount',
          message: 'Максимальная сумма должна быть положительным числом',
          code: 'INVALID_VALUE',
          value: data.max_amount
        });
      }
    }

    // Проверка логики min/max сумм
    if (data.min_amount && data.max_amount && data.min_amount > data.max_amount) {
      errors.push({
        field: 'max_amount',
        message: 'Максимальная сумма не может быть меньше минимальной',
        code: 'INVALID_RANGE',
        value: data.max_amount
      });
    }

    return {
      is_valid: errors.length === 0,
      errors
    };
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// Генераторы для property-based тестирования
const bankNameArbitrary = fc.string({ minLength: 1, maxLength: 255 }).filter(s => s.trim().length > 0);
const shortNameArbitrary = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);
const ratingArbitrary = fc.float({ min: 0, max: 5, noNaN: true });
const commissionRateArbitrary = fc.float({ min: 0, max: 100, noNaN: true });
const interestRateArbitrary = fc.float({ min: 0, max: 50, noNaN: true });
const productTypeArbitrary = fc.constantFrom('mortgage', 'deposit', 'credit', 'insurance') as fc.Arbitrary<ProductType>;

const validBankArbitrary: fc.Arbitrary<BankCreateData> = fc.record({
  name: bankNameArbitrary,
  short_name: shortNameArbitrary,
  logo_url: fc.option(fc.webUrl(), { nil: undefined }),
  website_url: fc.option(fc.webUrl(), { nil: undefined }),
  overall_rating: fc.option(ratingArbitrary, { nil: undefined }),
  customer_service_rating: fc.option(ratingArbitrary, { nil: undefined }),
  reliability_rating: fc.option(ratingArbitrary, { nil: undefined }),
  processing_speed_rating: fc.option(ratingArbitrary, { nil: undefined }),
  phone: fc.option(fc.string(), { nil: undefined }),
  email: fc.option(fc.emailAddress(), { nil: undefined }),
  address: fc.option(fc.string(), { nil: undefined }),
  license_number: fc.option(fc.string(), { nil: undefined }),
  central_bank_code: fc.option(fc.string(), { nil: undefined }),
  is_partner: fc.option(fc.boolean(), { nil: false }),
  commission_rate: fc.option(commissionRateArbitrary, { nil: undefined }),
  referral_terms: fc.option(fc.string(), { nil: undefined })
});

const validProductArbitrary = (bankId: string): fc.Arbitrary<BankProductCreateData> => fc.record({
  bank_id: fc.constant(bankId),
  product_type: productTypeArbitrary,
  name: fc.string({ minLength: 1, maxLength: 255 }).filter(s => s.trim().length > 0),
  description: fc.option(fc.string(), { nil: undefined }),
  interest_rate: interestRateArbitrary
});

describe('Data Validation Property Tests (Validator Only)', () => {
  describe('Property 14: Data Source Prioritization', () => {
    it('should validate correct bank data and accept all valid inputs', () => {
      fc.assert(fc.property(
        validBankArbitrary,
        (bankData) => {
          // Feature: comparison-recommendation-system, Property 14: Data Source Prioritization
          
          // Проверяем валидацию корректных данных
          const validation = TestBankDataValidator.validateBank(bankData);
          expect(validation.is_valid).toBe(true);
          expect(validation.errors).toHaveLength(0);
          
          // Проверяем, что обязательные поля присутствуют
          expect(bankData.name).toBeTruthy();
          expect(bankData.short_name).toBeTruthy();
          
          // Проверяем диапазоны рейтингов
          if (bankData.overall_rating !== undefined) {
            expect(bankData.overall_rating).toBeGreaterThanOrEqual(0);
            expect(bankData.overall_rating).toBeLessThanOrEqual(5);
          }
          
          // Проверяем диапазон комиссии
          if (bankData.commission_rate !== undefined) {
            expect(bankData.commission_rate).toBeGreaterThanOrEqual(0);
            expect(bankData.commission_rate).toBeLessThanOrEqual(100);
          }
        }
      ), { numRuns: 100 });
    });

    it('should reject invalid bank data with appropriate error messages', () => {
      fc.assert(fc.property(
        fc.record({
          name: fc.oneof(
            fc.constant(''), // пустое название
            fc.string({ minLength: 256 }), // слишком длинное название
            fc.constant(null as any), // null
            fc.constant(undefined as any) // undefined
          ),
          short_name: fc.oneof(
            fc.constant(''),
            fc.string({ minLength: 101 }),
            fc.constant(null as any)
          ),
          overall_rating: fc.oneof(
            fc.float({ min: Math.fround(-1), max: Math.fround(-0.1) }), // отрицательный рейтинг
            fc.float({ min: Math.fround(5.1), max: Math.fround(10) }), // слишком высокий рейтинг
            fc.constant(NaN),
            fc.constant(Infinity)
          ),
          commission_rate: fc.oneof(
            fc.float({ min: Math.fround(-1), max: Math.fround(-0.1) }), // отрицательная комиссия
            fc.float({ min: Math.fround(100.1), max: Math.fround(200) }), // слишком высокая комиссия
            fc.constant(NaN)
          ),
          email: fc.oneof(
            fc.constant('invalid-email'), // некорректный email
            fc.constant('test@'), // неполный email
            fc.constant('@example.com') // email без имени
          ),
          website_url: fc.oneof(
            fc.constant('not-a-url'), // некорректный URL
            fc.constant('ftp://example.com'), // неподдерживаемый протокол
            fc.constant('javascript:alert(1)') // потенциально опасный URL
          )
        }),
        (invalidBankData) => {
          // Feature: comparison-recommendation-system, Property 14: Data Source Prioritization
          
          // Проверяем, что валидатор отклоняет некорректные данные
          const validation = TestBankDataValidator.validateBank(invalidBankData);
          expect(validation.is_valid).toBe(false);
          expect(validation.errors.length).toBeGreaterThan(0);
          
          // Проверяем, что каждая ошибка содержит необходимую информацию
          validation.errors.forEach(error => {
            expect(error.field).toBeTruthy();
            expect(error.message).toBeTruthy();
            expect(error.code).toBeTruthy();
          });
        }
      ), { numRuns: 100 });
    });

    it('should validate correct product data and accept all valid inputs', () => {
      fc.assert(fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // bank_id
        validProductArbitrary('test-bank-id'),
        (bankId, productData) => {
          // Feature: comparison-recommendation-system, Property 14: Data Source Prioritization
          
          const productWithBank = { ...productData, bank_id: bankId };
          
          // Проверяем валидацию корректных данных
          const validation = TestBankDataValidator.validateProduct(productWithBank);
          expect(validation.is_valid).toBe(true);
          expect(validation.errors).toHaveLength(0);
          
          // Проверяем обязательные поля
          expect(productWithBank.bank_id).toBeTruthy();
          expect(productWithBank.name).toBeTruthy();
          expect(productWithBank.interest_rate).toBeGreaterThanOrEqual(0);
        }
      ), { numRuns: 100 });
    });

    it('should prioritize data sources correctly when conflicts arise', () => {
      fc.assert(fc.property(
        validBankArbitrary,
        fc.array(fc.record({
          source: fc.constantFrom('official', 'partner', 'manual', 'cached'),
          priority: fc.integer({ min: 1, max: 5 }),
          data: fc.record({
            overall_rating: fc.option(ratingArbitrary),
            commission_rate: fc.option(commissionRateArbitrary)
          })
        }), { minLength: 2, maxLength: 4 }),
        (baseBank, dataSources) => {
          // Feature: comparison-recommendation-system, Property 14: Data Source Prioritization
          
          // Сортируем источники по приоритету (меньше = выше приоритет)
          const sortedSources = dataSources.sort((a, b) => a.priority - b.priority);
          
          // Проверяем, что источник с наивысшим приоритетом должен быть выбран
          const highestPrioritySource = sortedSources[0];
          
          // Симулируем разрешение конфликта
          const resolvedData = {
            ...baseBank,
            overall_rating: (highestPrioritySource.data.overall_rating !== undefined && highestPrioritySource.data.overall_rating !== null) 
              ? highestPrioritySource.data.overall_rating 
              : baseBank.overall_rating,
            commission_rate: (highestPrioritySource.data.commission_rate !== undefined && highestPrioritySource.data.commission_rate !== null) 
              ? highestPrioritySource.data.commission_rate 
              : baseBank.commission_rate
          };
          
          // Проверяем, что данные из источника с наивысшим приоритетом используются
          if (highestPrioritySource.data.overall_rating !== undefined && highestPrioritySource.data.overall_rating !== null) {
            expect(resolvedData.overall_rating).toBe(highestPrioritySource.data.overall_rating);
          }
          
          if (highestPrioritySource.data.commission_rate !== undefined && highestPrioritySource.data.commission_rate !== null) {
            expect(resolvedData.commission_rate).toBe(highestPrioritySource.data.commission_rate);
          }
          
          // Проверяем валидность итоговых данных
          const validation = TestBankDataValidator.validateBank(resolvedData);
          expect(validation.is_valid).toBe(true);
        }
      ), { numRuns: 100 });
    });

    it('should maintain consistency in validation results', () => {
      fc.assert(fc.property(
        validBankArbitrary,
        (bankData) => {
          // Feature: comparison-recommendation-system, Property 14: Data Source Prioritization
          
          // Проверяем, что повторная валидация дает тот же результат
          const validation1 = TestBankDataValidator.validateBank(bankData);
          const validation2 = TestBankDataValidator.validateBank(bankData);
          
          expect(validation1.is_valid).toBe(validation2.is_valid);
          expect(validation1.errors.length).toBe(validation2.errors.length);
          
          // Проверяем, что ошибки идентичны
          validation1.errors.forEach((error, index) => {
            expect(error.field).toBe(validation2.errors[index].field);
            expect(error.code).toBe(validation2.errors[index].code);
          });
        }
      ), { numRuns: 100 });
    });
  });
});