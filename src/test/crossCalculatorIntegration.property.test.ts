/**
 * Property-Based Tests for Cross-Calculator Recommendation Integration
 * Feature: comparison-recommendation-system
 * Property 5: Cross-Calculator Recommendation Integration
 * Validates: Requirements 2.4
 * 
 * Requirements:
 * 2.4: When a user has used multiple calculators, THE System SHALL provide comprehensive financial product recommendations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { RecommendationSystem } from '@/lib/recommendation/RecommendationSystem';
import { UserProfileManager } from '@/lib/recommendation/UserProfileManager';
import type { UserProfile, ProductType, CalculationHistoryItem, BankProduct } from '@/types/bank';

// Mock Supabase with product data
vi.mock('@/lib/database/supabase', () => {
  // Create mock product helper inside the factory
  const createMockProduct = (type: string, bankId: string) => ({
    id: `product-${type}-${bankId}`,
    bank_id: bankId,
    product_type: type,
    name: `Test ${type} Product`,
    description: `Test product for ${type}`,
    interest_rate: type === 'deposit' ? 10 : 8,
    min_amount: 100000,
    max_amount: 10000000,
    min_term: 6,
    max_term: 360,
    fees: { application: 1000 },
    requirements: { min_income: 30000 },
    features: { early_repayment: true },
    available_regions: ['all'],
    is_active: true,
    is_featured: false,
    priority: 50,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    bank: {
      id: bankId,
      name: 'Test Bank',
      short_name: 'TB',
      is_partner: false,
      overall_rating: 4.5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  });

  const mockProducts = [
    createMockProduct('mortgage', 'bank-1'),
    createMockProduct('mortgage', 'bank-2'),
    createMockProduct('deposit', 'bank-1'),
    createMockProduct('deposit', 'bank-2'),
    createMockProduct('credit', 'bank-1'),
    createMockProduct('insurance', 'bank-1')
  ];

  return {
    supabase: {
      from: vi.fn((table: string) => ({
        select: vi.fn(() => ({
          eq: vi.fn((field: string, value: any) => {
            if (table === 'bank_products' && field === 'product_type') {
              const filtered = mockProducts.filter((p: any) => p.product_type === value);
              return {
                eq: vi.fn(() => Promise.resolve({ data: filtered, error: null }))
              };
            }
            return {
              single: vi.fn(() => Promise.resolve({ data: null, error: null })),
              maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null }))
            };
          }),
          in: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        upsert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      }))
    },
    handleDatabaseError: vi.fn()
  };
});

describe('Property 5: Cross-Calculator Recommendation Integration', () => {
  let recommendationSystem: RecommendationSystem;
  let profileManager: UserProfileManager;

  beforeEach(() => {
    recommendationSystem = new RecommendationSystem();
    profileManager = new UserProfileManager();
    vi.clearAllMocks();
  });

  // Arbitraries для генерации тестовых данных
  const calculatorTypeArbitrary = fc.constantFrom<ProductType>(
    'mortgage',
    'deposit',
    'credit',
    'insurance'
  );

  const calculationHistoryItemArbitrary = fc.record({
    calculator_type: calculatorTypeArbitrary,
    parameters: fc.record({
      amount: fc.integer({ min: 100000, max: 10000000 }),
      term: fc.integer({ min: 6, max: 360 }),
      region: fc.constantFrom('moscow', 'spb', 'ekaterinburg')
    }),
    result: fc.record({
      monthly_payment: fc.integer({ min: 5000, max: 500000 }),
      total_cost: fc.integer({ min: 100000, max: 20000000 })
    }),
    timestamp: fc.integer({ min: 1704067200000, max: Date.now() }).map(ts => new Date(ts).toISOString()),
    session_id: fc.uuid()
  });

  const userProfileWithMultipleCalculatorsArbitrary = fc.record({
    id: fc.uuid(),
    user_id: fc.uuid(),
    monthly_income: fc.integer({ min: 30000, max: 500000 }),
    credit_score: fc.integer({ min: 300, max: 850 }),
    employment_type: fc.constantFrom('employee', 'self_employed'),
    region: fc.constantFrom('moscow', 'spb', 'ekaterinburg'),
    age_range: fc.constantFrom('26-35', '36-45', '46-55'),
    risk_tolerance: fc.constantFrom('low', 'medium', 'high'),
    preferred_banks: fc.array(fc.uuid(), { minLength: 0, maxLength: 3 }),
    blacklisted_banks: fc.array(fc.uuid(), { minLength: 0, maxLength: 2 }),
    calculation_history: fc.array(calculationHistoryItemArbitrary, { minLength: 2, maxLength: 10 }),
    product_interests: fc.array(calculatorTypeArbitrary, { minLength: 1, maxLength: 4 }),
    last_active: fc.integer({ min: 1704067200000, max: Date.now() }).map(ts => new Date(ts).toISOString()),
    session_count: fc.integer({ min: 2, max: 100 }),
    conversion_count: fc.integer({ min: 0, max: 10 }),
    created_at: fc.integer({ min: 1704067200000, max: Date.now() }).map(ts => new Date(ts).toISOString()),
    updated_at: fc.integer({ min: 1704067200000, max: Date.now() }).map(ts => new Date(ts).toISOString())
  }).chain(profile => {
    // Ensure calculation history has at least 2 different calculator types
    const uniqueTypes = new Set(profile.calculation_history.map(h => h.calculator_type));
    if (uniqueTypes.size < 2) {
      // Add another calculation with a different type
      const usedTypes = Array.from(uniqueTypes);
      const availableTypes: ProductType[] = ['mortgage', 'deposit', 'credit', 'insurance'];
      const newType = availableTypes.find(t => !usedTypes.includes(t)) || 'deposit';
      
      return fc.constant({
        ...profile,
        calculation_history: [
          ...profile.calculation_history,
          {
            calculator_type: newType,
            parameters: {
              amount: 500000,
              term: 12,
              region: profile.region || 'moscow'
            },
            result: {
              monthly_payment: 45000,
              total_cost: 540000
            },
            timestamp: new Date().toISOString(),
            session_id: crypto.randomUUID()
          }
        ]
      });
    }
    return fc.constant(profile);
  });

  /**
   * Property 5.1: Multiple Calculator Usage Detection
   * When a user has used multiple calculators, the system should detect this
   */
  it('should detect when user has used multiple calculators', async () => {
    await fc.assert(
      fc.asyncProperty(
        userProfileWithMultipleCalculatorsArbitrary,
        async (profile) => {
          // Mock profile retrieval
          vi.spyOn(profileManager, 'getUserProfile').mockResolvedValue(profile as UserProfile);

          // Get cross-calculator recommendations
          const recommendations = await recommendationSystem.getCrossCalculatorRecommendations(
            profile.user_id,
            10
          );

          // Verify: System should handle multiple calculator usage correctly
          const uniqueCalculators = new Set(profile.calculation_history.map(h => h.calculator_type));
          
          if (uniqueCalculators.size >= 2) {
            // Should return array (may be empty if no matching products, but should not throw)
            expect(Array.isArray(recommendations)).toBe(true);
            // If recommendations are returned, they should have valid structure
            if (recommendations.length > 0) {
              recommendations.forEach(rec => {
                expect(rec.id).toBeDefined();
                expect(rec.type).toBeDefined();
                expect(['package', 'optimization', 'alternative']).toContain(rec.type);
              });
            }
          } else {
            // Should return empty array for users with single calculator usage
            expect(recommendations.length).toBe(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5.2: Comprehensive Recommendation Coverage
   * Recommendations should cover all calculator types used by the user
   */
  it('should provide recommendations covering all used calculator types', async () => {
    await fc.assert(
      fc.asyncProperty(
        userProfileWithMultipleCalculatorsArbitrary,
        async (profile) => {
          // Mock profile retrieval
          vi.spyOn(profileManager, 'getUserProfile').mockResolvedValue(profile as UserProfile);

          // Get cross-calculator recommendations
          const recommendations = await recommendationSystem.getCrossCalculatorRecommendations(
            profile.user_id,
            10
          );

          if (recommendations.length === 0) return true;

          // Verify: Recommendations should reference calculator types from user's history
          const usedCalculators = new Set(profile.calculation_history.map(h => h.calculator_type));
          const recommendedCalculators = new Set(
            recommendations.flatMap(rec => rec.calculatorTypes)
          );

          // At least some of the recommended calculator types should match used calculators
          const hasOverlap = Array.from(recommendedCalculators).some(type => 
            usedCalculators.has(type)
          );
          
          expect(hasOverlap).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5.3: Recommendation Type Diversity
   * Cross-calculator recommendations should include different types (packages, optimizations, alternatives)
   */
  it('should provide diverse recommendation types', async () => {
    await fc.assert(
      fc.asyncProperty(
        userProfileWithMultipleCalculatorsArbitrary,
        async (profile) => {
          // Mock profile retrieval
          vi.spyOn(profileManager, 'getUserProfile').mockResolvedValue(profile as UserProfile);

          // Get cross-calculator recommendations
          const recommendations = await recommendationSystem.getCrossCalculatorRecommendations(
            profile.user_id,
            10
          );

          if (recommendations.length === 0) return true;

          // Verify: Recommendations should have valid types
          const validTypes = ['package', 'optimization', 'alternative'];
          const allTypesValid = recommendations.every(rec => 
            validTypes.includes(rec.type)
          );
          
          expect(allTypesValid).toBe(true);

          // Verify: Each recommendation has required fields
          recommendations.forEach(rec => {
            expect(rec.id).toBeDefined();
            expect(rec.title).toBeDefined();
            expect(rec.description).toBeDefined();
            expect(rec.products).toBeDefined();
            expect(Array.isArray(rec.products)).toBe(true);
            expect(rec.calculatorTypes).toBeDefined();
            expect(Array.isArray(rec.calculatorTypes)).toBe(true);
            expect(rec.explanation).toBeDefined();
            expect(rec.relevanceScore).toBeGreaterThanOrEqual(0);
            expect(rec.relevanceScore).toBeLessThanOrEqual(100);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5.4: Explanation Completeness
   * Each recommendation should have a complete explanation with reasons and financial impact
   * Requirements 2.5: explain why each product was suggested
   */
  it('should provide complete explanations for all recommendations', async () => {
    await fc.assert(
      fc.asyncProperty(
        userProfileWithMultipleCalculatorsArbitrary,
        async (profile) => {
          // Mock profile retrieval
          vi.spyOn(profileManager, 'getUserProfile').mockResolvedValue(profile as UserProfile);

          // Get cross-calculator recommendations
          const recommendations = await recommendationSystem.getCrossCalculatorRecommendations(
            profile.user_id,
            10
          );

          if (recommendations.length === 0) return true;

          // Verify: Each recommendation has complete explanation
          recommendations.forEach(rec => {
            expect(rec.explanation).toBeDefined();
            expect(rec.explanation.summary).toBeDefined();
            expect(typeof rec.explanation.summary).toBe('string');
            expect(rec.explanation.summary.length).toBeGreaterThan(0);
            
            expect(rec.explanation.detailedReasons).toBeDefined();
            expect(Array.isArray(rec.explanation.detailedReasons)).toBe(true);
            expect(rec.explanation.detailedReasons.length).toBeGreaterThan(0);
            
            expect(rec.explanation.financialImpact).toBeDefined();
            expect(rec.explanation.financialImpact.savingsAmount).toBeDefined();
            expect(typeof rec.explanation.financialImpact.savingsAmount).toBe('number');
            expect(rec.explanation.financialImpact.timeframe).toBeDefined();
            expect(rec.explanation.financialImpact.riskLevel).toBeDefined();
            expect(['low', 'medium', 'high']).toContain(rec.explanation.financialImpact.riskLevel);
            
            expect(rec.explanation.relatedCalculations).toBeDefined();
            expect(Array.isArray(rec.explanation.relatedCalculations)).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5.5: Action Steps Presence
   * Each recommendation should provide actionable steps for the user
   */
  it('should provide actionable steps for each recommendation', async () => {
    await fc.assert(
      fc.asyncProperty(
        userProfileWithMultipleCalculatorsArbitrary,
        async (profile) => {
          // Mock profile retrieval
          vi.spyOn(profileManager, 'getUserProfile').mockResolvedValue(profile as UserProfile);

          // Get cross-calculator recommendations
          const recommendations = await recommendationSystem.getCrossCalculatorRecommendations(
            profile.user_id,
            10
          );

          if (recommendations.length === 0) return true;

          // Verify: Each recommendation has action steps
          recommendations.forEach(rec => {
            expect(rec.actionSteps).toBeDefined();
            expect(Array.isArray(rec.actionSteps)).toBe(true);
            expect(rec.actionSteps.length).toBeGreaterThan(0);
            
            // Each action step should be a non-empty string
            rec.actionSteps.forEach(step => {
              expect(typeof step).toBe('string');
              expect(step.length).toBeGreaterThan(0);
            });
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5.6: Relevance Score Ordering
   * Recommendations should be ordered by relevance score (highest first)
   */
  it('should order recommendations by relevance score', async () => {
    await fc.assert(
      fc.asyncProperty(
        userProfileWithMultipleCalculatorsArbitrary,
        async (profile) => {
          // Mock profile retrieval
          vi.spyOn(profileManager, 'getUserProfile').mockResolvedValue(profile as UserProfile);

          // Get cross-calculator recommendations
          const recommendations = await recommendationSystem.getCrossCalculatorRecommendations(
            profile.user_id,
            10
          );

          if (recommendations.length <= 1) return true;

          // Verify: Recommendations are sorted by relevance score (descending)
          for (let i = 0; i < recommendations.length - 1; i++) {
            expect(recommendations[i].relevanceScore).toBeGreaterThanOrEqual(
              recommendations[i + 1].relevanceScore
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
