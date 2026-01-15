// Redis кэширование для системы сравнения и рекомендаций
// В production используется Redis, в development - localStorage

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // время жизни в миллисекундах
}

interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  keyPrefix: string;
}

class RedisCache {
  private config: CacheConfig;
  private memoryCache: Map<string, CacheItem<any>>;
  private isRedisAvailable: boolean = false;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 минут по умолчанию
      maxSize: 1000, // максимум 1000 записей в памяти
      keyPrefix: 'comparison_system:',
      ...config
    };
    
    this.memoryCache = new Map();
    this.initializeRedis();
  }

  private async initializeRedis() {
    // В production здесь будет подключение к Redis
    // Для development используем localStorage + память
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        this.isRedisAvailable = false; // используем localStorage
      }
    } catch (error) {
      console.warn('Redis/localStorage недоступен, используется только память:', error);
      this.isRedisAvailable = false;
    }
  }

  private getKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  private cleanupMemoryCache() {
    if (this.memoryCache.size <= this.config.maxSize) return;

    // Удаляем старые записи
    const entries = Array.from(this.memoryCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toDelete = entries.slice(0, Math.floor(this.config.maxSize * 0.2));
    toDelete.forEach(([key]) => this.memoryCache.delete(key));
  }

  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.getKey(key);

    try {
      // Сначала проверяем память
      const memoryItem = this.memoryCache.get(fullKey);
      if (memoryItem && !this.isExpired(memoryItem)) {
        return memoryItem.data as T;
      }

      // Затем localStorage (если доступен)
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(fullKey);
        if (stored) {
          const item: CacheItem<T> = JSON.parse(stored);
          if (!this.isExpired(item)) {
            // Восстанавливаем в память для быстрого доступа
            this.memoryCache.set(fullKey, item);
            return item.data;
          } else {
            // Удаляем устаревшую запись
            localStorage.removeItem(fullKey);
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Ошибка получения из кэша:', error);
      return null;
    }
  }

  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const fullKey = this.getKey(key);
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL
    };

    try {
      // Сохраняем в память
      this.memoryCache.set(fullKey, item);
      this.cleanupMemoryCache();

      // Сохраняем в localStorage (если доступен)
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(fullKey, JSON.stringify(item));
        } catch (storageError) {
          // localStorage может быть переполнен, очищаем старые записи
          this.clearExpiredFromStorage();
          try {
            localStorage.setItem(fullKey, JSON.stringify(item));
          } catch (retryError) {
            console.warn('Не удалось сохранить в localStorage:', retryError);
          }
        }
      }
    } catch (error) {
      console.error('Ошибка сохранения в кэш:', error);
    }
  }

  async delete(key: string): Promise<void> {
    const fullKey = this.getKey(key);

    try {
      this.memoryCache.delete(fullKey);
      
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(fullKey);
      }
    } catch (error) {
      console.error('Ошибка удаления из кэша:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      this.memoryCache.clear();
      
      if (typeof window !== 'undefined' && window.localStorage) {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(this.config.keyPrefix)) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error('Ошибка очистки кэша:', error);
    }
  }

  private clearExpiredFromStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.config.keyPrefix)) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const item: CacheItem<any> = JSON.parse(stored);
              if (this.isExpired(item)) {
                localStorage.removeItem(key);
              }
            }
          } catch (parseError) {
            // Удаляем поврежденные записи
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Ошибка очистки устаревших записей:', error);
    }
  }

  // Специальные методы для системы сравнения и рекомендаций
  async cacheProductComparison(productIds: string[], comparison: any, ttl = 10 * 60 * 1000) {
    const key = `comparison:${productIds.sort().join(',')}`;
    await this.set(key, comparison, ttl);
  }

  async getCachedProductComparison(productIds: string[]) {
    const key = `comparison:${productIds.sort().join(',')}`;
    return await this.get(key);
  }

  async cacheUserRecommendations(userId: string, recommendations: any[], ttl = 15 * 60 * 1000) {
    const key = `recommendations:${userId}`;
    await this.set(key, recommendations, ttl);
  }

  async getCachedUserRecommendations(userId: string) {
    const key = `recommendations:${userId}`;
    return await this.get(key);
  }

  async cacheBankProducts(productType: string, products: any[], ttl = 30 * 60 * 1000) {
    const key = `products:${productType}`;
    await this.set(key, products, ttl);
  }

  async getCachedBankProducts(productType: string) {
    const key = `products:${productType}`;
    return await this.get(key);
  }

  async cacheUserProfile(userId: string, profile: any, ttl = 60 * 60 * 1000) {
    const key = `profile:${userId}`;
    await this.set(key, profile, ttl);
  }

  async getCachedUserProfile(userId: string) {
    const key = `profile:${userId}`;
    return await this.get(key);
  }

  // Статистика кэша
  getStats() {
    const memorySize = this.memoryCache.size;
    let localStorageSize = 0;
    
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = Object.keys(localStorage);
      localStorageSize = keys.filter(key => key.startsWith(this.config.keyPrefix)).length;
    }

    return {
      memorySize,
      localStorageSize,
      maxSize: this.config.maxSize,
      defaultTTL: this.config.defaultTTL,
      isRedisAvailable: this.isRedisAvailable
    };
  }
}

// Создаем глобальный экземпляр кэша
export const cache = new RedisCache({
  defaultTTL: 5 * 60 * 1000, // 5 минут
  maxSize: 1000,
  keyPrefix: 'comparison_system:'
});

// Экспортируем класс для создания дополнительных экземпляров
export { RedisCache };

// Типы для экспорта
export interface CacheStats {
  memorySize: number;
  localStorageSize: number;
  maxSize: number;
  defaultTTL: number;
  isRedisAvailable: boolean;
}