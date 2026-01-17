/**
 * Blog Analytics Service
 * Отслеживание метрик и поведения пользователей в блоге
 */

/**
 * Типы аналитических событий
 */
export type AnalyticsEventType =
  | 'page_view'
  | 'reading_time'
  | 'scroll_depth'
  | 'calculator_click'
  | 'search'
  | 'completion';

/**
 * Интерфейс аналитического события
 */
export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  articleId?: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

/**
 * Интерфейс метрик статьи
 */
export interface ArticleMetrics {
  pageViews: number;
  averageReadingTime: number;
  completionRate: number;
  calculatorClicks: number;
  scrollDepthDistribution: {
    '25%': number;
    '50%': number;
    '75%': number;
    '100%': number;
  };
}

/**
 * Интерфейс для отслеживания времени чтения
 */
interface ReadingSession {
  articleId: string;
  startTime: number;
  lastActivityTime: number;
  isActive: boolean;
}

// Хранилище событий (в production отправлять на backend)
const events: AnalyticsEvent[] = [];
const readingSessions = new Map<string, ReadingSession>();

/**
 * Генерация уникального ID для события
 */
function generateEventId(): string {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Получение ID сессии (создается если не существует)
 */
export function getSessionId(): string {
  try {
    let sessionId = sessionStorage.getItem('blog_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('blog_session_id', sessionId);
    }
    return sessionId;
  } catch (e) {
    return `session_${Date.now()}`;
  }
}

/**
 * Получение ID пользователя (анонимный, из localStorage)
 */
function getUserId(): string | undefined {
  try {
    let userId = localStorage.getItem('blog_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('blog_user_id', userId);
    }
    return userId;
  } catch (e) {
    return undefined;
  }
}

/**
 * Сохранение события
 */
function saveEvent(event: AnalyticsEvent): void {
  events.push(event);

  // Сохраняем в localStorage (последние 100 событий)
  try {
    const stored = localStorage.getItem('blog_analytics_events');
    const data = stored ? JSON.parse(stored) : [];
    data.push(event);
    
    // Оставляем только последние 100 событий
    if (data.length > 100) {
      data.shift();
    }
    
    localStorage.setItem('blog_analytics_events', JSON.stringify(data));
  } catch (e) {
    console.error('Failed to store analytics event', e);
  }

  // Отправляем на backend (если доступен)
  sendEventToBackend(event);

  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics event tracked:', event);
  }
}

/**
 * Отправка события на backend
 */
