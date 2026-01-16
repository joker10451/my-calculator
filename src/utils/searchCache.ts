/**
 * Утилиты для кеширования результатов поиска
 * Кеш с TTL 5 минут для оптимизации повторных поисков
 */

import type { BlogPost } from '@/types/blog';

const SEARCH_CACHE_PREFIX = 'schitay_search_';
const SEARCH_CACHE_TTL = 5 * 60 * 1000; // 5 минут

interface CachedSearchResult {
  query: string;
  results: BlogPost[];
  timestamp: number;
}

/**
 * Нормализация поискового запроса для кеширования
 */
const normalizeQuery = (query: string): string => {
  return query.toLowerCase().trim();
};

/**
 * Генерация ключа кеша
 */
const getCacheKey = (query: string): string => {
  const normalized = normalizeQuery(query);
  return SEARCH_CACHE_PREFIX + normalized;
};

/**
 * Получить результаты поиска из кеша
 */
export const getCachedSearchResults = (query: string): BlogPost[] | null => {
  try {
    const cacheKey = getCacheKey(query);
    const cached = sessionStorage.getItem(cacheKey);
    
    if (!cached) return null;

    const cachedData: CachedSearchResult = JSON.parse(cached);
    const now = Date.now();

    // Проверяем TTL (5 минут)
    if (now - cachedData.timestamp > SEARCH_CACHE_TTL) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }

    return cachedData.results;
  } catch (error) {
    console.error('Failed to get cached search results:', error);
    return null;
  }
};

/**
 * Сохранить результаты поиска в кеш
 */
export const setCachedSearchResults = (query: string, results: BlogPost[]): void => {
  try {
    const cacheKey = getCacheKey(query);
    const now = Date.now();

    const cachedData: CachedSearchResult = {
      query: normalizeQuery(query),
      results,
      timestamp: now,
    };

    sessionStorage.setItem(cacheKey, JSON.stringify(cachedData));
  } catch (error) {
    console.error('Failed to cache search results:', error);
    
    // Если sessionStorage переполнен, очищаем старые записи
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearExpiredSearchCache();
      // Пробуем еще раз
      try {
        const cacheKey = getCacheKey(query);
        const cachedData: CachedSearchResult = {
          query: normalizeQuery(query),
          results,
          timestamp: Date.now(),
        };
        sessionStorage.setItem(cacheKey, JSON.stringify(cachedData));
      } catch (retryError) {
        console.error('Failed to cache search results after cleanup:', retryError);
      }
    }
  }
};

/**
 * Очистить просроченный кеш поиска
 */
export const clearExpiredSearchCache = (): void => {
  try {
    const now = Date.now();
    const keysToRemove: string[] = [];

    // Проходим по всем ключам в sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      
      if (key && key.startsWith(SEARCH_CACHE_PREFIX)) {
        const cached = sessionStorage.getItem(key);
        
        if (cached) {
          try {
            const cachedData: CachedSearchResult = JSON.parse(cached);
            
            if (now - cachedData.timestamp > SEARCH_CACHE_TTL) {
              keysToRemove.push(key);
            }
          } catch (parseError) {
            // Если не удалось распарсить, удаляем
            keysToRemove.push(key);
          }
        }
      }
    }

    // Удаляем просроченные записи
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  } catch (error) {
    console.error('Failed to clear expired search cache:', error);
  }
};

/**
 * Очистить весь кеш поиска
 */
export const clearSearchCache = (): void => {
  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      
      if (key && key.startsWith(SEARCH_CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  } catch (error) {
    console.error('Failed to clear search cache:', error);
  }
};

/**
 * Получить статистику кеша поиска
 */
export const getSearchCacheStats = (): {
  size: number;
  queries: string[];
} => {
  try {
    const queries: string[] = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      
      if (key && key.startsWith(SEARCH_CACHE_PREFIX)) {
        const cached = sessionStorage.getItem(key);
        
        if (cached) {
          try {
            const cachedData: CachedSearchResult = JSON.parse(cached);
            queries.push(cachedData.query);
          } catch (parseError) {
            // Игнорируем ошибки парсинга
          }
        }
      }
    }

    return {
      size: queries.length,
      queries,
    };
  } catch (error) {
    console.error('Failed to get search cache stats:', error);
    return {
      size: 0,
      queries: [],
    };
  }
};
