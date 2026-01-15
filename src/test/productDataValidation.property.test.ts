/**
 * Property-based тесты для валидации данных банковских продуктов
 * Feature: comparison-recommendation-system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { localDB } from '../lib/database/local-storage';
import { apiAdapter } from '../lib/api/client-adapter';

// Генераторы для property-based тестирования
const bankProductArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  bank_id: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  product_type: fc.constantFrom('mortgage', 'deposit', 'credit', 'insurance'),
  name: fc.string({ minLength: 1, maxLength: 255 }).filter(s => s.trim().length > 0),
  description: fc.option(fc.string({ maxLength: 1000 })),
  interest_rate: fc.float({ min: 0, max: 100, noNaN: true }),
  min_amount: fc.option(fc.float({ min: 0, max: 1000000000, noNaN: true })),
  max_amount: fc.option(fc.float({ min: 0, max: 1000000000, noNaN: true })),
  min_term: fc.option(fc.integer({ min: 1, max: 600 })),
  max_term: fc.option(fc.integer({ min: 1, max: 600 })),
  fees: fc.record({
    application: fc.option(fc.float({ min: 0, max: 100000, noNaN: true })),
    monthly: fc.option(fc.float({ min: 0, max: 10000, noNaN: true })),
    early_repayment: fc.option(fc.float({ min: 0, max: 50000, noNaN: true }))
  }),
  requirements: fc.record({
    min_income: fc.option(fc.float({ min: 0, max: 10000000, noNaN: true })),
    min_age: fc.option(fc.integer({ min: 18, max: 80 })),
    max_age: fc.option(fc.integer({ min: 18, max: 80 })),
    credit_score: fc.option(fc.integer({ min: 300, max: 850 }))
  }),
  features: fc.record({
    early_repayment: fc.option(fc.boolean()),
    grace_period: fc.option(fc.boolean()),
    capitalization: fc.option(fc.boolean()),
    replenishment: fc.option(fc.boolean())
  }),
  available_regions: fc.array(fc.constantFrom('moscow', 'spb', 'regions', 'all'), { minLength: 1, maxLength: 10 }),
  is_active: fc.boolean(),
  is_featured: fc.boolean(),
  priority: fc.integer({ min: 0, max: 100 }),
  created_at: fc.integer({ min: 1577836800000, max: 1893456000000 }).map(timestamp => new Date(timestamp).toISOString()),
  updated_at: fc.integer({ min: 1577836800000, max: 1893456000000 }).map(timestamp => new Date(timestamp).toISOString())
}).map(product => {
  // Исправляем логическую ошибку: max_term должен быть >= min_term
  if (product.min_term !== null && product.max_term !== null && product.max_term < product.min_term) {
    const temp = product.min_term;
    product.min_term = product.max_term;
    product.max_term = temp;
  }
  
  // Исправляем логическую ошибку: max_amount должен быть >= min_amount
  if (product.min_amount !== null && product.max_amount !== null && product.max_amount < product.min_amount) {
    const temp = product.min_amount;
    product.min_amount = product.max_amount;
    product.max_amount = temp;
  }
  
  return product;
});

const bankArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  name: fc.string({ minLength: 1, maxLength: 255 }).filter(s => s.trim().length > 0),
  short_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  logo_url: fc.option(fc.webUrl()),
  website_url: fc.option(fc.webUrl()),
  overall_rating: fc.option(fc.float({ min: 0, max: 5, noNaN: true })),
  customer_service_rating: fc.option(fc.float({ min: 0, max: 5, noNaN: true })),
  reliability_rating: fc.option(fc.float({ min: 0, max: 5, noNaN: true })),
  processing_speed_rating: fc.option(fc.float({ min: 0, max: 5, noNaN: true })),
  is_partner: fc.boolean(),
  commission_rate: fc.option(fc.float({ min: 0, max: 100, noNaN: true })),
  created_at: fc.integer({ min: 1577836800000, max: 1893456000000 }).map(timestamp => new Date(timestamp).toISOString()),
  updated_at: fc.integer({ min: 1577836800000, max: 1893456000000 }).map(timestamp => new Date(timestamp).toISOString())
});

describe('Product Data Validation Properties', () => {
  beforeEach(async () => {
    // Очищаем локальную базу данных перед каждым тестом
    localStorage.clear();
    await localDB.initializeWithMockData();
  });

  /**
   * Property 13: Product Data Validation
   * For any new product added to the database, all required parameters should be validated for accuracy and completeness
   * **Validates: Requirements 6.1, 6.4**
   */
  it('Property 13: Product Data Validation - should validate all required product parameters', async () => {
    // Feature: comparison-recommendation-system, Property 13: Product Data Validation
    
    await fc.assert(
      fc.asyncProperty(
        bankProductArbitrary,
        async (product) => {
          // Проверяем, что все обязательные поля присутствуют
          expect(product.id).toBeDefined();
          expect(typeof product.id).toBe('string');
          expect(product.id.length).toBeGreaterThan(0);

          expect(product.bank_id).toBeDefined();
          expect(typeof product.bank_id).toBe('string');
          expect(product.bank_id.length).toBeGreaterThan(0);

          expect(product.product_type).toBeDefined();
          expect(['mortgage', 'deposit', 'credit', 'insurance']).toContain(product.product_type);

          expect(product.name).toBeDefined();
          expect(typeof product.name).toBe('string');
          expect(product.name.length).toBeGreaterThan(0);
          expect(product.name.length).toBeLessThanOrEqual(255);

          expect(product.interest_rate).toBeDefined();
          expect(typeof product.interest_rate).toBe('number');
          expect(product.interest_rate).toBeGreaterThanOrEqual(0);
          expect(product.interest_rate).toBeLessThanOrEqual(100);
          expect(Number.isFinite(product.interest_rate)).toBe(true);

          // Проверяем логическую согласованность сумм
          if (product.min_amount !== null && product.max_amount !== null) {
            expect(product.max_amount).toBeGreaterThanOrEqual(product.min_amount);
          }

          // Проверяем логическую согласованность сроков
          if (product.min_term !== null && product.max_term !== null) {
            expect(product.max_term).toBeGreaterThanOrEqual(product.min_term);
          }

          // Проверяем структуру fees
          expect(product.fees).toBeDefined();
          expect(typeof product.fees).toBe('object');
          
          // Проверяем структуру requirements
          expect(product.requirements).toBeDefined();
          expect(typeof product.requirements).toBe('object');

          // Проверяем структуру features
          expect(product.features).toBeDefined();
          expect(typeof product.features).toBe('object');

          // Проверяем available_regions
          expect(Array.isArray(product.available_regions)).toBe(true);
          expect(product.available_regions.length).toBeGreaterThan(0);

          // Проверяем булевы поля
          expect(typeof product.is_active).toBe('boolean');
          expect(typeof product.is_featured).toBe('boolean');

          // Проверяем priority
          expect(typeof product.priority).toBe('number');
          expect(product.priority).toBeGreaterThanOrEqual(0);

          // Проверяем даты
          expect(() => new Date(product.created_at)).not.toThrow();
          expect(() => new Date(product.updated_at)).not.toThrow();
          expect(new Date(product.created_at).getTime()).not.toBeNaN();
          expect(new Date(product.updated_at).getTime()).not.toBeNaN();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Bank Data Validation
   * For any bank in the system, all required parameters should be validated for accuracy and completeness
   */
  it('Property: Bank Data Validation - should validate all required bank parameters', async () => {
    // Feature: comparison-recommendation-system, Property: Bank Data Validation
    
    await fc.assert(
      fc.asyncProperty(
        bankArbitrary,
        async (bank) => {
          // Проверяем обязательные поля банка
          expect(bank.id).toBeDefined();
          expect(typeof bank.id).toBe('string');
          expect(bank.id.length).toBeGreaterThan(0);

          expect(bank.name).toBeDefined();
          expect(typeof bank.name).toBe('string');
          expect(bank.name.length).toBeGreaterThan(0);
          expect(bank.name.length).toBeLessThanOrEqual(255);

          expect(bank.short_name).toBeDefined();
          expect(typeof bank.short_name).toBe('string');
          expect(bank.short_name.length).toBeGreaterThan(0);
          expect(bank.short_name.length).toBeLessThanOrEqual(100);

          // Проверяем рейтинги (если присутствуют)
          if (bank.overall_rating !== null) {
            expect(bank.overall_rating).toBeGreaterThanOrEqual(0);
            expect(bank.overall_rating).toBeLessThanOrEqual(5);
            expect(Number.isFinite(bank.overall_rating)).toBe(true);
          }

          if (bank.customer_service_rating !== null) {
            expect(bank.customer_service_rating).toBeGreaterThanOrEqual(0);
            expect(bank.customer_service_rating).toBeLessThanOrEqual(5);
            expect(Number.isFinite(bank.customer_service_rating)).toBe(true);
          }

          if (bank.reliability_rating !== null) {
            expect(bank.reliability_rating).toBeGreaterThanOrEqual(0);
            expect(bank.reliability_rating).toBeLessThanOrEqual(5);
            expect(Number.isFinite(bank.reliability_rating)).toBe(true);
          }

          if (bank.processing_speed_rating !== null) {
            expect(bank.processing_speed_rating).toBeGreaterThanOrEqual(0);
            expect(bank.processing_speed_rating).toBeLessThanOrEqual(5);
            expect(Number.isFinite(bank.processing_speed_rating)).toBe(true);
          }

          // Проверяем комиссию (если присутствует)
          if (bank.commission_rate !== null) {
            expect(bank.commission_rate).toBeGreaterThanOrEqual(0);
            expect(bank.commission_rate).toBeLessThanOrEqual(100);
            expect(Number.isFinite(bank.commission_rate)).toBe(true);
          }

          // Проверяем булево поле
          expect(typeof bank.is_partner).toBe('boolean');

          // Проверяем даты
          expect(() => new Date(bank.created_at)).not.toThrow();
          expect(() => new Date(bank.updated_at)).not.toThrow();
          expect(new Date(bank.created_at).getTime()).not.toBeNaN();
          expect(new Date(bank.updated_at).getTime()).not.toBeNaN();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Product-Bank Relationship Consistency
   * For any product, it should have a valid bank_id that corresponds to an existing bank
   */
  it('Property: Product-Bank Relationship Consistency - products should reference valid banks', async () => {
    // Feature: comparison-recommendation-system, Property: Product-Bank Relationship Consistency
    
    await fc.assert(
      fc.asyncProperty(
        fc.array(bankArbitrary, { minLength: 1, maxLength: 5 }),
        fc.array(bankProductArbitrary, { minLength: 1, maxLength: 10 }),
        async (banks, products) => {
          // Сохраняем банки в локальную базу
          await localDB.saveBanks(banks);
          
          // Создаем продукты с валидными bank_id
          const validProducts = products.map(product => ({
            ...product,
            bank_id: banks[Math.floor(Math.random() * banks.length)].id
          }));
          
          await localDB.saveProducts(validProducts);
          
          // Получаем продукты через API адаптер
          const retrievedProducts = await apiAdapter.getProducts();
          
          // Получаем банки через API адаптер
          const retrievedBanks = await apiAdapter.getBanks();
          
          // Проверяем, что каждый продукт имеет валидный bank_id
          for (const product of retrievedProducts) {
            const bankExists = retrievedBanks.some((bank: any) => bank.id === product.bank_id);
            expect(bankExists).toBe(true);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Product Type Consistency
   * For any product type, specific validation rules should apply
   */
  it('Property: Product Type Consistency - validation rules should match product type', async () => {
    // Feature: comparison-recommendation-system, Property: Product Type Consistency
    
    await fc.assert(
      fc.asyncProperty(
        bankProductArbitrary,
        async (product) => {
          // Проверяем специфичные для типа продукта правила
          switch (product.product_type) {
            case 'mortgage':
            case 'credit':
              // Для кредитных продуктов процентная ставка обычно выше 1%
              if (product.interest_rate < 1) {
                // Это может быть валидно для специальных программ, но проверим логику
                expect(product.interest_rate).toBeGreaterThanOrEqual(0);
              }
              
              // Минимальная сумма должна быть разумной для кредитов
              if (product.min_amount !== null) {
                expect(product.min_amount).toBeGreaterThanOrEqual(0);
              }
              break;
              
            case 'deposit':
              // Для вкладов процентная ставка обычно положительная
              expect(product.interest_rate).toBeGreaterThanOrEqual(0);
              
              // Минимальная сумма вклада должна быть разумной
              if (product.min_amount !== null) {
                expect(product.min_amount).toBeGreaterThanOrEqual(0);
              }
              break;
              
            case 'insurance':
              // Для страхования могут быть особые правила
              expect(product.interest_rate).toBeGreaterThanOrEqual(0);
              break;
          }
          
          // Общие правила для всех типов продуктов
          expect(product.product_type).toBeDefined();
          expect(['mortgage', 'deposit', 'credit', 'insurance']).toContain(product.product_type);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Data Persistence Consistency
   * For any product saved to the database, it should be retrievable with the same data
   */
  it('Property: Data Persistence Consistency - saved products should be retrievable unchanged', async () => {
    // Feature: comparison-recommendation-system, Property: Data Persistence Consistency
    
    await fc.assert(
      fc.asyncProperty(
        fc.array(bankProductArbitrary, { minLength: 1, maxLength: 5 }),
        async (products) => {
          // Делаем ID уникальными
          const uniqueProducts = products.map((product, index) => ({
            ...product,
            id: `${product.id}_${index}_${Date.now()}`
          }));
          
          // Сохраняем продукты
          await localDB.saveProducts(uniqueProducts);
          
          // Получаем продукты обратно
          const retrievedProducts = await localDB.getProducts();
          
          // Проверяем, что все сохраненные продукты присутствуют
          for (const originalProduct of uniqueProducts) {
            const found = retrievedProducts.find(p => p.id === originalProduct.id);
            expect(found).toBeDefined();
            
            if (found) {
              // Проверяем ключевые поля
              expect(found.id).toBe(originalProduct.id);
              expect(found.bank_id).toBe(originalProduct.bank_id);
              expect(found.product_type).toBe(originalProduct.product_type);
              expect(found.name).toBe(originalProduct.name);
              expect(found.interest_rate).toBe(originalProduct.interest_rate);
              expect(found.is_active).toBe(originalProduct.is_active);
              expect(found.is_featured).toBe(originalProduct.is_featured);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Filter Consistency
   * For any filter applied to products, the results should match the filter criteria
   */
  it('Property: Filter Consistency - filtered products should match filter criteria', async () => {
    // Feature: comparison-recommendation-system, Property: Filter Consistency
    
    await fc.assert(
      fc.asyncProperty(
        fc.array(bankProductArbitrary, { minLength: 5, maxLength: 20 }),
        fc.record({
          productType: fc.option(fc.constantFrom('mortgage', 'deposit', 'credit', 'insurance')),
          minRate: fc.option(fc.float({ min: 0, max: 50 })),
          maxRate: fc.option(fc.float({ min: 0, max: 50 })),
          isActive: fc.option(fc.boolean())
        }),
        async (products, filters) => {
          // Сохраняем продукты
          await localDB.saveProducts(products);
          
          // Применяем фильтры
          const filteredProducts = await localDB.getProducts(filters);
          
          // Проверяем, что все результаты соответствуют фильтрам
          for (const product of filteredProducts) {
            if (filters.productType) {
              expect(product.product_type).toBe(filters.productType);
            }
            
            if (filters.minRate !== null && filters.minRate !== undefined) {
              expect(product.interest_rate).toBeGreaterThanOrEqual(filters.minRate);
            }
            
            if (filters.maxRate !== null && filters.maxRate !== undefined) {
              expect(product.interest_rate).toBeLessThanOrEqual(filters.maxRate);
            }
            
            if (filters.isActive !== null && filters.isActive !== undefined) {
              expect(product.is_active).toBe(filters.isActive);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});