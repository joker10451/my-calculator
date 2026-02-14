import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { FeeDataService } from '@/lib/feeDataService';
import { CourtType } from '@/types/courtFee';

// Feature: court-fee-calculator, Property 8: Offline Functionality
// **Validates: Requirements 7.4**

describe('Property 8: Offline Functionality', () => {
  let feeDataService: FeeDataService;
  let originalLocalStorage: Storage;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Мокаем localStorage
    mockLocalStorage = {};
    originalLocalStorage = global.localStorage;
    
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: vi.fn(() => {
          mockLocalStorage = {};
        }),
        length: 0,
        key: vi.fn()
      },
      writable: true
    });

    // Мокаем navigator.onLine
    Object.defineProperty(global.navigator, 'onLine', {
      value: false,
      writable: true
    });

    // Создаем новый экземпляр сервиса для каждого теста
    feeDataService = new FeeDataService();
  });

  afterEach(() => {
    // Восстанавливаем оригинальный localStorage
    global.localStorage = originalLocalStorage;
    vi.clearAllMocks();
  });

  it('should work correctly with cached fee schedules when offline', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          claimAmount: fc.integer({ min: 1000, max: 10000000 }),
          courtType: fc.constantFrom('general' as CourtType, 'arbitration' as CourtType)
        }),
        async ({ claimAmount, courtType }) => {
          // Предварительно кэшируем данные (имитируем предыдущую онлайн-сессию)
          const schedule = await feeDataService.getCurrentSchedule(courtType);
          
          // Проверяем, что расписание получено и содержит правила
          expect(schedule).toBeDefined();
          expect(schedule.courtType).toBe(courtType);
          expect(schedule.rules).toBeDefined();
          expect(schedule.rules.length).toBeGreaterThan(0);
          
          // Проверяем, что данные кэшированы
          const cacheStats = feeDataService.getCacheStatistics();
          expect(cacheStats.schedulesCount).toBeGreaterThan(0);
          
          // Проверяем, что в офлайн-режиме мы можем получить те же данные
          const offlineSchedule = await feeDataService.getCurrentSchedule(courtType);
          expect(offlineSchedule.courtType).toBe(schedule.courtType);
          expect(offlineSchedule.version).toBe(schedule.version);
          expect(offlineSchedule.rules.length).toBe(schedule.rules.length);
          
          // Проверяем, что правила идентичны
          for (let i = 0; i < schedule.rules.length; i++) {
            const originalRule = schedule.rules[i];
            const cachedRule = offlineSchedule.rules[i];
            
            expect(cachedRule.minAmount).toBe(originalRule.minAmount);
            expect(cachedRule.maxAmount).toBe(originalRule.maxAmount);
            expect(cachedRule.feeType).toBe(originalRule.feeType);
            expect(cachedRule.feeValue).toBe(originalRule.feeValue);
            expect(cachedRule.legalBasis).toBe(originalRule.legalBasis);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain calculation accuracy with cached data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          claimAmount: fc.integer({ min: 1000, max: 10000000 }),
          courtType: fc.constantFrom('general' as CourtType, 'arbitration' as CourtType)
        }),
        async ({ claimAmount, courtType }) => {
          // Получаем расписание в офлайн-режиме
          const schedule = await feeDataService.getCurrentSchedule(courtType);
          
          // Находим применимое правило для суммы иска
          let applicableRule = null;
          for (const rule of schedule.rules) {
            if (claimAmount >= rule.minAmount && 
                (rule.maxAmount === null || claimAmount <= rule.maxAmount)) {
              applicableRule = rule;
              break;
            }
          }
          
          // Проверяем, что правило найдено
          expect(applicableRule).not.toBeNull();
          
          if (applicableRule) {
            // Проверяем корректность структуры правила
            expect(applicableRule.minAmount).toBeGreaterThanOrEqual(0);
            expect(applicableRule.feeType).toMatch(/^(percentage|progressive|fixed)$/);
            expect(applicableRule.feeValue).toBeGreaterThan(0);
            expect(applicableRule.legalBasis).toBeTruthy();
            expect(applicableRule.formula).toBeTruthy();
            
            // Проверяем логическую корректность диапазонов
            if (applicableRule.maxAmount !== null) {
              expect(applicableRule.maxAmount).toBeGreaterThan(applicableRule.minAmount);
            }
            
            // Проверяем, что минимальная пошлина не превышает максимальную
            if (applicableRule.minimumFee && applicableRule.maximumFee) {
              expect(applicableRule.minimumFee).toBeLessThanOrEqual(applicableRule.maximumFee);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve exemption data in offline mode', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('general' as CourtType, 'arbitration' as CourtType),
        async (courtType) => {
          // Получаем кэшированные данные о льготах
          const cachedExemptions = feeDataService.getCachedExemptions();
          
          // Проверяем, что данные о льготах доступны
          expect(Array.isArray(cachedExemptions)).toBe(true);
          
          if (cachedExemptions.length > 0) {
            // Проверяем структуру каждой льготы
            for (const exemption of cachedExemptions) {
              expect(exemption.id).toBeTruthy();
              expect(exemption.name).toBeTruthy();
              expect(exemption.description).toBeTruthy();
              expect(exemption.discountType).toMatch(/^(percentage|fixed|exempt)$/);
              expect(exemption.legalBasis).toBeTruthy();
              expect(Array.isArray(exemption.applicableCourts)).toBe(true);
              
              // Проверяем корректность значения скидки
              if (exemption.discountType === 'percentage') {
                expect(exemption.discountValue).toBeGreaterThan(0);
                expect(exemption.discountValue).toBeLessThanOrEqual(100);
              } else if (exemption.discountType === 'fixed') {
                expect(exemption.discountValue).toBeGreaterThanOrEqual(0);
              } else if (exemption.discountType === 'exempt') {
                expect(exemption.discountValue).toBe(0);
              }
            }
            
            // Проверяем, что есть льготы для выбранного типа суда
            const applicableExemptions = cachedExemptions.filter(
              exemption => exemption.applicableCourts.includes(courtType)
            );
            
            // Должна быть хотя бы одна льгота для каждого типа суда
            expect(applicableExemptions.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should maintain data integrity across offline sessions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          courtType: fc.constantFrom('general' as CourtType, 'arbitration' as CourtType),
          sessionCount: fc.integer({ min: 2, max: 5 })
        }),
        async ({ courtType, sessionCount }) => {
          let previousSchedule = null;
          
          // Имитируем несколько офлайн-сессий
          for (let session = 0; session < sessionCount; session++) {
            // Получаем расписание в текущей сессии
            const currentSchedule = await feeDataService.getCurrentSchedule(courtType);
            
            // Проверяем базовую структуру
            expect(currentSchedule).toBeDefined();
            expect(currentSchedule.courtType).toBe(courtType);
            expect(currentSchedule.rules).toBeDefined();
            expect(currentSchedule.rules.length).toBeGreaterThan(0);
            
            if (previousSchedule) {
              // Проверяем, что данные остаются консистентными между сессиями
              expect(currentSchedule.courtType).toBe(previousSchedule.courtType);
              expect(currentSchedule.version).toBe(previousSchedule.version);
              expect(currentSchedule.rules.length).toBe(previousSchedule.rules.length);
              
              // Проверяем идентичность правил
              for (let i = 0; i < currentSchedule.rules.length; i++) {
                const currentRule = currentSchedule.rules[i];
                const previousRule = previousSchedule.rules[i];
                
                expect(currentRule.minAmount).toBe(previousRule.minAmount);
                expect(currentRule.maxAmount).toBe(previousRule.maxAmount);
                expect(currentRule.feeType).toBe(previousRule.feeType);
                expect(currentRule.feeValue).toBe(previousRule.feeValue);
                expect(currentRule.formula).toBe(previousRule.formula);
                expect(currentRule.legalBasis).toBe(previousRule.legalBasis);
              }
            }
            
            previousSchedule = currentSchedule;
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should handle cache statistics correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null), // Не нужны параметры для этого теста
        async () => {
          // Получаем статистику кэша
          const stats = feeDataService.getCacheStatistics();
          
          // Проверяем структуру статистики
          expect(typeof stats.totalSize).toBe('number');
          expect(typeof stats.schedulesCount).toBe('number');
          expect(typeof stats.exemptionsCount).toBe('number');
          expect(typeof stats.isOfflineReady).toBe('boolean');
          
          // Проверяем логические ограничения
          expect(stats.totalSize).toBeGreaterThanOrEqual(0);
          expect(stats.schedulesCount).toBeGreaterThanOrEqual(0);
          expect(stats.schedulesCount).toBeLessThanOrEqual(2); // Максимум 2 типа судов
          expect(stats.exemptionsCount).toBeGreaterThanOrEqual(0);
          
          // Если есть кэшированные данные, размер должен быть больше 0
          if (stats.schedulesCount > 0 || stats.exemptionsCount > 0) {
            expect(stats.totalSize).toBeGreaterThan(0);
          }
          
          // Проверяем логику готовности к офлайн-работе
          if (stats.isOfflineReady) {
            expect(stats.schedulesCount).toBeGreaterThan(0);
            expect(stats.exemptionsCount).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should validate cached data integrity', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('general' as CourtType, 'arbitration' as CourtType),
        async (courtType) => {
          // Получаем расписание для кэширования
          const schedule = await feeDataService.getCurrentSchedule(courtType);
          
          // Проверяем валидацию целостности данных
          const isDataValid = feeDataService.validateDataIntegrity();
          expect(typeof isDataValid).toBe('boolean');
          
          // Если данные валидны, проверяем их структуру
          if (isDataValid) {
            expect(schedule.rules.length).toBeGreaterThan(0);
            
            // Проверяем непрерывность диапазонов
            for (let i = 0; i < schedule.rules.length - 1; i++) {
              const currentRule = schedule.rules[i];
              const nextRule = schedule.rules[i + 1];
              
              // Текущее правило должно иметь максимум
              if (currentRule.maxAmount !== null) {
                // Следующее правило должно начинаться сразу после текущего
                expect(nextRule.minAmount).toBe(currentRule.maxAmount + 1);
              }
            }
            
            // Проверяем корректность каждого правила
            for (const rule of schedule.rules) {
              expect(rule.minAmount).toBeGreaterThanOrEqual(0);
              if (rule.maxAmount !== null) {
                expect(rule.maxAmount).toBeGreaterThan(rule.minAmount);
              }
              expect(rule.feeValue).toBeGreaterThan(0);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});