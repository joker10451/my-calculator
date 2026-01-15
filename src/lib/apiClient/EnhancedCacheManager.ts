/**
 * Улучшенный менеджер кэша с метаданными, автоматическим обновлением и мониторингом
 */

import { ApiCache } from '@/types/apiSources';

export interface CacheMetadata {
  timestamp: number;
  expirationDate: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  version: string;
  tags: string[];
  source: string;
}

export interface CacheEntry<T> {
  data: T;
  metadata: CacheMetadata;
}

export interface CacheStatistics {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  expiredEntries: number;
  averageAccessCount: number;
  oldestEntry: number;
  newestEntry: number;
  entriesBySource: Record<string, number>;
  entriesByTag: Record<string, number>;
}

export interface CacheRefreshOptions {
  refreshCallback?: (key: string) => Promise<any>;
  refreshThreshold: number; // Процент от TTL, после которого начинается обновление
  backgroundRefresh: boolean;
  maxConcurrentRefresh: number;
}

export class EnhancedCacheManager implements ApiCache {
  private readonly prefix = 'enhanced_cache_';
  private statistics: {
    hits: number;
    misses: number;
    refreshes: number;
    errors: number;
  } = { hits: 0, misses: 0, refreshes: 0, errors: 0 };
  
  private refreshOptions: CacheRefreshOptions;
  private refreshQueue: Set<string> = new Set();
  private refreshInProgress: Set<string> = new Set();
  private refreshTimer?: NodeJS.Timeout;

  constructor(refreshOptions?: Partial<CacheRefreshOptions>) {
    this.refreshOptions = {
      refreshThreshold: 0.8, // Обновлять когда остается 20% от TTL
      backgroundRefresh: true,
      maxConcurrentRefresh: 3,
      ...refreshOptions
    };

    // Запускаем периодическую проверку на обновления
    if (this.refreshOptions.backgroundRefresh) {
      this.startBackgroundRefresh();
    }
  }

  /**
   * Получить данные из кэша с обновлением метаданных
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.prefix + key;
      const item = localStorage.getItem(fullKey);
      
      if (!item) {
        this.statistics.misses++;
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(item);
      const now = Date.now();

      // Проверяем истечение срока
      if (entry.metadata.expirationDate > 0 && now > entry.metadata.expirationDate) {
        localStorage.removeItem(fullKey);
        this.statistics.misses++;
        return null;
      }

      // Обновляем метаданные доступа
      entry.metadata.accessCount++;
      entry.metadata.lastAccessed = now;
      
      // Сохраняем обновленные метаданные
      localStorage.setItem(fullKey, JSON.stringify(entry));

      // Проверяем, нужно ли обновить данные
      if (this.shouldRefresh(entry.metadata)) {
        this.scheduleRefresh(key);
      }

      this.statistics.hits++;
      return entry.data;
    } catch (error) {
      console.error('Enhanced cache get error:', error);
      this.statistics.errors++;
      return null;
    }
  }

  /**
   * Сохранить данные в кэш с полными метаданными
   */
  async set<T>(
    key: string, 
    value: T, 
    ttl: number = 0,
    options?: {
      tags?: string[];
      source?: string;
      version?: string;
    }
  ): Promise<void> {
    try {
      const fullKey = this.prefix + key;
      const now = Date.now();
      const serializedData = JSON.stringify(value);
      
      const metadata: CacheMetadata = {
        timestamp: now,
        expirationDate: ttl > 0 ? now + ttl : 0,
        accessCount: 0,
        lastAccessed: now,
        size: serializedData.length,
        version: options?.version || '1.0',
        tags: options?.tags || [],
        source: options?.source || 'unknown'
      };

      const entry: CacheEntry<T> = {
        data: value,
        metadata
      };

      localStorage.setItem(fullKey, JSON.stringify(entry));
    } catch (error) {
      console.error('Enhanced cache set error:', error);
      this.statistics.errors++;
      
      // Если localStorage переполнен, пытаемся очистить старые записи
      if (error instanceof DOMException && error.code === 22) {
        await this.cleanup();
        // Пытаемся еще раз
        try {
          const entry: CacheEntry<T> = {
            data: value,
            metadata: {
              timestamp: Date.now(),
              expirationDate: ttl > 0 ? Date.now() + ttl : 0,
              accessCount: 0,
              lastAccessed: Date.now(),
              size: JSON.stringify(value).length,
              version: options?.version || '1.0',
              tags: options?.tags || [],
              source: options?.source || 'unknown'
            }
          };
          localStorage.setItem(this.prefix + key, JSON.stringify(entry));
        } catch (retryError) {
          console.error('Enhanced cache set retry failed:', retryError);
          throw retryError;
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Удалить запись из кэша
   */
  async delete(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.prefix + key);
      this.refreshQueue.delete(key);
      this.refreshInProgress.delete(key);
    } catch (error) {
      console.error('Enhanced cache delete error:', error);
      this.statistics.errors++;
    }
  }

  /**
   * Очистить весь кэш
   */
  async clear(): Promise<void> {
    try {
      // Правильный способ итерации по localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      
      // Удаляем найденные ключи
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
      
      this.refreshQueue.clear();
      this.refreshInProgress.clear();
      this.resetStatistics();
    } catch (error) {
      console.error('Enhanced cache clear error:', error);
      this.statistics.errors++;
    }
  }

  /**
   * Проверить наличие ключа в кэше
   */
  async has(key: string): Promise<boolean> {
    try {
      const value = await this.get(key);
      return value !== null;
    } catch (error) {
      console.error('Enhanced cache has error:', error);
      this.statistics.errors++;
      return false;
    }
  }

  /**
   * Получить метаданные записи
   */
  async getMetadata(key: string): Promise<CacheMetadata | null> {
    try {
      const fullKey = this.prefix + key;
      const item = localStorage.getItem(fullKey);
      
      if (!item) {
        return null;
      }

      const entry: CacheEntry<any> = JSON.parse(item);
      return entry.metadata;
    } catch (error) {
      console.error('Get metadata error:', error);
      return null;
    }
  }

  /**
   * Поиск записей по тегам
   */
  async findByTag(tag: string): Promise<string[]> {
    try {
      const matchingKeys: string[] = [];

      // Правильный способ итерации по localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(this.prefix)) continue;

        try {
          const item = localStorage.getItem(key);
          if (!item) continue;

          const entry: CacheEntry<any> = JSON.parse(item);
          if (entry.metadata && entry.metadata.tags && entry.metadata.tags.includes(tag)) {
            const originalKey = key.replace(this.prefix, '');
            // Проверяем что ключ не пустой после удаления префикса
            if (originalKey.trim().length > 0) {
              matchingKeys.push(originalKey);
            }
          }
        } catch (parseError) {
          // Пропускаем поврежденные записи
          continue;
        }
      }

      return matchingKeys;
    } catch (error) {
      console.error('Find by tag error:', error);
      return [];
    }
  }

  /**
   * Поиск записей по источнику
   */
  async findBySource(source: string): Promise<string[]> {
    try {
      const matchingKeys: string[] = [];

      // Правильный способ итерации по localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(this.prefix)) continue;

        try {
          const item = localStorage.getItem(key);
          if (!item) continue;

          const entry: CacheEntry<any> = JSON.parse(item);
          if (entry.metadata && entry.metadata.source === source) {
            const originalKey = key.replace(this.prefix, '');
            // Проверяем что ключ не пустой после удаления префикса
            if (originalKey.trim().length > 0) {
              matchingKeys.push(originalKey);
            }
          }
        } catch (parseError) {
          continue;
        }
      }

      return matchingKeys;
    } catch (error) {
      console.error('Find by source error:', error);
      return [];
    }
  }

