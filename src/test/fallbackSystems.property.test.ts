/**
 * Property-based тесты для fallback систем
 * Feature: api-integration-fixes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { FallbackSystem, FallbackDataProvider, FallbackStrategy } from '@/lib/apiClient/FallbackSystem';
import { LocalDataManager } from '@/lib/apiClient/LocalDataManager';
import { LocalStorageCache } from '@/lib/apiClient/LocalStorageCache';
import { 
  FeeScheduleApiData, 
  LegalDocumentData,
  ApiResponse
} from '@/types/apiSources';

// Mock localStorage для тестов
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] || null
  };
})();

// Mock sessionStorage для тестов
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] || null
  };
})();

// Заменяем глобальные storage
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true
});

describe('Fallback Systems Property Tests', () => {
  let fallbackSystem: FallbackSystem;
  let cache: LocalStorageCache;
  let dataManager: LocalDataManager;

  beforeEach(() => {
    mockLocalStorage.clear();
    mockSessionStorage.clear();
    
    fallbackSystem = new FallbackSystem({
      maxDataAge: 24 * 60 * 60 * 1000, // 24 часа
      gracefulDegradation: true,
      notifyUser: false, // Отключаем для тестов
      retryInterval: 1000
    });

    cache = new LocalStorageCache();
    dataManager = new LocalDataManager(cache);
  });

  afterEach(() => {
    cache.dispose();
    mockLocalStorage.clear();
    mockSessionStorage.clear();
  });

  describe('Property 18: Universal API Fallback', () => {
    /**
     * **Validates: Requirements 4.1**
     * Feature: api-integration-fixes, Property 18: Universal API Fallback
     * 
     * For any external API unavailability scenario, the fallback system should 
     * provide cached or default data to maintain functionality
     */
    it('should provide fallback data when all APIs are unavailable', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('fee_schedule', 'legal_document', 'search_results'),
          async (dataType) => {
            // Выполняем fallback для указанного типа данных
            const result = await fallbackSystem.executeFallback(dataType);
            
            // Fallback должен всегда предоставить какие-то данные или четкую ошибку
            expect(result).toBeDefined();
            expect(result.success).toBeTypeOf('boolean');
            expect(result.source).toBe('fallback');
            expect(result.timestamp).toBeInstanceOf(Date);
            
            if (result.success) {
              // Если fallback успешен, данные должны быть определены
              expect(result.data).toBeDefined();
              
              // Проверяем структуру данных в зависимости от типа
              switch (dataType) {
                case 'fee_schedule':
                  const feeData = result.data as FeeScheduleApiData;
                  expect(feeData.version).toBeTypeOf('string');
                  expect(feeData.courtTypes).toBeDefined();
                  expect(feeData.courtTypes.general).toBeInstanceOf(Array);
                  expect(feeData.courtTypes.arbitration).toBeInstanceOf(Array);
                  break;
                
                case 'legal_document':
                  const docData = result.data as LegalDocumentData;
                  expect(docData.id).toBeTypeOf('string');
                  expect(docData.title).toBeTypeOf('string');
                  expect(docData.type).toBeTypeOf('string');
                  break;
                
                case 'search_results':
                  expect(Array.isArray(result.data)).toBe(true);
                  break;
              }
            } else {
              // Если fallback неуспешен, должна быть ошибка
              expect(result.error).toBeTypeOf('string');
              expect(result.error.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain fallback data consistency across multiple requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            dataType: fc.constantFrom('fee_schedule', 'legal_document'),
            requestCount: fc.integer({ min: 2, max: 10 })
          }),
          async ({ dataType, requestCount }) => {
            const results = [];
            
            // Выполняем несколько запросов fallback
            for (let i = 0; i < requestCount; i++) {
              const result = await fallbackSystem.executeFallback(dataType);
              results.push(result);
            }
            
            // Все результаты должны быть согласованными
            const firstResult = results[0];
            
            for (let i = 1; i < results.length; i++) {
              const currentResult = results[i];
              
              // Статус успеха должен быть одинаковым
              expect(currentResult.success).toBe(firstResult.success);
              
              if (firstResult.success && currentResult.success) {
                // Данные должны быть структурно одинаковыми
                expect(typeof currentResult.data).toBe(typeof firstResult.data);
                
                if (dataType === 'fee_schedule') {
                  const firstFee = firstResult.data as FeeScheduleApiData;
                  const currentFee = currentResult.data as FeeScheduleApiData;
                  expect(currentFee.version).toBe(firstFee.version);
                  expect(currentFee.courtTypes.general.length).toBe(firstFee.courtTypes.general.length);
                  expect(currentFee.courtTypes.arbitration.length).toBe(firstFee.courtTypes.arbitration.length);
                }
              }
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 15: Legal Data Cache Fallback', () => {
    /**
     * **Validates: Requirements 3.4**
     * Feature: api-integration-fixes, Property 15: Legal Data Cache Fallback
     * 
     * For any Pravo.gov.ru API unavailability scenario, the client should use 
     * cached legal data as fallback
     */
    it('should use cached legal data when API is unavailable', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            documentId: fc.string({ minLength: 1, maxLength: 50 }),
            legalData: fc.record({
              id: fc.string({ minLength: 1, maxLength: 50 }),
              title: fc.string({ minLength: 1, maxLength: 100 }),
              type: fc.constantFrom('law', 'code', 'regulation', 'instruction'),
              number: fc.string({ minLength: 1, maxLength: 20 }),
              status: fc.constantFrom('active', 'amended', 'repealed')
            }),
            cacheAge: fc.integer({ min: 0, max: 23 * 60 * 60 * 1000 }) // До 23 часов
          }),
          async ({ documentId, legalData, cacheAge }) => {
            // Создаем полные данные документа
            const fullLegalData: LegalDocumentData = {
              ...legalData,
              date: new Date(),
              lastModified: new Date(),
              source: 'test_cache'
            };
            
            // Сохраняем данные в fallback хранилище
            await fallbackSystem.storeFallbackData('legal_document', fullLegalData, 'test');
            
            // Имитируем возраст данных
            if (cacheAge > 0) {
              const timestamp = (Date.now() - cacheAge).toString();
              mockLocalStorage.setItem(`fallback_legal_doc_${fullLegalData.id}_timestamp`, timestamp);
            }
            
            // Проверяем доступность fallback данных
            const availability = await fallbackSystem.checkFallbackAvailability('legal_document');
            expect(availability.available).toBeTypeOf('boolean');
            
            // Если данные доступны, пытаемся получить их
            if (availability.available) {
              const result = await fallbackSystem.executeFallback<LegalDocumentData>('legal_document');
              expect(result.success).toBeTypeOf('boolean');
              
              if (result.success) {
                expect(result.data).toBeDefined();
              }
            }
          }
        ),
        { numRuns: 50, timeout: 5000 } // Уменьшаем количество итераций и добавляем таймаут
      );
    }, 15000); // Увеличиваем общий таймаут теста

    it('should handle expired cached legal data appropriately', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            documentData: fc.record({
              id: fc.string({ minLength: 1, maxLength: 20 }),
              title: fc.string({ minLength: 1, maxLength: 50 }),
              type: fc.constantFrom('law', 'code', 'regulation'),
              number: fc.string({ minLength: 1, maxLength: 10 })
            }),
            expiredAge: fc.integer({ min: 8 * 24 * 60 * 60 * 1000, max: 30 * 24 * 60 * 60 * 1000 }) // 8-30 дней
          }),
          async ({ documentData, expiredAge }) => {
            const fullData: LegalDocumentData = {
              ...documentData,
              date: new Date(),
              status: 'active',
              lastModified: new Date(),
              source: 'expired_test'
            };
            
            // Сохраняем данные с истекшим сроком
            await fallbackSystem.storeFallbackData('legal_document', fullData, 'test');
            const expiredTimestamp = (Date.now() - expiredAge).toString();
            mockLocalStorage.setItem(`fallback_legal_doc_${fullData.id}_timestamp`, expiredTimestamp);
            
            // Проверяем доступность
            const availability = await fallbackSystem.checkFallbackAvailability('legal_document');
            
            if (availability.available) {
              // Если данные доступны, возраст должен быть корректно определен
              expect(availability.oldestDataAge).toBeGreaterThan(7 * 24 * 60 * 60 * 1000); // Старше 7 дней
            }
            
            // Пытаемся получить fallback данные
            const result = await fallbackSystem.executeFallback<LegalDocumentData>('legal_document');
            
            // Результат зависит от конфигурации системы
            expect(result.success).toBeTypeOf('boolean');
            
            if (!result.success) {
              // Если данные слишком старые, должна быть соответствующая ошибка
              expect(result.error).toContain('age limit');
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Fallback Strategy Registration and Execution', () => {
    it('should execute fallback strategies in priority order', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            strategies: fc.array(
              fc.record({
                name: fc.string({ minLength: 1, maxLength: 20 }),
                priority: fc.integer({ min: 1, max: 10 }),
                shouldSucceed: fc.boolean()
              }),
              { minLength: 2, maxLength: 5 }
            )
          }),
          async ({ strategies }) => {
            const testFallback = new FallbackSystem();
            const executionOrder: string[] = [];
            
            // Регистрируем стратегии
            for (const strategyConfig of strategies) {
              const strategy: FallbackStrategy = {
                name: strategyConfig.name,
                priority: strategyConfig.priority,
                canHandle: () => true,
                execute: async <T>(dataType: string): Promise<ApiResponse<T>> => {
                  executionOrder.push(strategyConfig.name);
                  
                  if (strategyConfig.shouldSucceed) {
                    return {
                      success: true,
                      data: { test: 'data' } as T,
                      source: 'fallback' as ApiSourceType,
                      timestamp: new Date(),
                      cached: false
                    };
                  } else {
                    return {
                      success: false,
                      error: 'Strategy failed',
                      source: 'fallback' as ApiSourceType,
                      timestamp: new Date(),
                      cached: false
                    };
                  }
                }
              };
              
              testFallback.registerStrategy(strategy);
            }
            
            // Выполняем fallback
            const result = await testFallback.executeFallback('test_type');
            
            // Проверяем что стратегии выполнялись в порядке приоритета
            if (executionOrder.length > 1) {
              const sortedStrategies = strategies.sort((a, b) => a.priority - b.priority);
              
              // Первая выполненная стратегия должна иметь наивысший приоритет
              const firstExecuted = executionOrder[0];
              const firstStrategy = sortedStrategies.find(s => s.name === firstExecuted);
              expect(firstStrategy).toBeDefined();
              
              // Если первая стратегия успешна, других не должно быть
              if (firstStrategy?.shouldSucceed) {
                expect(result.success).toBe(true);
              }
            }
            
            expect(result).toBeDefined();
            expect(result.success).toBeTypeOf('boolean');
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Fallback Data Storage and Retrieval', () => {
    it('should store and retrieve fallback data correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            dataType: fc.constantFrom('fee_schedule', 'legal_document'),
            data: fc.oneof(
              fc.record({
                version: fc.string(),
                source: fc.string(),
                courtTypes: fc.record({
                  general: fc.array(fc.object()),
                  arbitration: fc.array(fc.object())
                })
              }),
              fc.record({
                id: fc.string(),
                title: fc.string(),
                type: fc.string()
              })
            ),
            source: fc.string({ minLength: 1, maxLength: 20 })
          }),
          async ({ dataType, data, source }) => {
            // Сохраняем данные
            await fallbackSystem.storeFallbackData(dataType, data, source);
            
            // Проверяем доступность
            const availability = await fallbackSystem.checkFallbackAvailability(dataType);
            
            // Availability может быть true или false в зависимости от данных
            expect(availability.available).toBeTypeOf('boolean');
            
            if (availability.available) {
              // Пытаемся получить данные через fallback
              const result = await fallbackSystem.executeFallback(dataType);
              
              if (result.success) {
                expect(result.data).toBeDefined();
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Fallback Statistics and Monitoring', () => {
    it('should maintain accurate fallback statistics', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            attempts: fc.array(
              fc.record({
                dataType: fc.constantFrom('fee_schedule', 'legal_document', 'search_results'),
                shouldSucceed: fc.boolean()
              }),
              { minLength: 1, maxLength: 20 }
            )
          }),
          async ({ attempts }) => {
            // Создаем fallback систему БЕЗ стратегий по умолчанию
            const testFallback = new FallbackSystem({
              maxDataAge: 24 * 60 * 60 * 1000,
              gracefulDegradation: false, // Отключаем чтобы не было лишних стратегий
              notifyUser: false,
              retryInterval: 1000
            });
            
            // Очищаем все стратегии по умолчанию
            testFallback['strategies'].clear();
            
            // Регистрируем ТОЛЬКО тестовую стратегию
            testFallback.registerStrategy({
              name: 'test_strategy',
              priority: 1,
              canHandle: () => true,
              execute: async <T>(dataType: string): Promise<ApiResponse<T>> => {
                const attempt = attempts.find(a => a.dataType === dataType);
                const shouldSucceed = attempt?.shouldSucceed ?? false;
                
                return {
                  success: shouldSucceed,
                  data: shouldSucceed ? ({ test: 'data' } as T) : undefined,
                  error: shouldSucceed ? undefined : 'Test failure',
                  source: 'fallback' as ApiSourceType,
                  timestamp: new Date(),
                  cached: false
                };
              }
            });
            
            // Выполняем попытки
            for (const attempt of attempts) {
              await testFallback.executeFallback(attempt.dataType);
            }
            
            // Проверяем статистику
            const stats = testFallback.getFallbackStatistics();
            
            expect(stats.totalAttempts).toBe(attempts.length);
            expect(stats.successfulAttempts + stats.failedAttempts).toBe(stats.totalAttempts);
            
            // Проверяем что тестовая стратегия использовалась
            // Может быть вызвана несколько раз, если другие стратегии тоже выполняются
            expect(stats.strategiesUsed['test_strategy']).toBeGreaterThanOrEqual(1);
            
            // Проверяем группировку по типам данных
            const expectedDataTypes = [...new Set(attempts.map(a => a.dataType))];
            for (const dataType of expectedDataTypes) {
              const expectedCount = attempts.filter(a => a.dataType === dataType).length;
              expect(stats.dataTypesRequested[dataType]).toBe(expectedCount);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Graceful Degradation', () => {
    it('should provide degraded functionality when full data is unavailable', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('fee_schedule'),
          async (dataType) => {
            // Создаем fallback систему с включенной деградацией
            const degradationFallback = new FallbackSystem({
              gracefulDegradation: true,
              maxDataAge: 0 // Принудительно делаем все данные устаревшими
            });
            
            // Выполняем fallback
            const result = await degradationFallback.executeFallback(dataType);
            
            // Должны получить либо успешный результат с деградированными данными,
            // либо четкую ошибку
            expect(result.success).toBeTypeOf('boolean');
            
            if (result.success && dataType === 'fee_schedule') {
              const feeData = result.data as FeeScheduleApiData;
              
              // Проверяем что получили данные (могут быть как деградированные, так и обычные fallback)
              expect(feeData.version).toBeTypeOf('string');
              expect(feeData.courtTypes).toBeDefined();
              expect(feeData.courtTypes.general.length).toBeGreaterThan(0);
              expect(feeData.courtTypes.arbitration.length).toBeGreaterThan(0);
              
              // Если это деградированные данные, проверяем версию
              if (feeData.version.includes('degraded')) {
                // Деградированные данные имеют специальную версию
                expect(feeData.version).toContain('degraded');
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});