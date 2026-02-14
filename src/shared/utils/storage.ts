import type { StorageAdapter } from '../types/calculator';

/**
 * Безопасный адаптер для localStorage с обработкой ошибок
 */
export class LocalStorageAdapter implements StorageAdapter {
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  private checkAvailability(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  get<T>(key: string, defaultValue: T): T {
    if (!this.isAvailable) {
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  }

  set<T>(key: string, value: T): void {
    if (!this.isAvailable) {
      return;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }

  remove(key: string): void {
    if (!this.isAvailable) {
      return;
    }

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }

  clear(): void {
    if (!this.isAvailable) {
      return;
    }

    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
  }

  /**
   * Получить все ключи с определенным префиксом
   */
  getKeysWithPrefix(prefix: string): string[] {
    if (!this.isAvailable) {
      return [];
    }

    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      console.warn('Error getting keys with prefix:', error);
      return [];
    }
  }

  /**
   * Удалить все ключи с определенным префиксом
   */
  removeKeysWithPrefix(prefix: string): void {
    const keys = this.getKeysWithPrefix(prefix);
    keys.forEach(key => this.remove(key));
  }

  /**
   * Получить размер хранилища в байтах
   */
  getSize(): number {
    if (!this.isAvailable) {
      return 0;
    }

    try {
      let size = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          size += key.length + (value?.length || 0);
        }
      }
      return size;
    } catch (error) {
      console.warn('Error calculating storage size:', error);
      return 0;
    }
  }
}

/**
 * Адаптер для sessionStorage
 */
export class SessionStorageAdapter implements StorageAdapter {
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  private checkAvailability(): boolean {
    try {
      const test = '__storage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  get<T>(key: string, defaultValue: T): T {
    if (!this.isAvailable) {
      return defaultValue;
    }

    try {
      const item = sessionStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return defaultValue;
    }
  }

  set<T>(key: string, value: T): void {
    if (!this.isAvailable) {
      return;
    }

    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error);
    }
  }

  remove(key: string): void {
    if (!this.isAvailable) {
      return;
    }

    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error);
    }
  }

  clear(): void {
    if (!this.isAvailable) {
      return;
    }

    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn('Error clearing sessionStorage:', error);
    }
  }
}

/**
 * In-memory адаптер для случаев, когда localStorage недоступен
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private storage = new Map<string, string>();

  get<T>(key: string, defaultValue: T): T {
    try {
      const item = this.storage.get(key);
      if (item === undefined) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`Error reading memory storage key "${key}":`, error);
      return defaultValue;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      this.storage.set(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting memory storage key "${key}":`, error);
    }
  }

  remove(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

/**
 * Фабрика для создания адаптера хранилища
 */
export function createStorageAdapter(type: 'local' | 'session' | 'memory' = 'local'): StorageAdapter {
  switch (type) {
    case 'session':
      return new SessionStorageAdapter();
    case 'memory':
      return new MemoryStorageAdapter();
    case 'local':
    default:
      return new LocalStorageAdapter();
  }
}

/**
 * Глобальный экземпляр localStorage адаптера
 */
export const storage = new LocalStorageAdapter();