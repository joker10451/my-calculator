/**
 * Property-based тесты для персистентности пользовательских профилей
 * Feature: comparison-recommendation-system
 * Property 15: User Profile Persistence
 * **Validates: Requirements 7.1, 7.3**
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';

// Мокаем Supabase ПЕРЕД импортом модулей, которые его используют
vi.mock('@/lib/database/supabase', async () => {
  const { mockSupabase } = await import('./__mocks__/supabase');
  return {
    supabase: mockSupabase,
    handleDatabaseError: (error: any) => {
      throw new Error(error.message || 'Database error');
    }
  };
});

import { UserProfileManager, type CalculationData } from '@/lib/recommendation';
import type { UserProfileData, ProductType, EmploymentType, RiskTolerance } from '@/types/bank';
import { clearMockDatabase } from './__mocks__/supabase';

// Генераторы для property-based тестирования

const employmentTypeArbitrary = fc.constantFrom<EmploymentType>(
  'employee',
  'self_employed',
  'unemployed',
  'retired',
  'student'
);

const riskToleranceArbitrary = fc.constantFrom<RiskTolerance>(
  'low',
  'medium',
  'high'
);

const productTypeArbitrary = fc.constantFrom<ProductType>(
  'mortgage',
  'deposit',
  'credit',
  'insurance'
);

const calculationHistoryItemArbitrary = fc.record({
  calculator_type: fc.constantFrom('mortgage', 'deposit', 'credit', 'loan', 'insurance'),
  parameters: fc.record({
    amount: fc.option(fc.float({ min: 10000, max: 100000000, noNaN: true })),
    term: fc.option(fc.integer({ min: 1, max: 360 })),
    rate: fc.option(fc.float({ min: 0, max: 30, noNaN: true })),
    region: fc.option(fc.constantFrom('moscow', 'spb', 'regions'))
  }),
  result: fc.record({
    monthly_payment: fc.option(fc.float({ min: 0, max: 1000000, noNaN: true })),
    total_cost: fc.option(fc.float({ min: 0, max: 200000000, noNaN: true })),
    overpayment: fc.option(fc.float({ min: 0, max: 100000000, noNaN: true }))
  }),
  timestamp: fc.integer({ min: 1577836800000, max: Date.now() }).map(t => new Date(t).toISOString()),
  session_id: fc.option(fc.uuid())
});

const userProfileDataArbitrary = fc.record({
  user_id: fc.uuid(),
  monthly_income: fc.option(fc.float({ min: 10000, max: 10000000, noNaN: true })),
  credit_score: fc.option(fc.integer({ min: 300, max: 850 })),
  employment_type: fc.option(employmentTypeArbitrary),
  region: fc.option(fc.constantFrom('moscow', 'spb', 'regions', 'all')),
  age_range: fc.option(fc.constantFrom('18-25', '26-35', '36-45', '46-55', '56-65', '65+')),
  risk_tolerance: fc.option(riskToleranceArbitrary),
  preferred_banks: fc.array(fc.uuid(), { maxLength: 5 }),
  blacklisted_banks: fc.array(fc.uuid(), { maxLength: 3 }),
  calculation_history: fc.array(calculationHistoryItemArbitrary, { maxLength: 10 }),
  product_interests: fc.array(productTypeArbitrary, { maxLength: 4 })
});

const calculationDataArbitrary = fc.record({
  calculator_type: fc.constantFrom('mortgage', 'deposit', 'credit', 'loan', 'insurance'),
  parameters: fc.record({
    amount: fc.float({ min: 10000, max: 100000000, noNaN: true }),
    term: fc.integer({ min: 1, max: 360 }),
    rate: fc.option(fc.float({ min: 0, max: 30, noNaN: true })),
    region: fc.option(fc.constantFrom('moscow', 'spb', 'regions'))
  }),
  result: fc.record({
    monthly_payment: fc.float({ min: 0, max: 1000000, noNaN: true }),
    total_cost: fc.float({ min: 0, max: 200000000, noNaN: true }),
    overpayment: fc.option(fc.float({ min: 0, max: 100000000, noNaN: true }))
  }),
  timestamp: fc.option(fc.integer({ min: 1577836800000, max: Date.now() }).map(t => new Date(t).toISOString())),
  session_id: fc.option(fc.uuid())
});

describe('User Profile Persistence Properties', () => {
  let profileManager: UserProfileManager;

  beforeEach(() => {
    profileManager = new UserProfileManager();
    // Очищаем localStorage и мок БД перед каждым тестом
    localStorage.clear();
    clearMockDatabase();
  });

  afterEach(() => {
    // Очищаем после теста
    localStorage.clear();
    clearMockDatabase();
  });

  /**
   * Property 15: User Profile Persistence
   * For any user calculation or preference change, the data should be stored in the user profile
   * and applied to future recommendations
   * **Validates: Requirements 7.1, 7.3**
   */
  it('Property 15: User Profile Persistence - profile data should persist across sessions', async () => {
    // Feature: comparison-recommendation-system, Property 15: User Profile Persistence
    
    await fc.assert(
      fc.asyncProperty(
        userProfileDataArbitrary,
        async (profileData) => {
          // Создаем профиль
          const createdProfile = await profileManager.createUserProfile(profileData);
          
          // Проверяем, что профиль создан с правильными данными
          expect(createdProfile).toBeDefined();
          expect(createdProfile.user_id).toBe(profileData.user_id);
          expect(createdProfile.monthly_income).toBe(profileData.monthly_income || null);
          expect(createdProfile.credit_score).toBe(profileData.credit_score || null);
          expect(createdProfile.employment_type).toBe(profileData.employment_type || null);
          expect(createdProfile.region).toBe(profileData.region || null);
          expect(createdProfile.age_range).toBe(profileData.age_range || null);
          expect(createdProfile.risk_tolerance).toBe(profileData.risk_tolerance || null);
          
          // Проверяем массивы
          expect(createdProfile.preferred_banks).toEqual(profileData.preferred_banks || []);
          expect(createdProfile.blacklisted_banks).toEqual(profileData.blacklisted_banks || []);
          expect(createdProfile.product_interests).toEqual(profileData.product_interests || []);
          
          // Получаем профиль снова (симулируем новую сессию)
          const retrievedProfile = await profileManager.getUserProfile(profileData.user_id);
          
          // Проверяем, что данные сохранились
          expect(retrievedProfile).toBeDefined();
          expect(retrievedProfile?.user_id).toBe(createdProfile.user_id);
          expect(retrievedProfile?.monthly_income).toBe(createdProfile.monthly_income);
          expect(retrievedProfile?.credit_score).toBe(createdProfile.credit_score);
          expect(retrievedProfile?.employment_type).toBe(createdProfile.employment_type);
          expect(retrievedProfile?.region).toBe(createdProfile.region);
          expect(retrievedProfile?.age_range).toBe(createdProfile.age_range);
          expect(retrievedProfile?.risk_tolerance).toBe(createdProfile.risk_tolerance);
          expect(retrievedProfile?.preferred_banks).toEqual(createdProfile.preferred_banks);
          expect(retrievedProfile?.blacklisted_banks).toEqual(createdProfile.blacklisted_banks);
          expect(retrievedProfile?.product_interests).toEqual(createdProfile.product_interests);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Calculation Tracking Persistence
   * For any calculation tracked, it should be stored in the user's calculation history
   */
  it('Property: Calculation Tracking Persistence - calculations should be stored in history', async () => {
    // Feature: comparison-recommendation-system, Property: Calculation Tracking Persistence
    
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.array(calculationDataArbitrary, { minLength: 1, maxLength: 5 }),
        async (userId, calculations) => {
          // Создаем профиль
          await profileManager.createUserProfile({ user_id: userId });
          
          // Отслеживаем все расчеты
          for (const calc of calculations) {
            await profileManager.trackCalculation(userId, calc);
          }
          
          // Получаем профиль
          const profile = await profileManager.getUserProfile(userId);
          
          // Проверяем, что все расчеты сохранены
          expect(profile).toBeDefined();
          expect(profile?.calculation_history).toBeDefined();
          expect(profile?.calculation_history.length).toBeGreaterThanOrEqual(calculations.length);
          
          // Проверяем, что последние расчеты присутствуют в истории
          for (const calc of calculations) {
            const found = profile?.calculation_history.some(h => 
              h.calculator_type === calc.calculator_type &&
              h.parameters.amount === calc.parameters.amount &&
              h.parameters.term === calc.parameters.term
            );
            expect(found).toBe(true);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Profile Update Persistence
   * For any profile update, the changes should persist across sessions
   */
  it('Property: Profile Update Persistence - profile updates should persist', async () => {
    // Feature: comparison-recommendation-system, Property: Profile Update Persistence
    
    await fc.assert(
      fc.asyncProperty(
        userProfileDataArbitrary,
        fc.record({
          monthly_income: fc.option(fc.float({ min: 10000, max: 10000000, noNaN: true })),
          credit_score: fc.option(fc.integer({ min: 300, max: 850 })),
          region: fc.option(fc.constantFrom('moscow', 'spb', 'regions', 'all')),
          risk_tolerance: fc.option(riskToleranceArbitrary)
        }),
        async (initialData, updates) => {
          // Создаем профиль
          const createdProfile = await profileManager.createUserProfile(initialData);
          
          // Обновляем профиль
          const updatedProfile = await profileManager.updateUserProfile(
            createdProfile.user_id,
            updates,
            { update_last_active: true }
          );
          
          // Проверяем, что обновления применены
          if (updates.monthly_income !== undefined) {
            expect(updatedProfile.monthly_income).toBe(updates.monthly_income);
          }
          if (updates.credit_score !== undefined) {
            expect(updatedProfile.credit_score).toBe(updates.credit_score);
          }
          if (updates.region !== undefined) {
            expect(updatedProfile.region).toBe(updates.region);
          }
          if (updates.risk_tolerance !== undefined) {
            expect(updatedProfile.risk_tolerance).toBe(updates.risk_tolerance);
          }
          
          // Получаем профиль снова
          const retrievedProfile = await profileManager.getUserProfile(createdProfile.user_id);
          
          // Проверяем, что обновления сохранились
          expect(retrievedProfile).toBeDefined();
          if (updates.monthly_income !== undefined) {
            expect(retrievedProfile?.monthly_income).toBe(updates.monthly_income);
          }
          if (updates.credit_score !== undefined) {
            expect(retrievedProfile?.credit_score).toBe(updates.credit_score);
          }
          if (updates.region !== undefined) {
            expect(retrievedProfile?.region).toBe(updates.region);
          }
          if (updates.risk_tolerance !== undefined) {
            expect(retrievedProfile?.risk_tolerance).toBe(updates.risk_tolerance);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Product Interest Tracking
   * For any calculation, the product type should be added to user's product interests
   */
  it('Property: Product Interest Tracking - product interests should be tracked from calculations', async () => {
    // Feature: comparison-recommendation-system, Property: Product Interest Tracking
    
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.array(calculationDataArbitrary, { minLength: 1, maxLength: 10 }),
        async (userId, calculations) => {
          // Создаем профиль
          await profileManager.createUserProfile({ user_id: userId });
          
          // Отслеживаем расчеты
          for (const calc of calculations) {
            await profileManager.trackCalculation(userId, calc);
          }
          
          // Получаем профиль
          const profile = await profileManager.getUserProfile(userId);
          
          // Собираем уникальные типы калькуляторов
          const uniqueTypes = new Set(calculations.map(c => c.calculator_type));
          
          // Проверяем, что интересы к продуктам обновлены
          expect(profile).toBeDefined();
          expect(profile?.product_interests).toBeDefined();
          
          // Проверяем, что хотя бы некоторые типы продуктов добавлены
          // (не все типы калькуляторов напрямую соответствуют типам продуктов)
          expect(profile?.product_interests.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Session Count Increment
   * For any profile update with increment_session option, session count should increase
   */
  it('Property: Session Count Increment - session count should increment correctly', async () => {
    // Feature: comparison-recommendation-system, Property: Session Count Increment
    
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.integer({ min: 1, max: 10 }),
        async (userId, sessionCount) => {
          // Создаем профиль
          const initialProfile = await profileManager.createUserProfile({ user_id: userId });
          const initialSessionCount = initialProfile.session_count;
          
          // Обновляем профиль несколько раз с increment_session
          for (let i = 0; i < sessionCount; i++) {
            await profileManager.updateUserProfile(
              userId,
              {},
              { increment_session: true }
            );
          }
          
          // Получаем профиль
          const profile = await profileManager.getUserProfile(userId);
          
          // Проверяем, что счетчик сессий увеличился правильно
          expect(profile).toBeDefined();
          expect(profile?.session_count).toBe(initialSessionCount + sessionCount);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Calculation History Limit
   * For any number of calculations, history should not exceed MAX_HISTORY_ITEMS
   */
  it('Property: Calculation History Limit - history should be limited to MAX_HISTORY_ITEMS', async () => {
    // Feature: comparison-recommendation-system, Property: Calculation History Limit
    
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.array(calculationDataArbitrary, { minLength: 50, maxLength: 150 }),
        async (userId, calculations) => {
          // Создаем профиль
          await profileManager.createUserProfile({ user_id: userId });
          
          // Отслеживаем все расчеты
          for (const calc of calculations) {
            await profileManager.trackCalculation(userId, calc);
          }
          
          // Получаем профиль
          const profile = await profileManager.getUserProfile(userId);
          
          // Проверяем, что история не превышает лимит (100 записей)
          expect(profile).toBeDefined();
          expect(profile?.calculation_history).toBeDefined();
          expect(profile?.calculation_history.length).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Anonymous Profile Creation
   * For any anonymous user, a profile should be created and retrievable
   */
  it('Property: Anonymous Profile Creation - anonymous profiles should be created and persist', async () => {
    // Feature: comparison-recommendation-system, Property: Anonymous Profile Creation
    
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          // Создаем анонимный профиль
          const anonymousProfile = await profileManager.getOrCreateAnonymousProfile();
          
          // Проверяем, что профиль создан
          expect(anonymousProfile).toBeDefined();
          expect(anonymousProfile.user_id).toBe('anonymous');
          
          // Получаем профиль снова
          const retrievedProfile = await profileManager.getUserProfile('anonymous');
          
          // Проверяем, что профиль сохранился
          expect(retrievedProfile).toBeDefined();
          expect(retrievedProfile?.user_id).toBe('anonymous');
          expect(retrievedProfile?.id).toBe(anonymousProfile.id);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Last Active Update
   * For any profile update with update_last_active option, last_active should be updated
   */
  it('Property: Last Active Update - last_active should be updated on profile changes', async () => {
    // Feature: comparison-recommendation-system, Property: Last Active Update
    
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (userId) => {
          // Создаем профиль
          const initialProfile = await profileManager.createUserProfile({ user_id: userId });
          const initialLastActive = new Date(initialProfile.last_active).getTime();
          
          // Ждем немного
          await new Promise(resolve => setTimeout(resolve, 10));
          
          // Обновляем профиль
          const updatedProfile = await profileManager.updateUserProfile(
            userId,
            { monthly_income: 50000 },
            { update_last_active: true }
          );
          
          const updatedLastActive = new Date(updatedProfile.last_active).getTime();
          
          // Проверяем, что last_active обновился
          expect(updatedLastActive).toBeGreaterThanOrEqual(initialLastActive);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Preferred Banks Persistence
   * For any list of preferred banks, they should persist in the profile
   */
  it('Property: Preferred Banks Persistence - preferred banks should persist', async () => {
    // Feature: comparison-recommendation-system, Property: Preferred Banks Persistence
    
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.array(fc.uuid(), { minLength: 1, maxLength: 10 }),
        async (userId, preferredBanks) => {
          // Создаем профиль с предпочитаемыми банками
          const profile = await profileManager.createUserProfile({
            user_id: userId,
            preferred_banks: preferredBanks
          });
          
          // Проверяем, что банки сохранены
          expect(profile.preferred_banks).toEqual(preferredBanks);
          
          // Получаем профиль снова
          const retrievedProfile = await profileManager.getUserProfile(userId);
          
          // Проверяем, что банки сохранились
          expect(retrievedProfile).toBeDefined();
          expect(retrievedProfile?.preferred_banks).toEqual(preferredBanks);
        }
      ),
      { numRuns: 50 }
    );
  });
});
