/**
 * Реализация кэша на основе localStorage с поддержкой метаданных
 * Теперь использует EnhancedCacheManager для расширенной функциональности
 */

import { ApiCache } from '@/types/apiSources';
import { EnhancedCacheManager, CacheStatistics } from './EnhancedCacheManager';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class LocalStorageCache implements ApiCache {
  private readonly prefix = 'api_cache_';
  private enhancedCache: EnhancedCacheManager;

  constructor() {
    this.enhancedCache = new EnhancedCacheManager({
      refreshThreshold: 0.8,
      backgroundRefresh: true,
      maxConcurrentRefresh: 2
    });
  }

  async get<T>(key: string): Promise<T | null> {
    // Сначала пробуем новый enhanced cache
    const enhancedResult = await this.enhancedCache.get<T>(key);
    if (enhancedResult !== null) {
      return enhancedResult;
    }

    // Fallback к старому формату для обратной совместимости
    try {
      const fullKey = this.prefix + key;
      const item = localStorage.getItem(fullKey);
      
      if (!item) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(item);
      const now = Date.now();

      // Проверяем TTL
      if (entry.ttl > 0 && now > entry.timestamp + entry.ttl) {
        // Запись устарела, удаляем
        localStorage.removeItem(fullKey);
        return null;
      }

      // Мигрируем в новый формат
      await this.enhancedCache.set(key, entry.data, entry.ttl > 0 ? entry.ttl - (now - entry.timestamp) : 0, {
        source: 'migrated',
        tags: ['legacy']
      });
      
      // Удаляем старую запись
      localStorage.removeItem(fullKey);

      return entry.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = 0): Promise<void> {
    // Используем новый enhanced cache
    await this.enhancedCache.set(key, value, ttl, {
      source: 'api_client',
      tags: ['api_data']
    });
  }

  async delete(key: string): Promise<void> {
    await this.enhancedCache.delete(key);
    // Также удаляем из старого формата
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async clear(): Promise<void> {
    await this.enhancedCache.clear();
    // Также очищаем старый формат
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  async has(key: string): Promise<boolean> {
    return await this.enhancedCache.has(key);
  }

  /**
   * Получить размер кэша
   */
  getCacheSize(): number {
    const stats = this.enhancedCache.getStatistics();
    return stats.totalEntries;
  }

  /**
   * Получить статистику кэша (теперь расширенную)
   */
  getCacheStats(): CacheStatistics {
    return this.enhancedCache.getStatistics();
  }

  /**
   * Получить расширенную статистику операций
   */
  getOperationStatistics() {
    return this.enhancedCache.getOperationStatistics();
  }

  /**
   * Принудительное обновление записи
   */
  async refresh(key: string): Promise<boolean> {
    return await this.enhancedCache.refresh(key);
  }

  /**
   * Поиск записей по тегам
   */
  async findByTag(tag: string): Promise<string[]> {
    return await this.enhancedCache.findByTag(tag);
  }

  /**
   * Поиск записей по источнику
   */
  async findBySource(source: string): Promise<string[]> {
    return await this.enhancedCache.findBySource(source);
  }

  /**
   * Установить callback для автоматического обновления
   */
  setRefreshCallback(callback: (key: string) => Promise<unknown>): void {
    this.enhancedCache.setRefreshCallback(callback);
  }

  /**
   * Очистка ресурсов
   */
  dispose(): void {
    this.enhancedCache.dispose();
  }
}