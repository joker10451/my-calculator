/**
 * Property-based тесты для проверки обработки ограничений
 * Feature: comparison-recommendation-system
 * Property 10: Constraint Handling Completeness
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { MatchingAlgorithm } from '../lib/comparison/MatchingAlgorithm';
import type { UserRequirements, UserPreferences, Constraint } from '../lib/comparison/MatchingAlgorithm';
import type { BankProduct, Bank, ProductType } from '../types/bank';

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
const bankProductArbitrary = (productType: ProductType) => 
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
    is_active: fc.constant(true),
    is_featured: fc.boolean(),
    priority: fc.integer({ min: 0, max: 100 }),
    created_at: fc.integer({ min: 946684800000, max: Date.now() }).map(timestamp => new Date(timestamp).toISOString()),
    updated_at: fc.integer({ min: 946684800000, max: Date.now() }).map(timestamp => new Date(timestamp).toISOString()),
    bank: fc.option(bankArbitrary)
  }) as fc.Arbitrary<BankProduct>;

// Генератор для предпочтений пользователя
const userPreferencesArbitrary = fc.record({
  prioritizeRate: fc.boolean(),
  prioritizeFees: fc.boolean(),
  prioritizeSpeed: fc.boolean(),
  prioritizeRating: fc.boolean(),
  acceptPromotions: fc.boolean(),
  preferredBanks: fc.option(fc.array(fc.uuid(), { maxLength: 3 })),
  avoidBanks: fc.option(fc.array(fc.uuid(), { maxLength: 2 }))
}) as fc.Arbitrary<UserPreferences>;

// Генератор для строгих ограничений
const strictConstraintArbitrary = fc.oneof(
  fc.record({
    type: fc.constant('max_rate' as const),
    value: fc.float({ min: Math.fround(5), max: Math.fround(20), noNaN: true }),
    strict: fc.constant(true)
  }),
  fc.record({
    type: fc.constant('max_fees' as const),
    value: fc.float({ min: Math.fround(1000), max: Math.fround(50000), noNaN: true }),
    strict: fc.constant(true)
  }),
  fc.record({
    type: fc.constant('required_feature' as const),
    value: fc.constantFrom('early_repayment', 'online_application', 'fast_approval'),
    strict: fc.constant(true)
  })
) as fc.Arbitrary<Constraint>;

// Генератор для требований пользователя с ограничениями
const userRequirementsWithConstraintsArbitrary = (productType: ProductType) => 
  fc.record({
    productType: fc.constant(productType),
    amount: fc.float({ min: Math.fround(100000), max: Math.fround(10000000), noNaN: true }),
    term: fc.integer({ min: 12, max: 240 }),
    income: fc.option(fc.float({ min: Math.fround(30000), max: Math.fround(500000), noNaN: true })),
    creditScore: fc.option(fc.integer({ min: 300, max: 850 })),
    region: fc.constantFrom('moscow', 'spb', 'regions', 'all'),
    preferences: userPreferencesArbitrary,
    constraints: fc.array(strictConstraintArbitrary, { minLength: 1, maxLength: 3 })
  }) as fc.Arbitrary<UserRequirements>;

describe('Constraint Handling Completeness Properties', () => {
  const algorithm = new MatchingAlgorithm();

  /**
   * Property 10: Constraint Handling Completeness
   * For any strict user constraints, the system should either find products meeting all requirements
   * or provide clear explanations why none exist
   * **Validates: Requirements 4.4**
   */
  describe('Property 10: Constraint Handling Completeness', () => {
    it('should respect strict rate constraints', async () => {
      // Feature: comparison-recommendation-system, Property 10: Constraint Handling Completeness
      
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('mortgage', 'deposit', 'credit'),
          fc.integer({ min: 5, max: 10 }),
          fc.float({ min: Math.fround(5), max: Math.fround(15), noNaN: true }),
          async (productType, productCount, maxRate) => {
            const products = await fc.sample(bankProductArbitrary(productType), productCount);
            
            const productsWithBanks = products.map((product, index) => ({
              ...product,
              bank: product.bank || {
                id: product.bank_id,
                name: `Банк ${index + 1}`,
                short_name: `Б${index + 1}`,
                is_partner: false,
                overall_rating: 3.5,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as Bank
            }));
            
            const requirements: UserRequirements = {
              productType,
              amount: 1000000,
              term: 120,
              region: 'moscow',
              preferences: {
                prioritizeRate: true,
                prioritizeFees: false,
                prioritizeSpeed: false,
                prioritizeRating: false,
                acceptPromotions: true
              },
              constraints: [
                {
                  type: 'max_rate',
                  value: maxRate,
                  strict: true
                }
              ]
            };
            
            const solution = await algorithm.findOptimalProducts(requirements, productsWithBanks);
            
            // Если есть решение, оно должно соответствовать ограничению (Requirements 4.4)
            if (solution.primaryRecommendation.product.id) {
              const primaryRate = solution.primaryRecommendation.product.promotional_rate || 
                                 solution.primaryRecommendation.product.interest_rate;
              expect(primaryRate).toBeLessThanOrEqual(maxRate);
              
              // Все альтернативы также должны соответствовать
              solution.alternatives.forEach(alt => {
                const altRate = alt.product.promotional_rate || alt.product.interest_rate;
                expect(altRate).toBeLessThanOrEqual(maxRate);
              });
            } else {
              // Если нет решения, должно быть объяснение
              expect(solution.reasoning.warnings.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should respect strict fee constraints', async () => {
      // Feature: comparison-recommendation-system, Property 10: Constraint Handling Completeness
      
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('mortgage', 'credit'),
          fc.integer({ min: 5, max: 10 }),
          fc.float({ min: Math.fround(5000), max: Math.fround(20000), noNaN: true }),
          async (productType, productCount, maxFees) => {
            const products = await fc.sample(bankProductArbitrary(productType), productCount);
            
            const productsWithBanks = products.map((product, index) => ({
              ...product,
              bank: product.bank || {
                id: product.bank_id,
                name: `Банк ${index + 1}`,
                short_name: `Б${index + 1}`,
                is_partner: false,
                overall_rating: 3.5,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as Bank
            }));
            
            const requirements: UserRequirements = {
              productType,
              amount: 1000000,
              term: 120,
              region: 'moscow',
              preferences: {
                prioritizeRate: false,
                prioritizeFees: true,
                prioritizeSpeed: false,
                prioritizeRating: false,
                acceptPromotions: true
              },
              constraints: [
                {
                  type: 'max_fees',
                  value: maxFees,
                  strict: true
                }
              ]
            };
            
            const solution = await algorithm.findOptimalProducts(requirements, productsWithBanks);
            
            // Если есть решение, комиссии должны соответствовать ограничению
            if (solution.primaryRecommendation.product.id) {
              const calculateTotalFees = (fees: Record<string, any>) => {
                if (!fees || typeof fees !== 'object') return 0;
                return Object.values(fees).reduce((sum, fee) => {
                  const feeValue = typeof fee === 'number' ? fee : 0;
                  return sum + feeValue;
                }, 0);
              };
              
              const primaryFees = calculateTotalFees(solution.primaryRecommendation.product.fees);
              expect(primaryFees).toBeLessThanOrEqual(maxFees);
            } else {
              // Если нет решения, должно быть объяснение
              expect(solution.reasoning.warnings.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should respect required feature constraints', async () => {
      // Feature: comparison-recommendation-system, Property 10: Constraint Handling Completeness
      
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('mortgage', 'deposit', 'credit'),
          fc.integer({ min: 5, max: 10 }),
          fc.constantFrom('early_repayment', 'online_application', 'fast_approval'),
          async (productType, productCount, requiredFeature) => {
            const products = await fc.sample(bankProductArbitrary(productType), productCount);
            
            const productsWithBanks = products.map((product, index) => ({
              ...product,
              bank: product.bank || {
                id: product.bank_id,
                name: `Банк ${index + 1}`,
                short_name: `Б${index + 1}`,
                is_partner: false,
                overall_rating: 3.5,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as Bank
            }));
            
            const requirements: UserRequirements = {
              productType,
              amount: 1000000,
              term: 120,
              region: 'moscow',
              preferences: {
                prioritizeRate: false,
                prioritizeFees: false,
                prioritizeSpeed: false,
                prioritizeRating: false,
                acceptPromotions: true
              },
              constraints: [
                {
                  type: 'required_feature',
                  value: requiredFeature,
                  strict: true
                }
              ]
            };
            
            const solution = await algorithm.findOptimalProducts(requirements, productsWithBanks);
            
            // Если есть решение, оно должно иметь требуемую функцию
            if (solution.primaryRecommendation.product.id) {
              expect(solution.primaryRecommendation.product.features?.[requiredFeature]).toBeTruthy();
              
              // Все альтернативы также должны иметь эту функцию
              solution.alternatives.forEach(alt => {
                expect(alt.product.features?.[requiredFeature]).toBeTruthy();
              });
            } else {
              // Если нет решения, должно быть объяснение
              expect(solution.reasoning.warnings.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide clear explanations when no products meet strict constraints', async () => {
      // Feature: comparison-recommendation-system, Property 10: Constraint Handling Completeness
      
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('mortgage', 'deposit', 'credit'),
          fc.integer({ min: 3, max: 8 }),
          async (productType, productCount) => {
            const products = await fc.sample(bankProductArbitrary(productType), productCount);
            
            const productsWithBanks = products.map((product, index) => ({
              ...product,
              bank: product.bank || {
                id: product.bank_id,
                name: `Банк ${index + 1}`,
                short_name: `Б${index + 1}`,
                is_partner: false,
                overall_rating: 3.5,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as Bank
            }));
            
            // Создаем невыполнимые ограничения
            const requirements: UserRequirements = {
              productType,
              amount: 1000000,
              term: 120,
              region: 'moscow',
              preferences: {
                prioritizeRate: false,
                prioritizeFees: false,
                prioritizeSpeed: false,
                prioritizeRating: false,
                acceptPromotions: true
              },
              constraints: [
                {
                  type: 'max_rate',
                  value: 0.1, // Нереально низкая ставка
                  strict: true
                },
                {
                  type: 'max_fees',
                  value: 1, // Нереально низкие комиссии
                  strict: true
                }
              ]
            };
            
            const solution = await algorithm.findOptimalProducts(requirements, productsWithBanks);
            
            // Должно быть либо решение, либо объяснение (Requirements 4.4)
            if (!solution.primaryRecommendation.product.id) {
              // Нет решения - должны быть предупреждения
              expect(solution.reasoning.warnings.length).toBeGreaterThan(0);
              
              // Должны быть следующие шаги
              expect(solution.nextSteps.length).toBeGreaterThan(0);
              
              // Следующие шаги должны содержать рекомендации
              const hasRecommendation = solution.nextSteps.some(step => 
                step.title.toLowerCase().includes('пересмотр') ||
                step.title.toLowerCase().includes('требован') ||
                step.title.toLowerCase().includes('консультант')
              );
              expect(hasRecommendation).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle multiple strict constraints correctly', async () => {
      // Feature: comparison-recommendation-system, Property 10: Constraint Handling Completeness
      
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('mortgage', 'credit'),
          fc.integer({ min: 5, max: 10 }),
          async (productType, productCount) => {
            const products = await fc.sample(bankProductArbitrary(productType), productCount);
            
            const productsWithBanks = products.map((product, index) => ({
              ...product,
              bank: product.bank || {
                id: product.bank_id,
                name: `Банк ${index + 1}`,
                short_name: `Б${index + 1}`,
                is_partner: false,
                overall_rating: 3.5,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as Bank
            }));
            
            const requirements: UserRequirements = {
              productType,
              amount: 1000000,
              term: 120,
              region: 'moscow',
              preferences: {
                prioritizeRate: true,
                prioritizeFees: true,
                prioritizeSpeed: false,
                prioritizeRating: false,
                acceptPromotions: true
              },
              constraints: [
                {
                  type: 'max_rate',
                  value: 15,
                  strict: true
                },
                {
                  type: 'max_fees',
                  value: 15000,
                  strict: true
                },
                {
                  type: 'required_feature',
                  value: 'online_application',
                  strict: true
                }
              ]
            };
            
            const solution = await algorithm.findOptimalProducts(requirements, productsWithBanks);
            
            // Если есть решение, оно должно соответствовать ВСЕМ ограничениям
            if (solution.primaryRecommendation.product.id) {
              const product = solution.primaryRecommendation.product;
              
              // Проверяем ставку
              const rate = product.promotional_rate || product.interest_rate;
              expect(rate).toBeLessThanOrEqual(15);
              
              // Проверяем комиссии
              const calculateTotalFees = (fees: Record<string, any>) => {
                if (!fees || typeof fees !== 'object') return 0;
                return Object.values(fees).reduce((sum, fee) => {
                  const feeValue = typeof fee === 'number' ? fee : 0;
                  return sum + feeValue;
                }, 0);
              };
              const fees = calculateTotalFees(product.fees);
              expect(fees).toBeLessThanOrEqual(15000);
              
              // Проверяем функцию
              expect(product.features?.online_application).toBeTruthy();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should filter out products that do not meet strict constraints', async () => {
      // Feature: comparison-recommendation-system, Property 10: Constraint Handling Completeness
      
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('mortgage', 'deposit', 'credit'),
          fc.integer({ min: 5, max: 10 }),
          async (productType, productCount) => {
            const products = await fc.sample(bankProductArbitrary(productType), productCount);
            
            const productsWithBanks = products.map((product, index) => ({
              ...product,
              bank: product.bank || {
                id: product.bank_id,
                name: `Банк ${index + 1}`,
                short_name: `Б${index + 1}`,
                is_partner: false,
                overall_rating: 3.5,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as Bank
            }));
            
            const requirements: UserRequirements = {
              productType,
              amount: 1000000,
              term: 120,
              region: 'moscow',
              preferences: {
                prioritizeRate: true,
                prioritizeFees: false,
                prioritizeSpeed: false,
                prioritizeRating: false,
                acceptPromotions: true
              },
              constraints: [
                {
                  type: 'max_rate',
                  value: 12,
                  strict: true
                }
              ]
            };
            
            const solution = await algorithm.findOptimalProducts(requirements, productsWithBanks);
            
            // Все рекомендованные продукты должны соответствовать ограничениям
            const allRecommendations = [
              solution.primaryRecommendation,
              ...solution.alternatives
            ].filter(r => r.product.id);
            
            allRecommendations.forEach(rec => {
              const rate = rec.product.promotional_rate || rec.product.interest_rate;
              expect(rate).toBeLessThanOrEqual(12);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
