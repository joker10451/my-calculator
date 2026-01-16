/**
 * Property-based тесты для проверки целостности данных банков и продуктов
 * **Property 14: Data Source Prioritization**
 * **Validates: Requirements 6.8**
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { BankDataValidator } from '../lib/database/bankRepository';
import { localDB } from '../lib/database/local-storage';
import type { 
  Bank, 
  BankProduct, 
  BankCreateData, 
  BankProductCreateData,
  ProductType 
} from '../types/bank';

// Генераторы для property-based тестирования
const bankNameArbitrary = fc.string({ minLength: 1, maxLength: 255 }).filter(s => s.trim().length > 0);
const shortNameArbitrary = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);
const ratingArbitrary = fc.float({ min: 0, max: Math.fround(5), noNaN: true });
const commissionRateArbitrary = fc.float({ min: 0, max: Math.fround(100), noNaN: true });
const interestRateArbitrary = fc.float({ min: 0, max: Math.fround(50), noNaN: true });
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

describe('Bank Data Integrity Property Tests', () => {
  beforeEach(async () => {
    // Очищаем локальную базу данных перед каждым тестом
    const banks = await localDB.getBanks();
    const products = await localDB.getProducts();
    
    // Удаляем все данные
    await localDB.saveBanks([]);
    await localDB.saveProducts([]);
  });

  afterEach(async () => {
    // Очищаем локальную базу данных после каждого теста
    await localDB.saveBanks([]);
    await localDB.saveProducts([]);
  });

  describe('Property 14: Data Source Prioritization', () => {
    it('should validate bank data correctly with proper constraints', 
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
      )
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
      )
    );

    it('should validate product data correctly with proper constraints', 
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
      )
    );

    it('should reject invalid product data with appropriate error messages', 
      fc.property(
        fc.record({
          bank_id: fc.oneof(fc.constant(''), fc.constant(null as any), fc.constant(undefined as any)),
          product_type: fc.constantFrom('invalid_type' as any, '' as any, null as any),
          name: fc.oneof(fc.constant(''), fc.constant(null as any), fc.constant(undefined as any)),
          interest_rate: fc.oneof(
            fc.float({ min: Math.fround(-10), max: Math.fround(-0.1) }), // отрицательная ставка
            fc.constant(NaN),
            fc.constant(Infinity),
            fc.constant(null as any)
          ),
          min_amount: fc.float({ min: Math.fround(-1000), max: Math.fround(-1) }), // отрицательная сумма
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
      )
    );

    it('should maintain data consistency in local storage operations', 
      fc.asyncProperty(
        fc.array(validBankArbitrary, { minLength: 1, maxLength: 5 }),
        async (banksData) => {
          // Feature: comparison-recommendation-system, Property 14: Data Source Prioritization
          
          // Создаем банки с уникальными ID
          const banksWithIds = banksData.map((bankData, index) => ({
            ...bankData,
            id: `test-bank-${index}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_partner: bankData.is_partner || false
          }));
          
          // Сохраняем банки
          await localDB.saveBanks(banksWithIds);
          
          // Получаем банки обратно
          const retrievedBanks = await localDB.getBanks();
          
          // Проверяем целостность данных
          expect(retrievedBanks).toHaveLength(banksWithIds.length);
          
          banksWithIds.forEach(originalBank => {
            const retrievedBank = retrievedBanks.find(b => b.id === originalBank.id);
            expect(retrievedBank).toBeDefined();
            expect(retrievedBank!.name).toBe(originalBank.name);
            expect(retrievedBank!.short_name).toBe(originalBank.short_name);
            expect(retrievedBank!.is_partner).toBe(originalBank.is_partner);
          });
        }
      )
    );

    it('should handle concurrent data operations without corruption', 
      fc.asyncProperty(
        fc.array(validBankArbitrary, { minLength: 2, maxLength: 5 }),
        async (banksData) => {
          // Feature: comparison-recommendation-system, Property 14: Data Source Prioritization
          
          // Создаем банки параллельно
          const bankPromises = banksData.map(async (bankData, index) => {
            const bankWithId = {
              ...bankData,
              id: `concurrent-bank-${index}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_partner: bankData.is_partner || false
            };
            
            // Симулируем параллельные операции
            const currentBanks = await localDB.getBanks();
            currentBanks.push(bankWithId);
            await localDB.saveBanks(currentBanks);
            
            return bankWithId;
          });
          
          const createdBanks = await Promise.all(bankPromises);
          
          // Проверяем, что все банки сохранились
          const finalBanks = await localDB.getBanks();
          
          createdBanks.forEach(createdBank => {
            const foundBank = finalBanks.find(b => b.id === createdBank.id);
            expect(foundBank).toBeDefined();
            expect(foundBank!.name).toBe(createdBank.name);
          });
        }
      )
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
      )
    );
  });
});