  /**
   * Получить полную статистику кэша
   */
  getStatistics(): CacheStatistics {
    try {
      const cacheKeys: string[] = [];
      
      // Правильный способ итерации по localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          cacheKeys.push(key);
        }
      }
      
      const now = Date.now();
      let totalSize = 0;
      let expiredEntries = 0;
      let totalAccessCount = 0;
      let oldestEntry = now;
      let newestEntry = 0;
      const entriesBySource: Record<string, number> = {};
      const entriesByTag: Record<string, number> = {};

      for (const key of cacheKeys) {
        try {
          const item = localStorage.getItem(key);
          if (!item) continue;

          const entry: CacheEntry<any> = JSON.parse(item);
          const metadata = entry.metadata;
          
          totalSize += metadata.size;
          totalAccessCount += metadata.accessCount;
          
          if (metadata.timestamp < oldestEntry) {
            oldestEntry = metadata.timestamp;
          }
          if (metadata.timestamp > newestEntry) {
            newestEntry = metadata.timestamp;
          }

          // Проверяем истечение срока
          if (metadata.expirationDate > 0 && now > metadata.expirationDate) {
            expiredEntries++;
          }

          // Группировка по источникам
          entriesBySource[metadata.source] = (entriesBySource[metadata.source] || 0) + 1;

          // Группировка по тегам
          for (const tag of metadata.tags) {
            entriesByTag[tag] = (entriesByTag[tag] || 0) + 1;
          }
        } catch (parseError) {
          expiredEntries++;
        }
      }

      const totalRequests = this.statistics.hits + this.statistics.misses;
      const hitRate = totalRequests > 0 ? this.statistics.hits / totalRequests : 0;
      const missRate = totalRequests > 0 ? this.statistics.misses / totalRequests : 0;
      const averageAccessCount = cacheKeys.length > 0 ? totalAccessCount / cacheKeys.length : 0;

