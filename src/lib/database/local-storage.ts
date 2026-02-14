// Локальная база данных для статического хостинга
// Использует localStorage + IndexedDB для хранения данных

import type {
  Bank,
  Product,
  UserProfile,
  Comparison,
  AnalyticsEvent,
  LocalStorageDB,
  ProductFilters
} from '../../types/database';

class LocalDatabase {
  private dbName = 'comparison_system_db';
  private version = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        console.warn('IndexedDB недоступен, используется только localStorage');
        resolve();
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Ошибка открытия IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Создаем объектные хранилища
        if (!db.objectStoreNames.contains('banks')) {
          db.createObjectStore('banks', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('products')) {
          const productsStore = db.createObjectStore('products', { keyPath: 'id' });
          productsStore.createIndex('bank_id', 'bank_id', { unique: false });
          productsStore.createIndex('product_type', 'product_type', { unique: false });
        }

        if (!db.objectStoreNames.contains('userProfiles')) {
          db.createObjectStore('userProfiles', { keyPath: 'userId' });
        }

        if (!db.objectStoreNames.contains('comparisons')) {
          const comparisonsStore = db.createObjectStore('comparisons', { keyPath: 'id' });
          comparisonsStore.createIndex('user_id', 'user_id', { unique: false });
        }

        if (!db.objectStoreNames.contains('recommendations')) {
          const recommendationsStore = db.createObjectStore('recommendations', { keyPath: 'id' });
          recommendationsStore.createIndex('user_id', 'user_id', { unique: false });
        }

        if (!db.objectStoreNames.contains('analytics')) {
          const analyticsStore = db.createObjectStore('analytics', { keyPath: 'id' });
          analyticsStore.createIndex('event_type', 'event_type', { unique: false });
        }
      };
    });
  }

  // Методы для работы с банками
  async getBanks(): Promise<Bank[]> {
    try {
      if (this.db) {
        return await this.getFromIndexedDB('banks');
      }
      return this.getFromLocalStorage('banks', []);
    } catch (error) {
      console.error('Ошибка получения банков:', error);
      return this.getFromLocalStorage('banks', []);
    }
  }

  async saveBanks(banks: Bank[]): Promise<void> {
    try {
      if (this.db) {
        await this.saveToIndexedDB('banks', banks);
      }
      this.saveToLocalStorage('banks', banks);
    } catch (error) {
      console.error('Ошибка сохранения банков:', error);
      this.saveToLocalStorage('banks', banks);
    }
  }

  // Методы для работы с продуктами
  async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    try {
      let products: Product[];
      
      if (this.db) {
        products = await this.getFromIndexedDB('products');
      } else {
        products = this.getFromLocalStorage('products', []);
      }

      // Применяем фильтры
      return this.applyFilters(products, filters);
    } catch (error) {
      console.error('Ошибка получения продуктов:', error);
      return [];
    }
  }

  async saveProducts(products: Product[]): Promise<void> {
    try {
      if (this.db) {
        await this.saveToIndexedDB('products', products);
      }
      this.saveToLocalStorage('products', products);
    } catch (error) {
      console.error('Ошибка сохранения продуктов:', error);
      this.saveToLocalStorage('products', products);
    }
  }

  // Методы для работы с профилями пользователей
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      if (this.db) {
        const profiles = await this.getFromIndexedDB('userProfiles') as UserProfile[];
        return profiles.find((p: UserProfile) => p.userId === userId) || null;
      }
      
      const profiles = this.getFromLocalStorage('userProfiles', {});
      return profiles[userId] || null;
    } catch (error) {
      console.error('Ошибка получения профиля:', error);
      return null;
    }
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      if (this.db) {
        const transaction = this.db.transaction(['userProfiles'], 'readwrite');
        const store = transaction.objectStore('userProfiles');
        await store.put(profile);
      }
      
      const profiles = this.getFromLocalStorage('userProfiles', {});
      profiles[profile.userId] = profile;
      this.saveToLocalStorage('userProfiles', profiles);
    } catch (error) {
      console.error('Ошибка сохранения профиля:', error);
      const profiles = this.getFromLocalStorage('userProfiles', {});
      profiles[profile.userId] = profile;
      this.saveToLocalStorage('userProfiles', profiles);
    }
  }

  // Методы для работы с сравнениями
  async saveComparison(comparison: Omit<Comparison, 'id' | 'created_at'>): Promise<void> {
    try {
      const fullComparison: Comparison = {
        ...comparison,
        id: this.generateId(),
        created_at: new Date().toISOString()
      };
      
      if (this.db) {
        const transaction = this.db.transaction(['comparisons'], 'readwrite');
        const store = transaction.objectStore('comparisons');
        await store.add(fullComparison);
      }
      
      const comparisons = this.getFromLocalStorage('comparisons', []);
      comparisons.push(fullComparison);
      this.saveToLocalStorage('comparisons', comparisons);
    } catch (error) {
      console.error('Ошибка сохранения сравнения:', error);
    }
  }

  async getUserComparisons(userId: string): Promise<Comparison[]> {
    try {
      if (this.db) {
        const comparisons = await this.getFromIndexedDB('comparisons') as Comparison[];
        return comparisons.filter((c: Comparison) => c.user_id === userId);
      }
      
      const comparisons = this.getFromLocalStorage('comparisons', []) as Comparison[];
      return comparisons.filter((c: Comparison) => c.user_id === userId);
    } catch (error) {
      console.error('Ошибка получения сравнений:', error);
      return [];
    }
  }

  // Методы для работы с аналитикой
  async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const fullEvent: AnalyticsEvent = {
        ...event,
        id: this.generateId(),
        timestamp: new Date().toISOString()
      };
      
      if (this.db) {
        const transaction = this.db.transaction(['analytics'], 'readwrite');
        const store = transaction.objectStore('analytics');
        await store.add(fullEvent);
      }
      
      const analytics = this.getFromLocalStorage('analytics', []);
      analytics.push(fullEvent);
      
      // Ограничиваем размер аналитики в localStorage
      if (analytics.length > 1000) {
        analytics.splice(0, analytics.length - 1000);
      }
      
      this.saveToLocalStorage('analytics', analytics);
    } catch (error) {
      console.error('Ошибка сохранения события:', error);
    }
  }

  // Вспомогательные методы
  private async getFromIndexedDB(storeName: string): Promise<unknown[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB не инициализирован'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async saveToIndexedDB(storeName: string, data: unknown[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB не инициализирован'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // Очищаем хранилище и добавляем новые данные
      store.clear();
      data.forEach(item => store.add(item));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  private getFromLocalStorage<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(`${this.dbName}_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error(`Ошибка чтения из localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  private saveToLocalStorage(key: string, data: unknown): void {
    try {
      localStorage.setItem(`${this.dbName}_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error(`Ошибка записи в localStorage (${key}):`, error);
      
      // Если localStorage переполнен, очищаем старые данные
      if (error instanceof DOMException && error.code === 22) {
        this.clearOldData();
        try {
          localStorage.setItem(`${this.dbName}_${key}`, JSON.stringify(data));
        } catch (retryError) {
          console.error('Не удалось сохранить даже после очистки:', retryError);
        }
      }
    }
  }

  private applyFilters(products: Product[], filters: ProductFilters): Product[] {
    let filtered = [...products];

    if (filters.productType) {
      filtered = filtered.filter(p => p.product_type === filters.productType);
    }
    if (filters.bankId) {
      filtered = filtered.filter(p => p.bank_id === filters.bankId);
    }
    if (filters.minRate !== undefined) {
      filtered = filtered.filter(p => p.interest_rate >= filters.minRate);
    }
    if (filters.maxRate !== undefined) {
      filtered = filtered.filter(p => p.interest_rate <= filters.maxRate);
    }
    if (filters.region) {
      filtered = filtered.filter(p => 
        p.available_regions.includes('all') || 
        p.available_regions.includes(filters.region)
      );
    }
    if (filters.isActive !== undefined) {
      filtered = filtered.filter(p => p.is_active === filters.isActive);
    }

    return filtered;
  }

  private clearOldData(): void {
    try {
      const keys = Object.keys(localStorage);
      const dbKeys = keys.filter(key => key.startsWith(this.dbName));
      
      // Удаляем аналитику (самые объемные данные)
      const analyticsKey = `${this.dbName}_analytics`;
      if (localStorage.getItem(analyticsKey)) {
        localStorage.removeItem(analyticsKey);
      }
      
      // Удаляем старые сравнения
      const comparisonsKey = `${this.dbName}_comparisons`;
      const comparisons = this.getFromLocalStorage('comparisons', []);
      if (comparisons.length > 50) {
        const recent = comparisons.slice(-50);
        this.saveToLocalStorage('comparisons', recent);
      }
    } catch (error) {
      console.error('Ошибка очистки старых данных:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Методы для инициализации данных
  async initializeWithMockData(): Promise<void> {
    const banks = await this.getBanks();
    if (banks.length === 0) {
      await this.saveBanks(this.getMockBanks());
    }

    const products = await this.getProducts();
    if (products.length === 0) {
      await this.saveProducts(this.getMockProducts());
    }
  }

  private getMockBanks(): Bank[] {
    return [
      {
        id: '1',
        name: 'Сбербанк',
        short_name: 'Сбербанк',
        logo_url: '/banks/sberbank.png',
        website_url: 'https://sberbank.ru',
        overall_rating: 4.2,
        customer_service_rating: 4.0,
        reliability_rating: 4.5,
        processing_speed_rating: 4.1,
        is_partner: true,
        commission_rate: 0.15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'ВТБ',
        short_name: 'ВТБ',
        logo_url: '/banks/vtb.png',
        website_url: 'https://vtb.ru',
        overall_rating: 4.0,
        customer_service_rating: 3.8,
        reliability_rating: 4.2,
        processing_speed_rating: 3.9,
        is_partner: true,
        commission_rate: 0.12,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Альфа-Банк',
        short_name: 'Альфа-Банк',
        logo_url: '/banks/alfabank.png',
        website_url: 'https://alfabank.ru',
        overall_rating: 4.3,
        customer_service_rating: 4.2,
        reliability_rating: 4.1,
        processing_speed_rating: 4.4,
        is_partner: true,
        commission_rate: 0.18,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  private getMockProducts(): Product[] {
    return [
      {
        id: '1',
        bank_id: '1',
        product_type: 'mortgage',
        name: 'Ипотека на готовое жилье',
        description: 'Кредит на покупку готового жилья на вторичном рынке',
        interest_rate: 16.5,
        min_amount: 500000,
        max_amount: 30000000,
        min_term: 12,
        max_term: 360,
        fees: { application: 0, monthly: 0 },
        requirements: { min_income: 50000, min_age: 21 },
        features: { early_repayment: true, grace_period: false },
        available_regions: ['moscow', 'spb', 'all'],
        is_active: true,
        is_featured: true,
        priority: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        bank_id: '2',
        product_type: 'mortgage',
        name: 'Ипотека Победа над процентами',
        description: 'Специальная программа ипотечного кредитования',
        interest_rate: 15.9,
        min_amount: 600000,
        max_amount: 25000000,
        min_term: 12,
        max_term: 300,
        fees: { application: 1000, monthly: 0 },
        requirements: { min_income: 45000, min_age: 23 },
        features: { early_repayment: true, grace_period: true },
        available_regions: ['moscow', 'spb', 'regions'],
        is_active: true,
        is_featured: true,
        priority: 8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        bank_id: '3',
        product_type: 'deposit',
        name: 'Альфа-Депозит',
        description: 'Выгодный вклад с возможностью пополнения',
        interest_rate: 18.5,
        min_amount: 10000,
        max_amount: 50000000,
        min_term: 3,
        max_term: 36,
        fees: {},
        requirements: { min_age: 18 },
        features: { capitalization: true, replenishment: true },
        available_regions: ['all'],
        is_active: true,
        is_featured: true,
        priority: 9,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  // Методы для экспорта/импорта данных
  async exportData(): Promise<LocalStorageDB> {
    return {
      banks: await this.getBanks(),
      products: await this.getProducts(),
      userProfiles: this.getFromLocalStorage('userProfiles', {}),
      comparisons: this.getFromLocalStorage('comparisons', []),
      recommendations: this.getFromLocalStorage('recommendations', []),
      analytics: this.getFromLocalStorage('analytics', [])
    };
  }

  async importData(data: Partial<LocalStorageDB>): Promise<void> {
    if (data.banks) await this.saveBanks(data.banks);
    if (data.products) await this.saveProducts(data.products);
    if (data.userProfiles) this.saveToLocalStorage('userProfiles', data.userProfiles);
    if (data.comparisons) this.saveToLocalStorage('comparisons', data.comparisons);
    if (data.recommendations) this.saveToLocalStorage('recommendations', data.recommendations);
    if (data.analytics) this.saveToLocalStorage('analytics', data.analytics);
  }
}

// Создаем глобальный экземпляр
export const localDB = new LocalDatabase();

// Инициализируем с тестовыми данными при первом запуске
localDB.initializeWithMockData().catch(console.error);

export default localDB;