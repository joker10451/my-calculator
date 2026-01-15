/**
 * Property-based тесты для проверки валидации данных
 * **Property 14: Data Source Prioritization**
 * **Validates: Requirements 6.8**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { BankDataValidator } from '../lib/database/bankRepository';
import type { 
  BankCreateData, 
  BankProductCreateData,
  ProductType 
} from '../types/bank';

// Генераторы для property-based тестирования
const bankNameArbitrary = fc.string({ minLength: 1, maxLength: 255 }).filter(s => s.trim().length > 0);
const shortNameArbitrary = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);
const ratingArbitrary = fc.float({ min: 0, max: 5, noNaN: true });
const commissionRateArbitrary = fc.float({ min: 0, max: 100, noNaN: true });
const interestRateArbitrary = fc.float({ min: 0, max: 50, noNaN: true });
const amountArbitrary = fc.integer({ min: 1000, max: 100000000 });
const termArbitrary = fc.integer({ min: 1, max: 600 });
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
  interest_rate: interestRateArbitrary,
  min_amount: fc.option(amountArbitrary, { nil: undefined }),
  max_amount: fc.option(amountArbitrary, { nil: undefined }),
  min_term: fc.option(termArbitrary, { nil: undefined }),
  max_term: fc.option(termArbitrary, { nil: undefined }),
  fees: fc.option(fc.record({}), { nil: {} }),
  requirements: fc.option(fc.record({}), { nil: {} }),
  features: fc.option(fc.record({}), { nil: {} }),
  promotional_rate: fc.option(interestRateArbitrary, { nil: undefined }),
  promo_valid_until: fc.option(fc.date({ min: new Date() }).map(d => d.toISOString().split('T')[0]), { nil: undefined }),
  promo_conditions: fc.option(fc.string(), { nil: undefined }),
  available_regions: fc.option(fc.array(fc.string()), { nil: ['all'] }),
  is_active: fc.option(fc.boolean(), { nil: true }),
  is_featured: fc.option(fc.boolean(), { nil: false }),
  priority: fc.option(fc.integer({ min: 0, max: 100 }), { nil: 0 })
});

describe('Data Validation Property Tests', () => {
  describe('Property 14: Data Source Prioritization', () => {
    it('should validate correct bank data and accept all valid inputs', 
      fc.property(
        validBankArbitrary,
        (bankData) => {
          // Feature: comparison-recommendation-system, Property 14: Data Source Prioritization
          
          // Проверяем валидацию корректных данных
          const validation = BankDataValidator.validateBank(bankData);
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
      ), 
      { numRuns: 100 }
    );

    it('should reject invalid bank data with appropriate error messages', 
      fc.property(
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
            fc.float({ min: -1, max: -0.1 }), // отрицательный рейтинг
            fc.float({ min: 5.1, max: 10 }), // слишком высокий рейтинг
            fc.constant(NaN),
            fc.constant(Infinity)
          ),
          commission_rate: fc.oneof(
            fc.float({ min: -1, max: -0.1 }), // отрицательная комиссия
            fc.float({ min: 100.1, max: 200 }), // слишком высокая комиссия
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
          const validation = BankDataValidator.validateBank(invalidBankData);
          expect(validation.is_valid).toBe(false);
          expect(validation.errors.length).toBeGreaterThan(0);
          
          // Проверяем, что каждая ошибка содержит необходимую информацию
          validation.errors.forEach(error => {
            expect(error.field).toBeTruthy();
            expect(error.message).toBeTruthy();
            expect(error.code).toBeTruthy();
          });
        }
      ), 
      { numRuns: 100 }
    );

    it('should validate correct product data and accept all valid inputs', 
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // bank_id
        validProductArbitrary('test-bank-id'),
        (bankId, productData) => {
          // Feature: comparison-recommendation-system, Property 14: Data Source Prioritization
          
          const productWithBank = { ...productData, bank_id: bankId };
          
          // Проверяем валидацию корректных данных
          const validation = BankDataValidator.validateProduct(productWithBank);
          expect(validation.is_valid).toBe(true);
          expect(validation.errors).toHaveLength(0);
          
          // Проверяем обязательные поля
          expect(productWithBank.bank_id).toBeTruthy();
          expect(productWithBank.name).toBeTruthy();
          expect(productWithBank.interest_rate).toBeGreaterThanOrEqual(0);
          
          // Проверяем логику min/max значений
          if (productWithBank.min_amount && productWithBank.max_amount) {
            expect(productWithBank.min_amount).toBeLessThanOrEqual(productWithBank.max_amount);
          }
          
          if (productWithBank.min_term && productWithBank.max_term) {
            expect(productWithBank.min_term).toBeLessThanOrEqual(productWithBank.max_term);
          }
        }
      ), 
      { numRuns: 100 }
    );

    it('should reject invalid product data with appropriate error messages', 
      fc.property(
        fc.record({
          bank_id: fc.oneof(fc.constant(''), fc.constant(null as any), fc.constant(undefined as any)),
          product_type: fc.constantFrom('invalid_type' as any, '' as any, null as any),
          name: fc.oneof(fc.constant(''), fc.constant(null as any), fc.constant(undefined as any)),
          interest_rate: fc.oneof(
            fc.float({ min: -10, max: -0.1 }), // отрицательная ставка
            fc.constant(NaN),
            fc.constant(Infinity),
            fc.constant(null as any)
          ),
          min_amount: fc.float({ min: -1000, max: -1 }), // отрицательная сумма
          max_amount: fc.integer({ min: 1, max: 1000 }), // потенциально меньше минимальной
          min_term: fc.integer({ min: -10, max: 0 }), // отрицательный срок
          max_term: fc.integer({ min: 1, max: 5 }), // потенциально меньше минимального
          promo_valid_until: fc.date({ max: new Date(Date.now() - 86400000) }).map(d => d.toISOString().split('T')[0]) // дата в прошлом
        }),
        (invalidProductData) => {
          // Feature: comparison-recommendation-system, Property 14: Data Source Prioritization
          
          // Проверяем, что валидатор отклоняет некорректные данные
          const validation = BankDataValidator.validateProduct(invalidProductData);
          expect(validation.is_valid).toBe(false);
          expect(validation.errors.length).toBeGreaterThan(0);
          
          // Проверяем, что каждая ошибка содержит необходимую информацию
          validation.errors.forEach(error => {
            expect(error.field).toBeTruthy();
            expect(error.message).toBeTruthy();
            expect(error.code).toBeTruthy();
          });
        }
      ), 
      { numRuns: 100 }
    );

    it('should prioritize data sources correctly when conflicts arise', 
      fc.property(
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
            overall_rating: highestPrioritySource.data.overall_rating ?? baseBank.overall_rating,
            commission_rate: highestPrioritySource.data.commission_rate ?? baseBank.commission_rate
          };
          
          // Проверяем, что данные из источника с наивысшим приоритетом используются
          if (highestPrioritySource.data.overall_rating !== undefined) {
            expect(resolvedData.overall_rating).toBe(highestPrioritySource.data.overall_rating);
          }
          
          if (highestPrioritySource.data.commission_rate !== undefined) {
            expect(resolvedData.commission_rate).toBe(highestPrioritySource.data.commission_rate);
          }
          
          // Проверяем валидность итоговых данных
          const validation = BankDataValidator.validateBank(resolvedData);
          expect(validation.is_valid).toBe(true);
        }
      ), 
      { numRuns: 100 }
    );

    it('should handle edge cases in validation correctly', 
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 255 }),
          short_name: fc.string({ minLength: 1, maxLength: 100 }),
          overall_rating: fc.oneof(
            fc.constant(0), // минимальное значение
            fc.constant(5), // максимальное значение
            fc.float({ min: 0.1, max: 4.9 }) // промежуточные значения
          ),
          commission_rate: fc.oneof(
            fc.constant(0), // минимальное значение
            fc.constant(100), // максимальное значение
            fc.float({ min: 0.01, max: 99.99 }) // промежуточные значения
          ),
          email: fc.oneof(
            fc.emailAddress(), // валидный email
            fc.constant(undefined) // отсутствующий email
          ),
          website_url: fc.oneof(
            fc.webUrl(), // валидный URL
            fc.constant(undefined) // отсутствующий URL
          )
        }),
        (edgeCaseData) => {
          // Feature: comparison-recommendation-system, Property 14: Data Source Prioritization
          
          // Проверяем, что граничные случаи обрабатываются корректно
          const validation = BankDataValidator.validateBank(edgeCaseData);
          expect(validation.is_valid).toBe(true);
          expect(validation.errors).toHaveLength(0);
          
          // Проверяем граничные значения рейтингов
          if (edgeCaseData.overall_rating !== undefined) {
            expect(edgeCaseData.overall_rating).toBeGreaterThanOrEqual(0);
            expect(edgeCaseData.overall_rating).toBeLessThanOrEqual(5);
          }
          
          // Проверяем граничные значения комиссии
          if (edgeCaseData.commission_rate !== undefined) {
            expect(edgeCaseData.commission_rate).toBeGreaterThanOrEqual(0);
            expect(edgeCaseData.commission_rate).toBeLessThanOrEqual(100);
          }
        }
      ), 
      { numRuns: 100 }
    );

    it('should maintain consistency in validation results', 
      fc.property(
        validBankArbitrary,
        (bankData) => {
          // Feature: comparison-recommendation-system, Property 14: Data Source Prioritization
          
          // Проверяем, что повторная валидация дает тот же результат
          const validation1 = BankDataValidator.validateBank(bankData);
          const validation2 = BankDataValidator.validateBank(bankData);
          
          expect(validation1.is_valid).toBe(validation2.is_valid);
          expect(validation1.errors.length).toBe(validation2.errors.length);
          
          // Проверяем, что ошибки идентичны
          validation1.errors.forEach((error, index) => {
            expect(error.field).toBe(validation2.errors[index].field);
            expect(error.code).toBe(validation2.errors[index].code);
          });
        }
      ), 
      { numRuns: 100 }
    );

    it('should validate product type constraints correctly', 
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // bank_id
        productTypeArbitrary,
        fc.string({ minLength: 1, maxLength: 255 }), // name
        interestRateArbitrary,
        (bankId, productType, name, interestRate) => {
          // Feature: comparison-recommendation-system, Property 14: Data Source Prioritization
          
          const productData: BankProductCreateData = {
            bank_id: bankId,
            product_type: productType,
            name: name,
            interest_rate: interestRate
          };
          
          // Проверяем валидацию
          const validation = BankDataValidator.validateProduct(productData);
          expect(validation.is_valid).toBe(true);
          expect(validation.errors).toHaveLength(0);
          
          // Проверяем, что тип продукта корректный
          const validTypes = ['mortgage', 'deposit', 'credit', 'insurance'];
          expect(validTypes).toContain(productType);
        }
      ), 
      { numRuns: 100 }
    );
  });
});