      return {
        totalEntries: cacheKeys.length,
        totalSize,
        hitRate,
        missRate,
        expiredEntries,
        averageAccessCount,
        oldestEntry: oldestEntry === now ? 0 : oldestEntry,
        newestEntry,
        entriesBySource,
        entriesByTag
      };
    } catch (error) {
      console.error('Get statistics error:', error);
      return {
        totalEntries: 0,
        totalSize: 0,
        hitRate: 0,
        missRate: 0,
        expiredEntries: 0,
        averageAccessCount: 0,
        oldestEntry: 0,
        newestEntry: 0,
        entriesBySource: {},
        entriesByTag: {}
      };
    }
  }

  /**
   * Принудительное обновление записи
   */
  async refresh(key: string): Promise<boolean> {
    if (!this.refreshOptions.refreshCallback) {
      return false;
    }

    if (this.refreshInProgress.has(key)) {
      return false; // Уже обновляется
    }

    try {
      this.refreshInProgress.add(key);
      this.refreshQueue.delete(key);
      
      const newData = await this.refreshOptions.refreshCallback(key);
      if (newData !== undefined) {
        // Получаем текущие метаданные для сохранения TTL
        const currentMetadata = await this.getMetadata(key);
        const ttl = currentMetadata ? 
          Math.max(0, currentMetadata.expirationDate - Date.now()) : 
          24 * 60 * 60 * 1000; // 24 часа по умолчанию

        await this.set(key, newData, ttl, {
          tags: currentMetadata?.tags,
          source: currentMetadata?.source,
          version: currentMetadata?.version
        });
        
        this.statistics.refreshes++;
        return true;
      }
    } catch (error) {
      console.error(`Refresh failed for key ${key}:`, error);
      this.statistics.errors++;
    } finally {
      this.refreshInProgress.delete(key);
    }

    return false;
  }

  /**
   * Проверить, нужно ли обновить запись
   */
  private shouldRefresh(metadata: CacheMetadata): boolean {
    if (!this.refreshOptions.refreshCallback || metadata.expirationDate === 0) {
      return false;
    }

    const now = Date.now();
    const totalTtl = metadata.expirationDate - metadata.timestamp;
    const remainingTtl = metadata.expirationDate - now;
    const remainingPercent = remainingTtl / totalTtl;

    return remainingPercent <= (1 - this.refreshOptions.refreshThreshold);
  }

  /**
   * Запланировать обновление записи
   */
  private scheduleRefresh(key: string): void {
    if (this.refreshInProgress.has(key) || this.refreshQueue.has(key)) {
      return;
    }

    if (this.refreshInProgress.size >= this.refreshOptions.maxConcurrentRefresh) {
      this.refreshQueue.add(key);
    } else {
      // Обновляем асинхронно
      this.refresh(key).then(() => {
        // Проверяем очередь на следующие обновления
        if (this.refreshQueue.size > 0 && 
            this.refreshInProgress.size < this.refreshOptions.maxConcurrentRefresh) {
          const nextKey = this.refreshQueue.values().next().value;
          if (nextKey) {
            this.refreshQueue.delete(nextKey);
            this.scheduleRefresh(nextKey);
          }
        }
      });
    }
  }

  /**
   * Запуск фонового обновления
   */
  private startBackgroundRefresh(): void {
    this.refreshTimer = setInterval(() => {
      this.processRefreshQueue();
    }, 30000); // Каждые 30 секунд
  }

  /**
   * Обработка очереди обновлений
   */
  private async processRefreshQueue(): Promise<void> {
    const keysToProcess = Math.min(
      this.refreshQueue.size, 
      this.refreshOptions.maxConcurrentRefresh - this.refreshInProgress.size
    );

    if (keysToProcess <= 0) return;

    const keys = Array.from(this.refreshQueue).slice(0, keysToProcess);
    
    for (const key of keys) {
      this.refreshQueue.delete(key);
      this.refresh(key); // Не ждем завершения
    }
  }

  /**
   * Очистка устаревших записей
   */
  private async cleanup(): Promise<void> {
    try {
      const keysToRemove: string[] = [];
      const now = Date.now();
      let removedCount = 0;

      // Правильный способ итерации по localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(this.prefix)) continue;

        try {
          const item = localStorage.getItem(key);
          if (!item) continue;

          const entry: CacheEntry<any> = JSON.parse(item);
          
          // Удаляем устаревшие записи
          if (entry.metadata.expirationDate > 0 && now > entry.metadata.expirationDate) {
            keysToRemove.push(key);
          }
        } catch (parseError) {
          // Удаляем поврежденные записи
          keysToRemove.push(key);
        }
      }

      // Удаляем найденные ключи
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
        removedCount++;
      }

      console.log(`Cleanup completed: removed ${removedCount} entries`);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  /**
   * Сброс статистики
   */
  resetStatistics(): void {
    this.statistics = { hits: 0, misses: 0, refreshes: 0, errors: 0 };
  }

  /**
   * Получить внутреннюю статистику операций
   */
  getOperationStatistics(): typeof this.statistics {
    return { ...this.statistics };
  }

  /**
   * Установить callback для обновления
   */
  setRefreshCallback(callback: (key: string) => Promise<any>): void {
    this.refreshOptions.refreshCallback = callback;
  }

  /**
   * Остановка и очистка ресурсов
   */
  dispose(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
    this.refreshQueue.clear();
    this.refreshInProgress.clear();
  }
}