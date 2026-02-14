/**
 * Property-based тесты для проверки точности подсветки лучших опций
 * Feature: comparison-recommendation-system
 * Property 2: Best Option Highlighting Accuracy
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ComparisonEngine } from '../lib/comparison/ComparisonEngine';
import type { BankProduct, Bank, ComparisonCriteria } from '../types/bank';

// Генератор для банков (упрощенный)
const bankArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 3, maxLength: 50 }).filter(s => s.trim().length > 0),
  short_name: fc.string({ minLength: 2, maxLength: 20 }).filter(s => s.trim().length > 0),
  is_partner: fc.boolean(),
  created_at: fc.integer({ min: 946684800000, max: Date.now() }).map(timestamp => new Date(timestamp).toISOString()),
  updated_at: fc.integer({ min: 946684800000, max: Date.now() }).map(timestamp => new Date(timestamp).toISOString())
}) as fc.Arbitrary<Bank>;

// Генератор для банковских продуктов с уникальными ID
const uniqueBankProductArbitrary = (productType: 'mortgage' | 'deposit' | 'credit') => 
  fc.tuple(
    fc.uuid(),
    fc.uuid(),
    fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
    fc.float({ min: Math.fround(1), max: Math.fround(25), noNaN: true }),
    fc.option(fc.float({ min: Math.fround(100000), max: Math.fround(10000000), noNaN: true })),
    fc.option(fc.float({ min: Math.fround(10000000), max: Math.fround(100000000), noNaN: true })),
    fc.option(fc.integer({ min: 12, max: 60 })),
    fc.option(fc.integer({ min: 60, max: 360 })),
    fc.float({ min: Math.fround(0), max: Math.fround(50000), noNaN: true }),
    fc.boolean(),
    bankArbitrary
  ).map(([id, bank_id, name, rate, minAmt, maxAmt, minTerm, maxTerm, totalFees, featured, bank]) => ({
    id,
    bank_id,
    product_type: productType,
    name,
    description: null,
    interest_rate: rate,
    min_amount: minAmt,
    max_amount: maxAmt,
    min_term: minTerm,
    max_term: maxTerm,
    fees: {
      application: totalFees > 0 ? totalFees / 2 : 0,
      monthly: totalFees > 0 ? totalFees / 2 : 0
    },
    requirements: {},
    features: {
      early_repayment: fc.sample(fc.boolean(), 1)[0]
    },
    promotional_rate: null,
    promo_valid_until: null,
    promo_conditions: null,
    available_regions: ['all'],
    is_active: true,
    is_featured: featured,
    priority: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    bank
  } as BankProduct));

// Генератор для критериев сравнения (упрощенный)
const simpleCriteriaArbitrary = fc.record({
  sort_by: fc.constantFrom('rate', 'total_cost', 'monthly_payment', 'rating'),
  include_promotions: fc.boolean(),
  user_location: fc.option(fc.constantFrom('moscow', 'spb', 'regions'))
}) as fc.Arbitrary<ComparisonCriteria>;

describe('Best Option Highlighting Accuracy Properties', () => {
  const engine = new ComparisonEngine();

  /**
   * Property 2: Best Option Highlighting Accuracy
   * For any product comparison, the system should correctly identify and highlight 
   * the best option for each parameter (lowest rate, highest return, etc.)
   * **Validates: Requirements 1.4**
   */
  describe('Property 2: Best Option Highlighting Accuracy', () => {
    it('should correctly identify product with lowest interest rate', async () => {
      // Feature: comparison-recommendation-system, Property 2: Best Option Highlighting Accuracy
      
      await fc.assert(
        fc.asyncProperty(
          fc.array(uniqueBankProductArbitrary('mortgage'), { minLength: 3, maxLength: 8 }),
          simpleCriteriaArbitrary,
          async (products, criteria) => {
            // Убеждаемся, что все ID уникальны
            const uniqueIds = new Set(products.map(p => p.id));
            fc.pre(uniqueIds.size === products.length);

            const productIds = products.map(p => p.id);
            const result = await engine.compareProducts(productIds, criteria, products);

            // Находим продукт с минимальной ставкой
            const minRate = Math.min(...products.map(p => p.interest_rate));
            const productsWithMinRate = products.filter(p => p.interest_rate === minRate);

            // Проверяем, что хотя бы один из продуктов с минимальной ставкой помечен как лучший
            const bestRateProductId = result.highlights.bestRate;
            if (bestRateProductId) {
              const bestRateProduct = products.find(p => p.id === bestRateProductId);
              expect(bestRateProduct).toBeDefined();
              expect(bestRateProduct?.interest_rate).toBe(minRate);
            }

            // Проверяем, что в матрице правильно помечены лучшие значения
            result.matrix.rows.forEach(row => {
              const product = products.find(p => p.id === row.product_id);
              if (product && row.values['interest_rate']) {
                const isBest = row.values['interest_rate'].is_best;
                const shouldBeBest = product.interest_rate === minRate;
                expect(isBest).toBe(shouldBeBest);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify product with lowest fees', async () => {
      // Feature: comparison-recommendation-system, Property 2: Best Option Highlighting Accuracy
      
      await fc.assert(
        fc.asyncProperty(
          fc.array(uniqueBankProductArbitrary('mortgage'), { minLength: 3, maxLength: 8 }),
          simpleCriteriaArbitrary,
          async (products, criteria) => {
            // Убеждаемся, что все ID уникальны
            const uniqueIds = new Set(products.map(p => p.id));
            fc.pre(uniqueIds.size === products.length);

            const productIds = products.map(p => p.id);
            const result = await engine.compareProducts(productIds, criteria, products);

            // Вычисляем общие комиссии для каждого продукта
            const calculateTotalFees = (fees: Record<string, any>) => {
              return Object.values(fees).reduce((sum: number, fee) => {
                return sum + (typeof fee === 'number' ? fee : 0);
              }, 0);
            };

            const productFees = products.map(p => ({
              id: p.id,
              totalFees: calculateTotalFees(p.fees)
            }));

            const minFees = Math.min(...productFees.map(pf => pf.totalFees));

            // Проверяем, что продукт с минимальными комиссиями помечен как лучший
            const lowestFeesProductId = result.highlights.lowestFees;
            if (lowestFeesProductId) {
              const productWithLowestFees = productFees.find(pf => pf.id === lowestFeesProductId);
              expect(productWithLowestFees).toBeDefined();
              // Используем погрешность для сравнения очень маленьких чисел
              expect(Math.abs(productWithLowestFees!.totalFees - minFees)).toBeLessThan(0.01);
            }

            // Проверяем матрицу
            result.matrix.rows.forEach(row => {
              const productFee = productFees.find(pf => pf.id === row.product_id);
              if (productFee && row.values['fees']) {
                const isBest = row.values['fees'].is_best;
                const shouldBeBest = productFee.totalFees === minFees;
                expect(isBest).toBe(shouldBeBest);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify product with highest maximum amount', async () => {
      // Feature: comparison-recommendation-system, Property 2: Best Option Highlighting Accuracy
      
      await fc.assert(
        fc.asyncProperty(
          fc.array(uniqueBankProductArbitrary('mortgage'), { minLength: 3, maxLength: 8 }),
          simpleCriteriaArbitrary,
          async (products, criteria) => {
            // Убеждаемся, что все ID уникальны
            const uniqueIds = new Set(products.map(p => p.id));
            fc.pre(uniqueIds.size === products.length);

            // Фильтруем продукты с max_amount
            const productsWithMaxAmount = products.filter(p => p.max_amount !== null && p.max_amount !== undefined);
            fc.pre(productsWithMaxAmount.length >= 2);

            const productIds = productsWithMaxAmount.map(p => p.id);
            const result = await engine.compareProducts(productIds, criteria, productsWithMaxAmount);

            // Находим максимальную сумму
            const maxAmount = Math.max(...productsWithMaxAmount.map(p => p.max_amount!));

            // Проверяем матрицу
            result.matrix.rows.forEach(row => {
              const product = productsWithMaxAmount.find(p => p.id === row.product_id);
              if (product && row.values['max_amount'] && product.max_amount !== null) {
                const isBest = row.values['max_amount'].is_best;
                const shouldBeBest = product.max_amount === maxAmount;
                expect(isBest).toBe(shouldBeBest);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should mark multiple products as best when they have equal best values', async () => {
      // Feature: comparison-recommendation-system, Property 2: Best Option Highlighting Accuracy
      
      await fc.assert(
        fc.asyncProperty(
          fc.float({ min: Math.fround(5), max: Math.fround(15), noNaN: true }),
          fc.integer({ min: 3, max: 6 }),
          simpleCriteriaArbitrary,
          async (sharedRate, numProducts, criteria) => {
            // Создаем продукты с одинаковой ставкой
            const products: BankProduct[] = Array.from({ length: numProducts }, (_, i) => ({
              id: `product-${i}`,
              bank_id: `bank-${i}`,
              product_type: 'mortgage' as const,
              name: `Product ${i}`,
              description: null,
              interest_rate: sharedRate,
              min_amount: 1000000,
              max_amount: 10000000,
              min_term: 12,
              max_term: 360,
              fees: { application: 1000, monthly: 500 },
              requirements: {},
              features: {},
              promotional_rate: null,
              promo_valid_until: null,
              promo_conditions: null,
              available_regions: ['all'],
              is_active: true,
              is_featured: false,
              priority: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              bank: {
                id: `bank-${i}`,
                name: `Bank ${i}`,
                short_name: `B${i}`,
                is_partner: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as Bank
            }));

            const productIds = products.map(p => p.id);
            const result = await engine.compareProducts(productIds, criteria, products);

            // Все продукты должны быть помечены как лучшие по ставке
            let bestRateCount = 0;
            result.matrix.rows.forEach(row => {
              if (row.values['interest_rate']?.is_best) {
                bestRateCount++;
              }
            });

            // Все продукты имеют одинаковую ставку, поэтому все должны быть помечены как лучшие
            expect(bestRateCount).toBe(numProducts);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not mark any product as best when all values are null', async () => {
      // Feature: comparison-recommendation-system, Property 2: Best Option Highlighting Accuracy
      
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 5 }),
          simpleCriteriaArbitrary,
          async (numProducts, criteria) => {
            // Создаем продукты без max_amount
            const products: BankProduct[] = Array.from({ length: numProducts }, (_, i) => ({
              id: `product-${i}`,
              bank_id: `bank-${i}`,
              product_type: 'mortgage' as const,
              name: `Product ${i}`,
              description: null,
              interest_rate: 10 + i,
              min_amount: null,
              max_amount: null,
              min_term: null,
              max_term: null,
              fees: {},
              requirements: {},
              features: {},
              promotional_rate: null,
              promo_valid_until: null,
              promo_conditions: null,
              available_regions: ['all'],
              is_active: true,
              is_featured: false,
              priority: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              bank: {
                id: `bank-${i}`,
                name: `Bank ${i}`,
                short_name: `B${i}`,
                is_partner: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as Bank
            }));

            const productIds = products.map(p => p.id);
            const result = await engine.compareProducts(productIds, criteria, products);

            // Проверяем, что ни один продукт не помечен как лучший по max_amount
            result.matrix.rows.forEach(row => {
              if (row.values['max_amount']) {
                expect(row.values['max_amount'].is_best).toBe(false);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly handle boolean features in highlighting', async () => {
      // Feature: comparison-recommendation-system, Property 2: Best Option Highlighting Accuracy
      
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 3, max: 6 }),
          fc.array(fc.boolean(), { minLength: 3, maxLength: 6 }),
          simpleCriteriaArbitrary,
          async (numProducts, earlyRepaymentValues, criteria) => {
            fc.pre(earlyRepaymentValues.length === numProducts);

            // Создаем продукты с разными значениями early_repayment
            const products: BankProduct[] = Array.from({ length: numProducts }, (_, i) => ({
              id: `product-${i}`,
              bank_id: `bank-${i}`,
              product_type: 'mortgage' as const,
              name: `Product ${i}`,
              description: null,
              interest_rate: 10,
              min_amount: 1000000,
              max_amount: 10000000,
              min_term: 12,
              max_term: 360,
              fees: {},
              requirements: {},
              features: {
                early_repayment: earlyRepaymentValues[i]
              },
              promotional_rate: null,
              promo_valid_until: null,
              promo_conditions: null,
              available_regions: ['all'],
              is_active: true,
              is_featured: false,
              priority: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              bank: {
                id: `bank-${i}`,
                name: `Bank ${i}`,
                short_name: `B${i}`,
                is_partner: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as Bank
            }));

            const productIds = products.map(p => p.id);
            const result = await engine.compareProducts(productIds, criteria, products);

            // Проверяем, что продукты с early_repayment=true помечены как лучшие
            result.matrix.rows.forEach(row => {
              const product = products.find(p => p.id === row.product_id);
              if (product && row.values['early_repayment']) {
                const isBest = row.values['early_repayment'].is_best;
                const shouldBeBest = product.features?.early_repayment === true;
                expect(isBest).toBe(shouldBeBest);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
