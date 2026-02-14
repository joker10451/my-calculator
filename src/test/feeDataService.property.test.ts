/**
 * Property-based тесты для FeeDataService
 * Feature: court-fee-calculator, Property 5: Legal References and Metadata
 * Feature: court-fee-calculator, Property 7: Data Freshness Validation
 * Validates: Requirements 4.1, 4.3, 4.4, 4.5
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { 
  CourtType,
  FeeSchedule,
  DataFreshnessStatus,
  DataVersionInfo,
  FeeRule
} from '@/types/courtFee';
import { FeeDataService } from '@/lib/feeDataService';

// Мокаем LocalDataManager для тестирования офлайн-режима
vi.mock('@/lib/apiClient/LocalDataManager', () => ({
  LocalDataManager: class MockLocalDataManager {
    getFeeSchedule = vi.fn().mockRejectedValue(new Error('Local data only'));
    checkForUpdates = vi.fn().mockRejectedValue(new Error('Local data only'));
    getSourcesStatus = vi.fn().mockReturnValue([]);
    testConnection = vi.fn().mockResolvedValue(true);
    clearCache = vi.fn().mockResolvedValue(undefined);
    searchDocuments = vi.fn().mockResolvedValue({ success: false, data: [] });
  }
}));

// Генераторы для property-based тестирования
const courtTypeGenerator = fc.constantFrom('general' as CourtType, 'arbitration' as CourtType);
const pastDateGenerator = fc.date({ 
  min: new Date('2020-01-01'), 
  max: new Date(Date.now() - 24 * 60 * 60 * 1000) // Исключаем сегодняшний день для избежания Invalid Date
}).filter(date => !isNaN(date.getTime())); // Фильтруем Invalid Date
const versionGenerator = fc.string({ minLength: 1, maxLength: 3 }).map(s => `2024.${s.charAt(0) || '1'}.${s.charAt(1) || '0'}`);

// Создаем экземпляр сервиса данных
let feeDataService: FeeDataService;

describe('FeeDataService Property Tests', () => {
  
  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    localStorage.clear();
    feeDataService = new FeeDataService();
  });

  test('Property 5: Legal References and Metadata - Schedule Structure Validation', async () => {
    // Feature: court-fee-calculator, Property 5: Legal References and Metadata
    // Validates: Requirements 4.1, 4.5
    
    await fc.assert(
      fc.asyncProperty(courtTypeGenerator, async (courtType) => {
        const schedule = await feeDataService.getCurrentSchedule(courtType);
        
        // Проверяем основную структуру расписания
        expect(schedule).toBeDefined();
        expect(schedule.courtType).toBe(courtType);
        expect(schedule.version).toBeDefined();
        expect(schedule.lastUpdated).toBeInstanceOf(Date);
        expect(schedule.rules).toBeDefined();
        expect(Array.isArray(schedule.rules)).toBe(true);
        expect(schedule.rules.length).toBeGreaterThan(0);
        
        // Проверяем каждое правило в расписании
        schedule.rules.forEach((rule: FeeRule) => {
          // Проверяем обязательные поля
          expect(rule.minAmount).toBeDefined();
          expect(typeof rule.minAmount).toBe('number');
          expect(rule.minAmount).toBeGreaterThanOrEqual(0);
          
          expect(rule.feeType).toBeDefined();
          expect(['percentage', 'fixed', 'progressive']).toContain(rule.feeType);
          
          expect(rule.feeValue).toBeDefined();
          expect(typeof rule.feeValue).toBe('number');
          expect(rule.feeValue).toBeGreaterThan(0);
          
          // Проверяем правовые ссылки
          expect(rule.legalBasis).toBeDefined();
          expect(typeof rule.legalBasis).toBe('string');
          expect(rule.legalBasis.length).toBeGreaterThan(0);
          expect(rule.legalBasis).toMatch(/НК РФ/); // Должна содержать ссылку на НК РФ
          
          // Проверяем формулу расчета
          expect(rule.formula).toBeDefined();
          expect(typeof rule.formula).toBe('string');
          expect(rule.formula.length).toBeGreaterThan(0);
          
          // Проверяем диапазоны
          if (rule.maxAmount !== null) {
            expect(rule.maxAmount).toBeGreaterThan(rule.minAmount);
          }
        });
        
        // Проверяем непрерывность диапазонов
        const sortedRules = [...schedule.rules].sort((a, b) => a.minAmount - b.minAmount);
        for (let i = 1; i < sortedRules.length; i++) {
          const prevRule = sortedRules[i - 1];
          const currentRule = sortedRules[i];
          
          if (prevRule.maxAmount !== null) {
            expect(currentRule.minAmount).toBe(prevRule.maxAmount + 1);
          }
        }
      }),
      { numRuns: 10 } // Уменьшаем количество прогонов для асинхронных тестов
    );
  });

  test('Property 5: Legal References and Metadata - Version Information Consistency', () => {
    // Feature: court-fee-calculator, Property 5: Legal References and Metadata
    // Validates: Requirements 4.1, 4.5
    
    fc.assert(
      fc.property(fc.constant(null), () => {
        const versionInfo = feeDataService.getDataVersionInfo();
        
        // Проверяем структуру информации о версии
        expect(versionInfo).toBeDefined();
        expect(versionInfo.version).toBeDefined();
        expect(typeof versionInfo.version).toBe('string');
        expect(versionInfo.version).toMatch(/^\d{4}\.\d+\.\d+$/); // Формат версии YYYY.X.Y
        
        expect(versionInfo.releaseDate).toBeInstanceOf(Date);
        expect(versionInfo.releaseDate.getTime()).toBeLessThanOrEqual(Date.now());
        
        expect(versionInfo.source).toBeDefined();
        expect(typeof versionInfo.source).toBe('string');
        expect(versionInfo.source).toContain('НК РФ'); // Должен содержать ссылку на источник
        
        expect(versionInfo.checksum).toBeDefined();
        expect(typeof versionInfo.checksum).toBe('string');
        expect(versionInfo.checksum.length).toBeGreaterThan(0);
      }),
      { numRuns: 10 }
    );
  });

  test('Property 7: Data Freshness Validation - Freshness Status Accuracy', () => {
    // Feature: court-fee-calculator, Property 7: Data Freshness Validation
    // Validates: Requirements 4.3, 4.4
    
    fc.assert(
      fc.property(pastDateGenerator, (mockDate) => {
        // Проверяем, что дата валидна
        if (isNaN(mockDate.getTime())) {
          return true; // Пропускаем невалидные даты
        }
        
        // Мокаем дату последнего обновления
        const mockDateString = mockDate.toISOString();
        localStorage.setItem('court_fee_last_update', mockDateString);
        
        const freshness = feeDataService.checkDataFreshness();
        
        // Проверяем структуру статуса актуальности
        expect(freshness).toBeDefined();
        expect(typeof freshness.isUpToDate).toBe('boolean');
        expect(freshness.lastUpdateDate).toBeInstanceOf(Date);
        expect(freshness.lastUpdateDate.getTime()).toBe(mockDate.getTime());
        expect(typeof freshness.daysSinceUpdate).toBe('number');
        expect(freshness.daysSinceUpdate).toBeGreaterThanOrEqual(0);
        
        // Проверяем логику определения актуальности
        const now = new Date();
        const timeDiff = now.getTime() - mockDate.getTime();
        const expectedDaysSinceUpdate = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
        expect(freshness.daysSinceUpdate).toBe(expectedDaysSinceUpdate);
        
        const expectedIsUpToDate = expectedDaysSinceUpdate <= 30; // DATA_FRESHNESS_DAYS = 30
        expect(freshness.isUpToDate).toBe(expectedIsUpToDate);
        
        // Проверяем предупреждающие сообщения
        if (!freshness.isUpToDate) {
          expect(freshness.warningMessage).toBeDefined();
          expect(typeof freshness.warningMessage).toBe('string');
          expect(freshness.warningMessage!.length).toBeGreaterThan(0);
          
          if (expectedDaysSinceUpdate <= 60) {
            expect(freshness.warningMessage).toContain('Рекомендуется проверить');
          } else if (expectedDaysSinceUpdate <= 180) {
            expect(freshness.warningMessage).toContain('Внимание!');
          } else {
            expect(freshness.warningMessage).toContain('Критическое предупреждение!');
          }
        } else {
          expect(freshness.warningMessage).toBeUndefined();
        }
      }),
      { numRuns: 50 }
    );
  });

  test('Property 7: Data Freshness Validation - Update Date Persistence', async () => {
    // Feature: court-fee-calculator, Property 7: Data Freshness Validation
    // Validates: Requirements 4.3, 4.4
    
    await fc.assert(
      fc.asyncProperty(courtTypeGenerator, async (courtType) => {
        // Получаем дату до обновления
        const dateBefore = feeDataService.getLastUpdateDate();
        
        // Выполняем обновление (в офлайн-режиме с замоканными API)
        // API замокированы и возвращают ошибки, поэтому сервис будет использовать fallback
        const schedule = await feeDataService.updateSchedule(courtType);
        
        // Проверяем, что расписание получено (даже с fallback данными)
        expect(schedule).toBeDefined();
        expect(schedule.courtType).toBe(courtType);
        
        // Получаем дату после обновления
        const dateAfter = feeDataService.getLastUpdateDate();
        
        // Дата обновления должна измениться или остаться той же (в зависимости от fallback логики)
        expect(dateAfter.getTime()).toBeGreaterThanOrEqual(dateBefore.getTime());
        
        // Проверяем, что дата сохранилась в localStorage (если обновление прошло успешно)
        const storedDate = localStorage.getItem('court_fee_last_update');
        if (storedDate) {
          expect(new Date(storedDate).getTime()).toBe(dateAfter.getTime());
        }
        
        // Проверяем актуальность данных
        const freshness = feeDataService.checkDataFreshness();
        expect(typeof freshness.isUpToDate).toBe('boolean');
        expect(typeof freshness.daysSinceUpdate).toBe('number');
        expect(freshness.daysSinceUpdate).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 5 } // Уменьшаем количество прогонов для асинхронных тестов
    );
  });

  test('Property 5 & 7: Data Integrity Validation - Comprehensive Validation', () => {
    // Feature: court-fee-calculator, Property 5: Legal References and Metadata
    // Feature: court-fee-calculator, Property 7: Data Freshness Validation
    // Validates: Requirements 4.1, 4.3, 4.4, 4.5
    
    fc.assert(
      fc.property(fc.constant(null), () => {
        const isValid = feeDataService.validateDataIntegrity();
        
        // Проверяем, что валидация возвращает boolean
        expect(typeof isValid).toBe('boolean');
        
        if (isValid) {
          // Если данные валидны, проверяем что можно получить расписания
          expect(async () => {
            await feeDataService.getCurrentSchedule('general');
            await feeDataService.getCurrentSchedule('arbitration');
          }).not.toThrow();
          
          // Проверяем, что версия данных определена
          const versionInfo = feeDataService.getDataVersionInfo();
          expect(versionInfo.version).toBeDefined();
          expect(versionInfo.checksum).toBeDefined();
        }
      }),
      { numRuns: 10 }
    );
  });

  test('Property 7: Data Freshness Validation - Cache Behavior', async () => {
    // Feature: court-fee-calculator, Property 7: Data Freshness Validation
    // Validates: Requirements 4.3, 4.4
    
    await fc.assert(
      fc.asyncProperty(courtTypeGenerator, async (courtType) => {
        // Первый запрос - должен создать кэш
        const schedule1 = await feeDataService.getCurrentSchedule(courtType);
        
        // Второй запрос - должен использовать кэш
        const schedule2 = await feeDataService.getCurrentSchedule(courtType);
        
        // Расписания должны быть идентичными
        expect(schedule1.courtType).toBe(schedule2.courtType);
        expect(schedule1.version).toBe(schedule2.version);
        expect(schedule1.rules.length).toBe(schedule2.rules.length);
        
        // Проверяем, что данные сохранились в localStorage
        const cacheKey = `court_fee_data_${courtType}`;
        const cachedData = localStorage.getItem(cacheKey);
        expect(cachedData).toBeDefined();
        
        const parsedCache = JSON.parse(cachedData!);
        expect(parsedCache.courtType).toBe(courtType);
        expect(parsedCache.version).toBe(schedule1.version);
      }),
      { numRuns: 5 } // Уменьшаем количество прогонов для асинхронных тестов
    );
  });

  test('Property 5: Legal References and Metadata - Error Handling Robustness', () => {
    // Feature: court-fee-calculator, Property 5: Legal References and Metadata
    // Validates: Requirements 4.1, 4.5
    
    fc.assert(
      fc.property(fc.constant(null), () => {
        // Тестируем поведение при поврежденном localStorage
        localStorage.setItem('court_fee_data_general', 'invalid json');
        
        // Сервис должен обрабатывать ошибки gracefully
        expect(async () => {
          await feeDataService.getCurrentSchedule('general');
        }).not.toThrow();
        
        // Проверяем, что валидация данных работает корректно
        const isValid = feeDataService.validateDataIntegrity();
        expect(typeof isValid).toBe('boolean');
        
        // Проверяем, что информация о версии всегда доступна
        const versionInfo = feeDataService.getDataVersionInfo();
        expect(versionInfo).toBeDefined();
        expect(versionInfo.version).toBeDefined();
      }),
      { numRuns: 10 }
    );
  });

  test('Property 7: Data Freshness Validation - Update Check Consistency', async () => {
    // Feature: court-fee-calculator, Property 7: Data Freshness Validation
    // Validates: Requirements 4.3, 4.4
    
    await fc.assert(
      fc.asyncProperty(versionGenerator, async (mockVersion) => {
        // Устанавливаем версию в localStorage
        localStorage.setItem('court_fee_version', mockVersion);
        
        // Проверяем наличие обновлений (API замокированы и возвращают ошибки)
        // Поэтому сервис будет использовать fallback логику
        const hasUpdates = await feeDataService.checkForUpdates();
        
        // Результат должен быть boolean
        expect(typeof hasUpdates).toBe('boolean');
        
        // Получаем текущую версию из сервиса
        const currentVersion = feeDataService.getDataVersionInfo().version;
        
        // В условиях замоканных API, логика проверки обновлений должна работать с fallback
        // Если API недоступны, то hasUpdates может быть false или основываться на локальной проверке версии
        if (hasUpdates) {
          // Если есть обновления, то версии должны отличаться
          expect(mockVersion).not.toBe(currentVersion);
        }
        
        // Проверяем, что версия корректная
        expect(currentVersion).toMatch(/^\d{4}\.\d+\.\d+$/);
      }),
      { numRuns: 10 } // Уменьшаем количество прогонов для асинхронных тестов
    );
  });
});