async function sendEventToBackend(event: AnalyticsEvent): Promise<void> {
  // В development режиме не отправляем на backend
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  try {
    // TODO: Заменить на реальный endpoint
    const endpoint = '/api/blog/analytics';
    
    // Проверяем доступность API с коротким timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 секунды timeout
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (e) {
    // Тихий fail - аналитика не должна ломать приложение
    // В production режиме не логируем ошибки в консоль
    if (process.env.NODE_ENV === 'development') {
      console.warn('Analytics API unavailable, events stored locally only');
    }
  }
}

/**
 * Отслеживание просмотра страницы
 */
export function trackPageView(articleId: string): void {
  const event: AnalyticsEvent = {
    id: generateEventId(),
    type: 'page_view',
    articleId,
    userId: getUserId(),
    sessionId: getSessionId(),
    timestamp: new Date(),
    data: {
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    },
  };

  saveEvent(event);

  // Начинаем отслеживание времени чтения
  startReadingSession(articleId);
}

/**
 * Начало сессии чтения
 */
function startReadingSession(articleId: string): void {
  const now = Date.now();
  readingSessions.set(articleId, {
    articleId,
    startTime: now,
    lastActivityTime: now,
    isActive: true,
  });
}

/**
 * Обновление активности в сессии чтения
 */
function updateReadingActivity(articleId: string): void {
  const session = readingSessions.get(articleId);
  if (session) {
    session.lastActivityTime = Date.now();
    session.isActive = true;
  }
}

/**
 * Отслеживание времени чтения
 */
export function trackReadingTime(articleId: string, duration: number): void {
  const event: AnalyticsEvent = {
    id: generateEventId(),
    type: 'reading_time',
    articleId,
    userId: getUserId(),
    sessionId: getSessionId(),
    timestamp: new Date(),
    data: {
      duration, // в секундах
    },
  };

  saveEvent(event);
}

/**
 * Завершение сессии чтения и отправка времени чтения
 */
export function endReadingSession(articleId: string): void {
  const session = readingSessions.get(articleId);
  if (!session) return;

  const duration = Math.floor((Date.now() - session.startTime) / 1000); // в секундах
  
  // Отправляем только если пользователь был активен (не просто открыл вкладку)
  if (duration > 5) {
    trackReadingTime(articleId, duration);
  }

  readingSessions.delete(articleId);
}

/**
 * Отслеживание глубины прокрутки
 */
export function trackScrollDepth(articleId: string, depth: number): void {
  // Округляем до ближайшего порога (25%, 50%, 75%, 100%)
  const thresholds = [25, 50, 75, 100];
  const threshold = thresholds.find(t => depth <= t) || 100;

  // Проверяем, не отправляли ли мы уже это событие
  const key = `scroll_${articleId}_${threshold}`;
  const sent = sessionStorage.getItem(key);
  
  if (sent) return;

  const event: AnalyticsEvent = {
    id: generateEventId(),
    type: 'scroll_depth',
    articleId,
    userId: getUserId(),
    sessionId: getSessionId(),
    timestamp: new Date(),
    data: {
      depth: threshold,
      exactDepth: depth,
    },
  };

  saveEvent(event);
  
  // Обновляем активность чтения
  updateReadingActivity(articleId);

  // Отмечаем, что событие отправлено
  try {
    sessionStorage.setItem(key, 'true');
  } catch (e) {
    // Игнорируем ошибки
  }
}

/**
 * Отслеживание клика на калькулятор
 */
export function trackCalculatorClick(articleId: string, calculatorId: string): void {
  const event: AnalyticsEvent = {
    id: generateEventId(),
    type: 'calculator_click',
    articleId,
    userId: getUserId(),
    sessionId: getSessionId(),
    timestamp: new Date(),
    data: {
      calculatorId,
      calculatorUrl: `/calculator/${calculatorId}`,
    },
  };

  saveEvent(event);
}

/**
 * Отслеживание поискового запроса
 */
export function trackSearchQuery(query: string, resultsCount: number): void {
  const event: AnalyticsEvent = {
    id: generateEventId(),
    type: 'search',
    userId: getUserId(),
    sessionId: getSessionId(),
    timestamp: new Date(),
    data: {
      query,
      resultsCount,
      hasResults: resultsCount > 0,
    },
  };

  saveEvent(event);
}

/**
 * Отслеживание завершения чтения статьи
 * Completion = 100% scroll depth + пребывание на странице 5+ секунд
 */
export function trackCompletion(articleId: string): void {
  const session = readingSessions.get(articleId);
  if (!session) return;

  const timeOnPage = Math.floor((Date.now() - session.startTime) / 1000);
  
  // Проверяем условия completion
  if (timeOnPage < 5) return;

  // Проверяем, не отправляли ли уже completion
  const key = `completion_${articleId}`;
  const sent = sessionStorage.getItem(key);
  
  if (sent) return;

  const event: AnalyticsEvent = {
    id: generateEventId(),
    type: 'completion',
    articleId,
    userId: getUserId(),
    sessionId: getSessionId(),
    timestamp: new Date(),
    data: {
      timeOnPage,
      completedAt: new Date().toISOString(),
    },
  };

  saveEvent(event);

  // Отмечаем, что completion отправлен
  try {
    sessionStorage.setItem(key, 'true');
  } catch (e) {
    // Игнорируем ошибки
  }
}

/**
 * Получение метрик для статьи
 */
export function getArticleMetrics(articleId: string): ArticleMetrics {
  const articleEvents = events.filter(e => e.articleId === articleId);

  const pageViews = articleEvents.filter(e => e.type === 'page_view').length;
  
  const readingTimeEvents = articleEvents.filter(e => e.type === 'reading_time');
  const totalReadingTime = readingTimeEvents.reduce((sum, e) => sum + (e.data.duration || 0), 0);
  const averageReadingTime = readingTimeEvents.length > 0 
    ? totalReadingTime / readingTimeEvents.length 
    : 0;

  const completions = articleEvents.filter(e => e.type === 'completion').length;
  const completionRate = pageViews > 0 ? (completions / pageViews) * 100 : 0;

  const calculatorClicks = articleEvents.filter(e => e.type === 'calculator_click').length;

  const scrollDepthDistribution = {
    '25%': articleEvents.filter(e => e.type === 'scroll_depth' && e.data.depth === 25).length,
    '50%': articleEvents.filter(e => e.type === 'scroll_depth' && e.data.depth === 50).length,
    '75%': articleEvents.filter(e => e.type === 'scroll_depth' && e.data.depth === 75).length,
    '100%': articleEvents.filter(e => e.type === 'scroll_depth' && e.data.depth === 100).length,
  };

  return {
    pageViews,
    averageReadingTime,
    completionRate,
    calculatorClicks,
    scrollDepthDistribution,
  };
}

/**
 * Получение всех событий (для отладки)
 */
export function getAllEvents(): AnalyticsEvent[] {
  return [...events];
}

/**
 * Очистка всех событий (для тестирования)
 */
export function clearAllEvents(): void {
  events.splice(0, events.length);
  readingSessions.clear();
}

/**
 * Очистка старых событий (для управления памятью)
 */
export function clearOldEvents(daysToKeep: number = 7): void {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const filteredEvents = events.filter(e => e.timestamp >= cutoffDate);
  events.length = 0;
  events.push(...filteredEvents);

  // Обновляем localStorage
  try {
    localStorage.setItem('blog_analytics_events', JSON.stringify(events));
  } catch (e) {
    console.error('Failed to update stored events', e);
  }
}

/**
 * Инициализация аналитики (загрузка сохраненных данных)
 */
export function initAnalytics(): void {
  try {
    const stored = localStorage.getItem('blog_analytics_events');
    if (stored) {
      const data = JSON.parse(stored);
      events.push(...data.map((e: Record<string, unknown>) => ({
        ...e,
        timestamp: new Date(e.timestamp as string),
      })));
    }

    // Очищаем старые события при инициализации
    clearOldEvents(7);
  } catch (e) {
    console.error('Failed to load stored analytics data', e);
  }
}

/**
 * Экспорт данных для анализа
 */
export function exportAnalyticsData() {
  return {
    events: events,
    sessions: Array.from(readingSessions.values()),
    exportedAt: new Date().toISOString(),
  };
}
