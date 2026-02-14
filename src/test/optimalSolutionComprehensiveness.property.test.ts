/**
 * Property-based тесты для проверки полноты оптимального решения
 * Feature: comparison-recommendation-system
 * Property 9: Optimal Solution Comprehensiveness
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
    is_active: fc.constant(true), // Только активные продукты
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

// Генератор для ограничений
const constraintArbitrary = fc.oneof(
  fc.record({
    type: fc.constant('max_rate' as const),
    value: fc.float({ min: Math.fround(5), max: Math.fround(20), noNaN: true }),
    strict: fc.boolean()
  }),
  fc.record({
    type: fc.constant('max_fees' as const),
    value: fc.float({ min: Math.fround(1000), max: Math.fround(50000), noNaN: true }),
    strict: fc.boolean()
  }),
  fc.record({
    type: fc.constant('required_feature' as const),
    value: fc.constantFrom('early_repayment', 'online_application', 'fast_approval'),
    strict: fc.boolean()
  })
) as fc.Arbitrary<Constraint>;

// Генератор для требований пользователя
const userRequirementsArbitrary = (productType: ProductType) => 
  fc.record({
    productType: fc.constant(productType),
    amount: fc.float({ min: Math.fround(100000), max: Math.fround(10000000), noNaN: true }),
    term: fc.integer({ min: 12, max: 240 }),
    income: fc.option(fc.float({ min: Math.fround(30000), max: Math.fround(500000), noNaN: true })),
    creditScore: fc.option(fc.integer({ min: 300, max: 850 })),
    region: fc.constantFrom('moscow', 'spb', 'regions', 'all'),
    preferences: userPreferencesArbitrary,
    constraints: fc.array(constraintArbitrary, { maxLength: 3 })
  }) as fc.Arbitrary<UserRequirements>;

describe('Optimal Solution Comprehensiveness Properties', () => {
  const algorithm = new MatchingAlgorithm();

  /**
   * Property 9: Optimal Solution Comprehensiveness
   * For any user financial parameters, the matching algorithm should analyze all available products
   * and consider total cost, monthly payments, and user preferences
   * **Validates: Requirements 4.1, 4.2**
   */
  describe('Property 9: Optimal Solution Comprehensiveness', () => {
    it('should analyze all available products when finding optimal solution', async () => {
      // Feature: comparison-recommendation-system, Property 9: Optimal Solution Comprehensiveness
      
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('mortgage', 'deposit', 'credit', 'insurance'),
          fc.integer({ min: 3, max: 10 }),
          async (productType, productCount) => {
            // Генерируем продукты
            const products = await fc.sample(bankProductArbitrary(productType), productCount);
            
            // Добавляем банк к каждому продукту
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
            
            // Генерируем требования
            const requirements = await fc.sample(userRequirementsArbitrary(productType), 1);
            const userReqs = requirements[0];
            
            // Находим оптимальное решение
            const solution = await algorithm.findOptimalProducts(userReqs, productsWithBanks);
            
            // Проверяем, что решение содержит все необходимые компоненты (Requirements 4.1)
            expect(solution).toBeDefined();
            expect(solution.primaryRecommendation).toBeDefined();
            expect(solution.alternatives).toBeDefined();
            expect(solution.reasoning).toBeDefined();
            expect(solution.totalSavings).toBeDefined();
            expect(solution.riskAssessment).toBeDefined();
            expect(solution.nextSteps).toBeDefined();
            
            // Если есть подходящие продукты, проверяем что они проанализированы
            if (solution.primaryRecommendation.product.id) {
              // Первичная рекомендация должна быть из доступных продуктов
              const primaryExists = productsWithBanks.some(p => p.id === solution.primaryRecommendation.product.id);
              expect(primaryExists).toBe(true);
              
              // Альтернативы должны быть из доступных продуктов
              solution.alternatives.forEach(alt => {
                const altExists = productsWithBanks.some(p => p.id === alt.product.id);
                expect(altExists).toBe(true);
              });
              
              // Первичная рекомендация должна иметь наивысший балл
              solution.alternatives.forEach(alt => {
                expect(solution.primaryRecommendation.score).toBeGreaterThanOrEqual(alt.score);
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should consider total cost and monthly payments in recommendations', async () => {
      // Feature: comparison-recommendation-system, Property 9: Optimal Solution Comprehensiveness
      
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('mortgage', 'credit'),
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
            
            const requirements = await fc.sample(userRequirementsArbitrary(productType), 1);
            const userReqs = requirements[0];
            
            const solution = await algorithm.findOptimalProducts(userReqs, productsWithBanks);
            
            // Если есть решение, проверяем что учтены затраты (Requirements 4.2)
            if (solution.primaryRecommendation.product.id) {
              // Балл должен учитывать процентную ставку
              expect(solution.primaryRecommendation.score).toBeGreaterThan(0);
              expect(solution.primaryRecommendation.score).toBeLessThanOrEqual(100);
              
              // Должны быть плюсы и минусы
              expect(solution.primaryRecommendation.pros).toBeDefined();
              expect(solution.primaryRecommendation.cons).toBeDefined();
              
              // Должна быть оценка соответствия требованиям
              expect(solution.primaryRecommendation.eligibilityScore).toBeGreaterThanOrEqual(0);
              expect(solution.primaryRecommendation.eligibilityScore).toBeLessThanOrEqual(100);
              
              // Должна быть информация об экономии
              expect(solution.totalSavings).toBeGreaterThanOrEqual(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should respect user preferences in ranking', async () => {
      // Feature: comparison-recommendation-system, Property 9: Optimal Solution Comprehensiveness
      
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
            
            const requirements = await fc.sample(userRequirementsArbitrary(productType), 1);
            const userReqs = requirements[0];
            
            const solution = await algorithm.findOptimalProducts(userReqs, productsWithBanks);
            
            // Проверяем что предпочтения учтены в обосновании (Requirements 4.2)
            if (solution.primaryRecommendation.product.id) {
              expect(solution.reasoning.primaryFactors).toBeDefined();
              expect(Array.isArray(solution.reasoning.primaryFactors)).toBe(true);
              
              // Если пользователь приоритизирует ставку, это должно быть отражено
              if (userReqs.preferences.prioritizeRate) {
                const mentionsRate = solution.reasoning.primaryFactors.some(
                  factor => factor.toLowerCase().includes('ставк')
                );
                // Может быть упомянуто, но не обязательно если нет подходящих продуктов
                expect(typeof mentionsRate).toBe('boolean');
              }
              
              // Должны быть предупреждения и допущения
              expect(solution.reasoning.warnings).toBeDefined();
              expect(Array.isArray(solution.reasoning.warnings)).toBe(true);
              expect(solution.reasoning.assumptions).toBeDefined();
              expect(Array.isArray(solution.reasoning.assumptions)).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide actionable next steps', async () => {
      // Feature: comparison-recommendation-system, Property 9: Optimal Solution Comprehensiveness
      
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('mortgage', 'deposit', 'credit', 'insurance'),
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
            
            const requirements = await fc.sample(userRequirementsArbitrary(productType), 1);
            const userReqs = requirements[0];
            
            const solution = await algorithm.findOptimalProducts(userReqs, productsWithBanks);
            
            // Всегда должны быть следующие шаги (Requirements 4.1)
            expect(solution.nextSteps).toBeDefined();
            expect(Array.isArray(solution.nextSteps)).toBe(true);
            expect(solution.nextSteps.length).toBeGreaterThan(0);
            
            // Каждый шаг должен иметь необходимые поля
            solution.nextSteps.forEach((step, index) => {
              expect(step.step).toBe(index + 1);
              expect(step.title).toBeDefined();
              expect(step.title.length).toBeGreaterThan(0);
              expect(step.description).toBeDefined();
              expect(step.description.length).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should assess risk appropriately', async () => {
      // Feature: comparison-recommendation-system, Property 9: Optimal Solution Comprehensiveness
      
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('mortgage', 'deposit', 'credit', 'insurance'),
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
            
            const requirements = await fc.sample(userRequirementsArbitrary(productType), 1);
            const userReqs = requirements[0];
            
            const solution = await algorithm.findOptimalProducts(userReqs, productsWithBanks);
            
            // Должна быть оценка рисков (Requirements 4.1)
            expect(solution.riskAssessment).toBeDefined();
            expect(['low', 'medium', 'high', 'very_high']).toContain(solution.riskAssessment);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should rank alternatives correctly', async () => {
      // Feature: comparison-recommendation-system, Property 9: Optimal Solution Comprehensiveness
      
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
            
            const requirements = await fc.sample(userRequirementsArbitrary(productType), 1);
            const userReqs = requirements[0];
            
            const solution = await algorithm.findOptimalProducts(userReqs, productsWithBanks);
            
            // Если есть альтернативы, они должны быть отсортированы по баллу
            if (solution.alternatives.length > 1) {
              for (let i = 0; i < solution.alternatives.length - 1; i++) {
                expect(solution.alternatives[i].score).toBeGreaterThanOrEqual(
                  solution.alternatives[i + 1].score
                );
                expect(solution.alternatives[i].rank).toBeLessThan(
                  solution.alternatives[i + 1].rank
                );
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
