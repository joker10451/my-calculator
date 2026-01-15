/**
 * Property-based тесты для проверки полноты данных сравнения
 * Feature: comparison-recommendation-system
 * Property 1: Comparison Data Completeness
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ComparisonEngine } from '../lib/comparison/ComparisonEngine';
import type { BankProduct, Bank, ComparisonCriteria } from '../types/bank';

// Генератор для банков
const bankArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 3, maxLength: 100 }).filter(s => s.trim().length > 0),
  short_name: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 0),
  logo_url: fc.option(fc.webUrl()),
  website_url: fc.option(fc.webUrl()),
  overall_rating: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(5), noNaN: true })),
  customer_service_rating: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(5), noNaN: true })),
  reliability_rating: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(5), noNaN: true })),
  processing_speed_rating: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(5), noNaN: true })),
  phone: fc.option(fc.string()),
  email: fc.option(fc.emailAddress()),
  address: fc.option(fc.string()),
  license_number: fc.option(fc.string()),
  central_bank_code: fc.option(fc.string()),
  is_partner: fc.boolean(),
  commission_rate: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(100), noNaN: true })),
  referral_terms: fc.option(fc.string()),
  created_at: fc.integer({ min: 946684800000, max: Date.now() }).map(timestamp => new Date(timestamp).toISOString()),
  updated_at: fc.integer({ min: 946684800000, max: Date.now() }).map(timestamp => new Date(timestamp).toISOString())
}) as fc.Arbitrary<Bank>;

// Генератор для банковских продуктов
const bankProductArbitrary = (productType: 'mortgage' | 'deposit' | 'credit' | 'insurance') => 
  fc.record({
    id: fc.uuid(),
    bank_id: fc.uuid(),
    product_type: fc.constant(productType),
    name: fc.string({ minLength: 5, maxLength: 200 }).filter(s => s.trim().length > 0),
    description: fc.option(fc.string({ maxLength: 500 })),
    interest_rate: fc.float({ min: Math.fround(0.1), max: Math.fround(30), noNaN: true }),
    min_amount: fc.option(fc.float({ min: Math.fround(10000), max: Math.fround(1000000), noNaN: true })),
    max_amount: fc.option(fc.float({ min: Math.fround(1000000), max: Math.fround(100000000), noNaN: true })),
    min_term: fc.option(fc.integer({ min: 1, max: 60 })),
    max_term: fc.option(fc.integer({ min: 60, max: 360 })),
    fees: fc.record({
      application: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(10000), noNaN: true })),
      monthly: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(5000), noNaN: true })),
      early_repayment: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(50000), noNaN: true })),
      cash_withdrawal: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(1000), noNaN: true })),
      account_maintenance: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(2000), noNaN: true }))
    }),
    requirements: fc.record({
      min_income: fc.option(fc.float({ min: Math.fround(20000), max: Math.fround(500000), noNaN: true })),
      min_age: fc.option(fc.integer({ min: 18, max: 25 })),
      max_age: fc.option(fc.integer({ min: 60, max: 75 })),
      min_credit_score: fc.option(fc.integer({ min: 300, max: 850 })),
      employment_experience: fc.option(fc.integer({ min: 0, max: 120 }))
    }),
    features: fc.record({
      early_repayment: fc.option(fc.boolean()),
      grace_period: fc.option(fc.oneof(fc.boolean(), fc.integer({ min: 0, max: 100 }))),
      capitalization: fc.option(fc.boolean()),
      replenishment: fc.option(fc.boolean()),
      partial_withdrawal: fc.option(fc.boolean()),
      online_application: fc.option(fc.boolean()),
      fast_approval: fc.option(fc.boolean()),
      insurance_included: fc.option(fc.boolean())
    }),
    promotional_rate: fc.option(fc.float({ min: Math.fround(0.1), max: Math.fround(20), noNaN: true })),
    promo_valid_until: fc.option(fc.integer({ min: Date.now(), max: Date.now() + 365 * 24 * 60 * 60 * 1000 }).map(timestamp => new Date(timestamp).toISOString())),
    promo_conditions: fc.option(fc.string({ maxLength: 300 })),
    available_regions: fc.array(fc.constantFrom('moscow', 'spb', 'regions', 'all'), { minLength: 1, maxLength: 4 }),
    is_active: fc.boolean(),
    is_featured: fc.boolean(),
    priority: fc.integer({ min: 0, max: 100 }),
    created_at: fc.integer({ min: 946684800000, max: Date.now() }).map(timestamp => new Date(timestamp).toISOString()),
    updated_at: fc.integer({ min: 946684800000, max: Date.now() }).map(timestamp => new Date(timestamp).toISOString()),
    bank: fc.option(bankArbitrary)
  }) as fc.Arbitrary<BankProduct>;

// Генератор для критериев сравнения
const comparisonCriteriaArbitrary = fc.record({
  sort_by: fc.constantFrom('rate', 'total_cost', 'monthly_payment', 'rating'),
  include_promotions: fc.boolean(),
  user_location: fc.option(fc.constantFrom('moscow', 'spb', 'regions')),
  user_profile: fc.option(fc.record({
    income: fc.float({ min: Math.fround(30000), max: Math.fround(500000), noNaN: true }),
    credit_score: fc.option(fc.integer({ min: 300, max: 850 })),
    loan_amount: fc.option(fc.float({ min: Math.fround(100000), max: Math.fround(50000000), noNaN: true })),
    loan_term: fc.option(fc.integer({ min: 12, max: 360 })),
    down_payment: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(10000000), noNaN: true })),
    risk_tolerance: fc.constantFrom('low', 'medium', 'high')
  }))
}) as fc.Arbitrary<ComparisonCriteria>;

describe('Comparison Data Completeness Properties', () => {
  const engine = new ComparisonEngine();

  /**
   * Property 1: Comparison Data Completeness
   * For any set of bank products being compared, the comparison table should display 
   * all required fields (rates, terms, fees) for each product type
   * **Validates: Requirements 1.2, 1.3**
   */
  describe('Property 1: Comparison Data Completeness', () => {
    it('should display all required fields for mortgage products', async () => {
      // Feature: comparison-recommendation-system, Property 1: Comparison Data Completeness
      
      await fc.assert(
        fc.asyncProperty(
          fc.array(bankProductArbitrary('mortgage'), { minLength: 2, maxLength: 5 }),
          comparisonCriteriaArbitrary,
          async (products, criteria) => {
            // Добавляем банк к каждому продукту, если его нет
            const productsWithBanks = products.map((product, index) => ({
              ...product,
              bank: product.bank || {
                id: product.bank_id,
                name: `Банк ${index + 1}`,
                short_name: `Б${index + 1}`,
                is_partner: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as Bank
            }));

            const productIds = productsWithBanks.map(p => p.id);
            const result = await engine.compareProducts(productIds, criteria, productsWithBanks);

            // Проверяем, что матрица содержит все продукты
            expect(result.matrix.rows.length).toBe(productsWithBanks.length);

            // Проверяем, что для каждого продукта есть все обязательные поля для ипотеки
            result.matrix.rows.forEach((row, index) => {
              const product = productsWithBanks[index];

              // Обязательные поля для ипотеки (Requirements 1.2)
              expect(row.values['bank_name']).toBeDefined();
              expect(row.values['bank_name'].raw).toBeTruthy();
              
              expect(row.values['product_name']).toBeDefined();
              expect(row.values['product_name'].raw).toBe(product.name);
              
              expect(row.values['interest_rate']).toBeDefined();
              expect(row.values['interest_rate'].raw).toBe(product.interest_rate);
              expect(row.values['interest_rate'].formatted).toContain('%');
              
              // Проверяем суммы
              if (product.min_amount !== null && product.min_amount !== undefined) {
                expect(row.values['min_amount']).toBeDefined();
                expect(row.values['min_amount'].raw).toBe(product.min_amount);
              }
              
              if (product.max_amount !== null && product.max_amount !== undefined) {
                expect(row.values['max_amount']).toBeDefined();
                expect(row.values['max_amount'].raw).toBe(product.max_amount);
              }
              
              // Проверяем сроки
              if (product.min_term !== null && product.min_term !== undefined) {
                expect(row.values['min_term']).toBeDefined();
                expect(row.values['min_term'].raw).toBe(product.min_term);
              }
              
              if (product.max_term !== null && product.max_term !== undefined) {
                expect(row.values['max_term']).toBeDefined();
                expect(row.values['max_term'].raw).toBe(product.max_term);
              }
              
              // Проверяем комиссии
              expect(row.values['fees']).toBeDefined();
              expect(typeof row.values['fees'].raw).toBe('number');
              
              // Проверяем досрочное погашение
              expect(row.values['early_repayment']).toBeDefined();
              expect(typeof row.values['early_repayment'].raw).toBe('boolean');
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should display all required fields for deposit products', async () => {
      // Feature: comparison-recommendation-system, Property 1: Comparison Data Completeness
      
      await fc.assert(
        fc.asyncProperty(
          fc.array(bankProductArbitrary('deposit'), { minLength: 2, maxLength: 5 }),
          comparisonCriteriaArbitrary,
          async (products, criteria) => {
            // Добавляем банк к каждому продукту, если его нет
            const productsWithBanks = products.map((product, index) => ({
              ...product,
              bank: product.bank || {
                id: product.bank_id,
                name: `Банк ${index + 1}`,
                short_name: `Б${index + 1}`,
                is_partner: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as Bank
            }));

            const productIds = productsWithBanks.map(p => p.id);
            const result = await engine.compareProducts(productIds, criteria, productsWithBanks);

            // Проверяем, что матрица содержит все продукты
            expect(result.matrix.rows.length).toBe(productsWithBanks.length);

            // Проверяем, что для каждого продукта есть все обязательные поля для вкладов
            result.matrix.rows.forEach((row, index) => {
              const product = productsWithBanks[index];

              // Обязательные поля для вкладов (Requirements 1.3)
              expect(row.values['bank_name']).toBeDefined();
              expect(row.values['bank_name'].raw).toBeTruthy();
              
              expect(row.values['product_name']).toBeDefined();
              expect(row.values['product_name'].raw).toBe(product.name);
              
              expect(row.values['interest_rate']).toBeDefined();
              expect(row.values['interest_rate'].raw).toBe(product.interest_rate);
              expect(row.values['interest_rate'].formatted).toContain('%');
              
              // Проверяем минимальную сумму
              if (product.min_amount !== null && product.min_amount !== undefined) {
                expect(row.values['min_amount']).toBeDefined();
                expect(row.values['min_amount'].raw).toBe(product.min_amount);
              }
              
              // Проверяем срок
              if (product.min_term !== null && product.min_term !== undefined) {
                expect(row.values['min_term']).toBeDefined();
                expect(row.values['min_term'].raw).toBe(product.min_term);
              }
              
              // Проверяем капитализацию
              expect(row.values['capitalization']).toBeDefined();
              expect(typeof row.values['capitalization'].raw).toBe('boolean');
              
              // Проверяем пополнение
              expect(row.values['replenishment']).toBeDefined();
              expect(typeof row.values['replenishment'].raw).toBe('boolean');
              
              // Проверяем частичное снятие
              expect(row.values['partial_withdrawal']).toBeDefined();
              expect(typeof row.values['partial_withdrawal'].raw).toBe('boolean');
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should display all required fields for credit products', async () => {
      // Feature: comparison-recommendation-system, Property 1: Comparison Data Completeness
      
      await fc.assert(
        fc.asyncProperty(
          fc.array(bankProductArbitrary('credit'), { minLength: 2, maxLength: 5 }),
          comparisonCriteriaArbitrary,
          async (products, criteria) => {
            // Добавляем банк к каждому продукту, если его нет
            const productsWithBanks = products.map((product, index) => ({
              ...product,
              bank: product.bank || {
                id: product.bank_id,
                name: `Банк ${index + 1}`,
                short_name: `Б${index + 1}`,
                is_partner: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as Bank
            }));

            const productIds = productsWithBanks.map(p => p.id);
            const result = await engine.compareProducts(productIds, criteria, productsWithBanks);

            // Проверяем, что матрица содержит все продукты
            expect(result.matrix.rows.length).toBe(productsWithBanks.length);

            // Проверяем, что для каждого продукта есть все обязательные поля для кредитов
            result.matrix.rows.forEach((row, index) => {
              const product = productsWithBanks[index];

              // Обязательные поля для кредитов
              expect(row.values['bank_name']).toBeDefined();
              expect(row.values['bank_name'].raw).toBeTruthy();
              
              expect(row.values['product_name']).toBeDefined();
              expect(row.values['product_name'].raw).toBe(product.name);
              
              expect(row.values['interest_rate']).toBeDefined();
              expect(row.values['interest_rate'].raw).toBe(product.interest_rate);
              expect(row.values['interest_rate'].formatted).toContain('%');
              
              // Проверяем максимальную сумму
              if (product.max_amount !== null && product.max_amount !== undefined) {
                expect(row.values['max_amount']).toBeDefined();
                expect(row.values['max_amount'].raw).toBe(product.max_amount);
              }
              
              // Проверяем максимальный срок
              if (product.max_term !== null && product.max_term !== undefined) {
                expect(row.values['max_term']).toBeDefined();
                expect(row.values['max_term'].raw).toBe(product.max_term);
              }
              
              // Проверяем льготный период
              expect(row.values['grace_period']).toBeDefined();
              
              // Проверяем комиссии
              expect(row.values['fees']).toBeDefined();
              expect(typeof row.values['fees'].raw).toBe('number');
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format all values correctly according to their type', async () => {
      // Feature: comparison-recommendation-system, Property 1: Comparison Data Completeness
      
      await fc.assert(
        fc.asyncProperty(
          fc.array(bankProductArbitrary('mortgage'), { minLength: 2, maxLength: 5 }),
          comparisonCriteriaArbitrary,
          async (products, criteria) => {
            const productsWithBanks = products.map((product, index) => ({
              ...product,
              bank: product.bank || {
                id: product.bank_id,
                name: `Банк ${index + 1}`,
                short_name: `Б${index + 1}`,
                is_partner: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as Bank
            }));

            const productIds = productsWithBanks.map(p => p.id);
            const result = await engine.compareProducts(productIds, criteria, productsWithBanks);

            // Проверяем форматирование значений
            result.matrix.rows.forEach(row => {
              // Процентные значения должны содержать %
              if (row.values['interest_rate']) {
                expect(row.values['interest_rate'].formatted).toMatch(/%$/);
              }
              
              // Денежные значения должны содержать ₽
              if (row.values['min_amount'] && row.values['min_amount'].raw !== null) {
                expect(row.values['min_amount'].formatted).toMatch(/₽/);
              }
              
              if (row.values['max_amount'] && row.values['max_amount'].raw !== null) {
                expect(row.values['max_amount'].formatted).toMatch(/₽/);
              }
              
              if (row.values['fees']) {
                expect(row.values['fees'].formatted).toMatch(/₽/);
              }
              
              // Булевы значения должны быть "Да" или "Нет"
              if (row.values['early_repayment']) {
                expect(['Да', 'Нет']).toContain(row.values['early_repayment'].formatted);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include all products in comparison result', async () => {
      // Feature: comparison-recommendation-system, Property 1: Comparison Data Completeness
      
      await fc.assert(
        fc.asyncProperty(
          fc.array(bankProductArbitrary('mortgage'), { minLength: 2, maxLength: 10 }),
          comparisonCriteriaArbitrary,
          async (products, criteria) => {
            const productsWithBanks = products.map((product, index) => ({
              ...product,
              bank: product.bank || {
                id: product.bank_id,
                name: `Банк ${index + 1}`,
                short_name: `Б${index + 1}`,
                is_partner: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as Bank
            }));

            const productIds = productsWithBanks.map(p => p.id);
            const result = await engine.compareProducts(productIds, criteria, productsWithBanks);

            // Проверяем, что все продукты включены в результат
            expect(result.products.length).toBe(productsWithBanks.length);
            expect(result.matrix.rows.length).toBe(productsWithBanks.length);
            
            // Проверяем, что каждый продукт представлен в матрице
            productsWithBanks.forEach(product => {
              const row = result.matrix.rows.find(r => r.product_id === product.id);
              expect(row).toBeDefined();
              expect(row?.product_name).toBe(product.name);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
