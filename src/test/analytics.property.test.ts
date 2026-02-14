import { describe, test, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import {
  trackPageView,
  trackReadingTime,
  trackScrollDepth,
  trackCalculatorClick,
  trackSearchQuery,
  trackCompletion,
  getArticleMetrics,
  getAllEvents,
  getSessionId,
  initAnalytics,
  clearAllEvents,
  type AnalyticsEvent,
  type AnalyticsEventType
} from '@/services/analyticsService';

// Mock localStorage и sessionStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  } as Response)
);

describe('Property Tests: Blog Analytics', () => {
  beforeEach(() => {
    // Очищаем хранилища перед каждым тестом
    localStorageMock.clear();
    sessionStorageMock.clear();
    
    // Очищаем все события
    clearAllEvents();
  });

  /**
   * Property 22: Analytics Event Recording
   * Для любого пользовательского взаимодействия (page view, scroll, click),
   * аналитическое событие должно быть записано с корректным типом и timestamp
   * 
   * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
   * Feature: blog-development, Property 22: Analytics Event Recording
   */
  test('Property 22: All analytics events are recorded with correct type and timestamp', () => {
    fc.assert(
      fc.property(
        fc.uuid(), // articleId
        fc.integer({ min: 1, max: 3600 }), // duration in seconds
        fc.integer({ min: 0, max: 100 }), // scroll depth percentage
        fc.uuid(), // calculatorId
        fc.string({ minLength: 3, maxLength: 50 }), // search query
        fc.integer({ min: 0, max: 20 }), // results count
        (articleId, duration, scrollDepth, calculatorId, searchQuery, resultsCount) => {
          // Очищаем события и sessionStorage перед каждым запуском property
          clearAllEvents();
          sessionStorageMock.clear();

          const beforeTimestamp = Date.now();

          // Тестируем trackPageView
          trackPageView(articleId);
          let allEvents = getAllEvents();
          const pageViewEvents = allEvents.filter(
            e => e.type === 'page_view' && e.articleId === articleId
          );
          expect(pageViewEvents.length).toBeGreaterThan(0);
          expect(pageViewEvents[0].timestamp).toBeInstanceOf(Date);
          expect(pageViewEvents[0].sessionId).toBeTruthy();

          // Тестируем trackReadingTime
          trackReadingTime(articleId, duration);
          allEvents = getAllEvents();
          const readingTimeEvents = allEvents.filter(
            e => e.type === 'reading_time' && e.articleId === articleId
          );
          expect(readingTimeEvents.length).toBeGreaterThan(0);
          expect(readingTimeEvents[0].data.duration).toBe(duration);
          expect(readingTimeEvents[0].timestamp).toBeInstanceOf(Date);

          // Тестируем trackScrollDepth
          trackScrollDepth(articleId, scrollDepth);
          allEvents = getAllEvents();
          const scrollEvents = allEvents.filter(
            e => e.type === 'scroll_depth' && e.articleId === articleId
          );
          expect(scrollEvents.length).toBeGreaterThan(0);
          expect(scrollEvents[0].data.exactDepth).toBe(scrollDepth);
          expect(scrollEvents[0].timestamp).toBeInstanceOf(Date);

          // Тестируем trackCalculatorClick
          trackCalculatorClick(articleId, calculatorId);
          allEvents = getAllEvents();
          const calculatorEvents = allEvents.filter(
            e => e.type === 'calculator_click' && e.articleId === articleId
          );
          expect(calculatorEvents.length).toBeGreaterThan(0);
          expect(calculatorEvents[0].data.calculatorId).toBe(calculatorId);
          expect(calculatorEvents[0].timestamp).toBeInstanceOf(Date);

          // Тестируем trackSearchQuery
          trackSearchQuery(searchQuery, resultsCount);
          allEvents = getAllEvents();
          const searchEvents = allEvents.filter(
            e => e.type === 'search'
          );
          expect(searchEvents.length).toBeGreaterThan(0);
          expect(searchEvents[0].data.query).toBe(searchQuery);
          expect(searchEvents[0].data.resultsCount).toBe(resultsCount);
          expect(searchEvents[0].timestamp).toBeInstanceOf(Date);

          const afterTimestamp = Date.now();

          // Проверяем, что все timestamps находятся в разумном диапазоне
          allEvents.forEach(event => {
            expect(event.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTimestamp - 100);
            expect(event.timestamp.getTime()).toBeLessThanOrEqual(afterTimestamp + 100);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Дополнительный тест: проверка уникальности ID событий
   */
  test('All events have unique IDs', () => {
    fc.assert(
      fc.property(
        fc.array(fc.uuid(), { minLength: 5, maxLength: 20 }),
        (articleIds) => {
          // Генерируем множество событий
          articleIds.forEach(articleId => {
            trackPageView(articleId);
            trackReadingTime(articleId, 60);
            trackScrollDepth(articleId, 50);
          });

          const events = getAllEvents();
          const eventIds = events.map(e => e.id);
          const uniqueIds = new Set(eventIds);

          // Проверяем, что все ID уникальны
          expect(uniqueIds.size).toBe(eventIds.length);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Дополнительный тест: проверка sessionId
   */
  test('All events in same session have same sessionId', () => {
    fc.assert(
      fc.property(
        fc.array(fc.uuid(), { minLength: 3, maxLength: 10 }),
        (articleIds) => {
          // Очищаем для каждого property run
          clearAllEvents();
          sessionStorageMock.clear();

          // Генерируем события в одной сессии
          articleIds.forEach(articleId => {
            trackPageView(articleId);
            trackScrollDepth(articleId, 25);
          });

          const allEvents = getAllEvents();
          const sessionIds = allEvents.map(e => e.sessionId);
          const uniqueSessionIds = new Set(sessionIds);

          // Все события должны иметь один и тот же sessionId
          expect(uniqueSessionIds.size).toBe(1);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Дополнительный тест: проверка округления scroll depth
   */
  test('Scroll depth is rounded to nearest threshold (25%, 50%, 75%, 100%)', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.integer({ min: 0, max: 100 }),
        (articleId, depth) => {
          // Очищаем sessionStorage для каждого теста
          sessionStorageMock.clear();

          trackScrollDepth(articleId, depth);

          const scrollEvents = getAllEvents().filter(
            e => e.type === 'scroll_depth' && e.articleId === articleId
          );

          if (scrollEvents.length > 0) {
            const recordedDepth = scrollEvents[0].data.depth;
            const validThresholds = [25, 50, 75, 100];

            // Проверяем, что записанная глубина - один из валидных порогов
            expect(validThresholds).toContain(recordedDepth);

            // Проверяем, что это правильный порог для данной глубины
            if (depth <= 25) {
              expect(recordedDepth).toBe(25);
            } else if (depth <= 50) {
              expect(recordedDepth).toBe(50);
            } else if (depth <= 75) {
              expect(recordedDepth).toBe(75);
            } else {
              expect(recordedDepth).toBe(100);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Дополнительный тест: проверка метрик статьи
   */
  test('Article metrics are calculated correctly', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.integer({ min: 1, max: 10 }), // количество просмотров
        fc.array(fc.integer({ min: 10, max: 600 }), { minLength: 1, maxLength: 10 }), // reading times
        fc.integer({ min: 0, max: 5 }), // количество кликов на калькуляторы
        (articleId, viewCount, readingTimes, calculatorClickCount) => {
          // Очищаем события для каждого property run
          clearAllEvents();

          // Генерируем события
          for (let i = 0; i < viewCount; i++) {
            trackPageView(articleId);
          }

          readingTimes.forEach(time => {
            trackReadingTime(articleId, time);
          });

          for (let i = 0; i < calculatorClickCount; i++) {
            trackCalculatorClick(articleId, `calc-${i}`);
          }

          // Получаем метрики
          const metrics = getArticleMetrics(articleId);

          // Проверяем корректность метрик
          expect(metrics.pageViews).toBe(viewCount);
          expect(metrics.calculatorClicks).toBe(calculatorClickCount);

          // Проверяем среднее время чтения
          if (readingTimes.length > 0) {
            const expectedAverage = readingTimes.reduce((a, b) => a + b, 0) / readingTimes.length;
            expect(metrics.averageReadingTime).toBeCloseTo(expectedAverage, 1);
          } else {
            expect(metrics.averageReadingTime).toBe(0);
          }

          // Проверяем, что все метрики неотрицательны
          expect(metrics.pageViews).toBeGreaterThanOrEqual(0);
          expect(metrics.averageReadingTime).toBeGreaterThanOrEqual(0);
          expect(metrics.completionRate).toBeGreaterThanOrEqual(0);
          expect(metrics.calculatorClicks).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Дополнительный тест: проверка completion rate
   */
  test('Completion rate is calculated as percentage of page views', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.integer({ min: 1, max: 20 }), // page views
        fc.integer({ min: 0, max: 20 }), // completions
        (articleId, pageViews, completions) => {
          // Очищаем события для каждого property run
          clearAllEvents();
          sessionStorageMock.clear();

          // Генерируем page views (это создает reading sessions)
          for (let i = 0; i < pageViews; i++) {
            trackPageView(articleId);
          }

          // Генерируем completions (не больше чем page views)
          const actualCompletions = Math.min(completions, pageViews);
          
          // Имитируем прошедшее время (5+ секунд)
          vi.useFakeTimers();
          vi.advanceTimersByTime(6000);
          
          for (let i = 0; i < actualCompletions; i++) {
            // Очищаем sessionStorage чтобы trackCompletion не блокировался
            sessionStorageMock.removeItem(`completion_${articleId}`);
            trackCompletion(articleId);
          }
          
          vi.useRealTimers();

          // Получаем метрики
          const metrics = getArticleMetrics(articleId);

          // Проверяем completion rate
          const expectedRate = (actualCompletions / pageViews) * 100;
          expect(metrics.completionRate).toBeCloseTo(expectedRate, 1);

          // Completion rate должен быть от 0 до 100
          expect(metrics.completionRate).toBeGreaterThanOrEqual(0);
          expect(metrics.completionRate).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Дополнительный тест: проверка поисковых событий
   */
  test('Search events record query and results count', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 0, max: 50 }),
        (query, resultsCount) => {
          // Очищаем события для каждого property run
          clearAllEvents();

          trackSearchQuery(query, resultsCount);

          const searchEvents = getAllEvents().filter(e => e.type === 'search');

          expect(searchEvents.length).toBe(1);
          expect(searchEvents[0].data.query).toBe(query);
          expect(searchEvents[0].data.resultsCount).toBe(resultsCount);
          expect(searchEvents[0].data.hasResults).toBe(resultsCount > 0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Дополнительный тест: проверка предотвращения дублирования scroll depth событий
   */
  test('Scroll depth events are not duplicated for same threshold', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.constantFrom(25, 50, 75, 100),
        (articleId, threshold) => {
          // Очищаем sessionStorage
          sessionStorageMock.clear();
          getAllEvents().length = 0;

          // Отправляем несколько событий с одинаковым порогом
          trackScrollDepth(articleId, threshold);
          trackScrollDepth(articleId, threshold);
          trackScrollDepth(articleId, threshold);

          const scrollEvents = getAllEvents().filter(
            e => e.type === 'scroll_depth' && 
            e.articleId === articleId && 
            e.data.depth === threshold
          );

          // Должно быть записано только одно событие
          expect(scrollEvents.length).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Дополнительный тест: проверка структуры события
   */
  test('All events have required fields', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (articleId) => {
          // Очищаем события для каждого property run
          clearAllEvents();

          trackPageView(articleId);

          const allEvents = getAllEvents();

          allEvents.forEach(event => {
            // Проверяем обязательные поля
            expect(event).toHaveProperty('id');
            expect(event).toHaveProperty('type');
            expect(event).toHaveProperty('sessionId');
            expect(event).toHaveProperty('timestamp');
            expect(event).toHaveProperty('data');

            // Проверяем типы
            expect(typeof event.id).toBe('string');
            expect(typeof event.type).toBe('string');
            expect(typeof event.sessionId).toBe('string');
            expect(event.timestamp).toBeInstanceOf(Date);
            expect(typeof event.data).toBe('object');
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
