/**
 * Утилиты для кеширования статей в localStorage
 * Оптимизирует загрузку часто читаемых статей
 */

import type { BlogPost } from '@/types/blog';

const CACHE_PREFIX = 'schitay_article_';
const CACHE_INDEX_KEY = 'schitay_article_index';
const MAX_CACHE_SIZE = 10; // Максимум 10 статей в кеше
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 часа

interface CachedArticle {
  article: BlogPost;
  timestamp: number;
  accessCount: number;
}

interface CacheIndex {
  [slug: string]: {
    timestamp: number;
    accessCount: number;
  };
}

/**
 * Получить статью из кеша
 */
export const getCachedArticle = (slug: string): BlogPost | null => {
  try {
    const cacheKey = CACHE_PREFIX + slug;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;

    const cachedData: CachedArticle = JSON.parse(cached);
    const now = Date.now();

    // Проверяем TTL
    if (now - cachedData.timestamp > CACHE_TTL) {
      removeCachedArticle(slug);
      return null;
    }

    // Увеличиваем счетчик доступа
    cachedData.accessCount++;
    cachedData.timestamp = now;
    localStorage.setItem(cacheKey, JSON.stringify(cachedData));

    // Обновляем индекс
    updateCacheIndex(slug, cachedData.timestamp, cachedData.accessCount);

    return cachedData.article;
  } catch (error) {
    console.error('Failed to get cached article:', error);
    return null;
  }
};

/**
 * Сохранить статью в кеш
 */
export const setCachedArticle = (article: BlogPost): void => {
  try {
    const cacheKey = CACHE_PREFIX + article.slug;
    const now = Date.now();

    const cachedData: CachedArticle = {
      article,
      timestamp: now,
      accessCount: 1,
    };

    // Проверяем размер кеша
    const index = getCacheIndex();
    const cacheSize = Object.keys(index).length;

    if (cacheSize >= MAX_CACHE_SIZE) {
      // Удаляем наименее используемую статью
      evictLeastUsedArticle(index);
    }

    localStorage.setItem(cacheKey, JSON.stringify(cachedData));
    updateCacheIndex(article.slug, now, 1);
  } catch (error) {
    console.error('Failed to cache article:', error);
    
    // Если localStorage переполнен, очищаем старые записи
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearOldCache();
      // Пробуем еще раз
      try {
        const cacheKey = CACHE_PREFIX + article.slug;
        const cachedData: CachedArticle = {
          article,
          timestamp: Date.now(),
          accessCount: 1,
        };
        localStorage.setItem(cacheKey, JSON.stringify(cachedData));
      } catch (retryError) {
        console.error('Failed to cache article after cleanup:', retryError);
      }
    }
  }
};

/**
 * Удалить статью из кеша
 */
export const removeCachedArticle = (slug: string): void => {
  try {
    const cacheKey = CACHE_PREFIX + slug;
    localStorage.removeItem(cacheKey);

    // Обновляем индекс
    const index = getCacheIndex();
    delete index[slug];
    localStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
  } catch (error) {
    console.error('Failed to remove cached article:', error);
  }
};

/**
 * Получить индекс кеша
 */
const getCacheIndex = (): CacheIndex => {
  try {
    const indexData = localStorage.getItem(CACHE_INDEX_KEY);
    return indexData ? JSON.parse(indexData) : {};
  } catch (error) {
    console.error('Failed to get cache index:', error);
    return {};
  }
};

/**
 * Обновить индекс кеша
 */
const updateCacheIndex = (slug: string, timestamp: number, accessCount: number): void => {
  try {
    const index = getCacheIndex();
    index[slug] = { timestamp, accessCount };
    localStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
  } catch (error) {
    console.error('Failed to update cache index:', error);
  }
};

/**
 * Удалить наименее используемую статью
 */
const evictLeastUsedArticle = (index: CacheIndex): void => {
  let leastUsedSlug: string | null = null;
  let minAccessCount = Infinity;

  for (const [slug, data] of Object.entries(index)) {
    if (data.accessCount < minAccessCount) {
      minAccessCount = data.accessCount;
      leastUsedSlug = slug;
    }
  }

  if (leastUsedSlug) {
    removeCachedArticle(leastUsedSlug);
  }
};

/**
 * Очистить старый кеш (старше TTL)
 */
export const clearOldCache = (): void => {
  try {
    const index = getCacheIndex();
    const now = Date.now();

    for (const [slug, data] of Object.entries(index)) {
      if (now - data.timestamp > CACHE_TTL) {
        removeCachedArticle(slug);
      }
    }
  } catch (error) {
    console.error('Failed to clear old cache:', error);
  }
};

/**
 * Очистить весь кеш статей
 */
export const clearArticleCache = (): void => {
  try {
    const index = getCacheIndex();
    
    for (const slug of Object.keys(index)) {
      removeCachedArticle(slug);
    }

    localStorage.removeItem(CACHE_INDEX_KEY);
  } catch (error) {
    console.error('Failed to clear article cache:', error);
  }
};

/**
 * Получить статистику кеша
 */
export const getCacheStats = (): {
  size: number;
  articles: string[];
  totalAccessCount: number;
} => {
  try {
    const index = getCacheIndex();
    const articles = Object.keys(index);
    const totalAccessCount = Object.values(index).reduce(
      (sum, data) => sum + data.accessCount,
      0
    );

    return {
      size: articles.length,
      articles,
      totalAccessCount,
    };
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return {
      size: 0,
      articles: [],
      totalAccessCount: 0,
    };
  }
};
