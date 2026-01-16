// Адаптер для работы с API в условиях статического хостинга
// Поддерживает как внешние API, так и локальные данные

import { cache } from '../cache/redis';

// Конфигурация для разных окружений
interface ApiConfig {
  useExternalApi: boolean;
  supabaseUrl?: string;
  supabaseKey?: string;
  fallbackToLocal: boolean;
  mockData: boolean;
}

class ApiAdapter {
  private config: ApiConfig;

  constructor() {
    this.config = {
      useExternalApi: this.isExternalApiAvailable(),
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      fallbackToLocal: true,
      mockData: import.meta.env.DEV || !this.isExternalApiAvailable()
    };
  }

  private isExternalApiAvailable(): boolean {
    // Проверяем доступность внешнего API
    return !!(
      import.meta.env.VITE_SUPABASE_URL && 
      import.meta.env.VITE_SUPABASE_ANON_KEY &&
      !window.location.hostname.includes('github.io') &&
      !window.location.hostname.includes('schitay-online.ru')
    );
  }

  async getBanks(params: Record<string, unknown> = {}) {
    try {
      if (this.config.useExternalApi) {
        // Используем реальный API
        return await this.fetchFromSupabase('banks', params);
      } else {
        // Используем локальные данные
        return await this.getLocalBanks(params);
      }
    } catch (error) {
      console.warn('API недоступен, используем локальные данные:', error);
      return await this.getLocalBanks(params);
    }
  }

  async getProducts(filters: Record<string, unknown> = {}, pagination: Record<string, unknown> = {}) {
    try {
      if (this.config.useExternalApi) {
        return await this.fetchFromSupabase('bank_products', { ...filters, ...pagination });
      } else {
        return await this.getLocalProducts(filters, pagination);
      }
    } catch (error) {
      console.warn('API недоступен, используем локальные данные:', error);
      return await this.getLocalProducts(filters, pagination);
    }
  }

  async compareProducts(productIds: string[], userId?: string) {
    const cacheKey = `comparison:${productIds.sort().join(',')}`;
    
    // Проверяем кэш
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Получаем продукты для сравнения
      const products = await this.getProductsByIds(productIds);
      
      // Создаем матрицу сравнения
      const comparison = this.buildComparisonMatrix(products);
      
      // Кэшируем результат
      await cache.set(cacheKey, comparison, 5 * 60 * 1000);
      
      return comparison;
    } catch (error) {
      console.error('Ошибка сравнения продуктов:', error);
      throw error;
    }
  }

  private async fetchFromSupabase(table: string, params: Record<string, unknown>) {
    // Здесь будет реальный запрос к Supabase
    // Пока возвращаем заглушку
    throw new Error('Supabase API не настроен');
  }

  private async getLocalBanks(params: Record<string, unknown>) {
    // Локальные данные банков для демонстрации
    const mockBanks = [
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

    return mockBanks;
  }

  private async getLocalProducts(filters: Record<string, unknown>, pagination: Record<string, unknown>) {
    // Локальные данные продуктов для демонстрации
    const mockProducts = [
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
        updated_at: new Date().toISOString(),
        banks: {
          id: '1',
          name: 'Сбербанк',
          short_name: 'Сбербанк',
          logo_url: '/banks/sberbank.png',
          overall_rating: 4.2,
          is_partner: true
        }
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
        updated_at: new Date().toISOString(),
        banks: {
          id: '2',
          name: 'ВТБ',
          short_name: 'ВТБ',
          logo_url: '/banks/vtb.png',
          overall_rating: 4.0,
          is_partner: true
        }
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
        updated_at: new Date().toISOString(),
        banks: {
          id: '3',
          name: 'Альфа-Банк',
          short_name: 'Альфа-Банк',
          logo_url: '/banks/alfabank.png',
          overall_rating: 4.3,
          is_partner: true
        }
      }
    ];

    // Применяем фильтры
    let filtered = mockProducts;
    
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

    // Применяем пагинацию
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const offset = (page - 1) * limit;
    
    return filtered.slice(offset, offset + limit);
  }

  private async getProductsByIds(productIds: string[]) {
    const allProducts = await this.getLocalProducts({}, {});
    return allProducts.filter(p => productIds.includes(p.id));
  }

  private buildComparisonMatrix(products: Array<Record<string, unknown>>) {
    const headers = [
      'Банк',
      'Продукт', 
      'Процентная ставка',
      'Мин. сумма',
      'Макс. сумма',
      'Срок',
      'Рейтинг банка'
    ];

    const rows = products.map(product => ({
      productId: product.id,
      bank: product.banks.name,
      product: product.name,
      interestRate: product.interest_rate,
      minAmount: product.min_amount,
      maxAmount: product.max_amount,
      term: `${product.min_term}-${product.max_term} мес.`,
      bankRating: product.banks.overall_rating
    }));

    const highlights = this.highlightBestOptions(products);

    return {
      products,
      matrix: { headers, rows },
      highlights,
      timestamp: new Date().toISOString()
    };
  }

  private highlightBestOptions(products: Array<Record<string, unknown>>) {
    const highlights: Record<string, string> = {};
    
    // Лучшая процентная ставка для разных типов продуктов
    const mortgageProducts = products.filter(p => p.product_type === 'mortgage' || p.product_type === 'credit');
    const depositProducts = products.filter(p => p.product_type === 'deposit');
    
    if (mortgageProducts.length > 0) {
      const bestRate = Math.min(...mortgageProducts.map(p => p.interest_rate));
      const bestProduct = mortgageProducts.find(p => p.interest_rate === bestRate);
      if (bestProduct) highlights.bestRate = bestProduct.id;
    }
    
    if (depositProducts.length > 0) {
      const bestRate = Math.max(...depositProducts.map(p => p.interest_rate));
      const bestProduct = depositProducts.find(p => p.interest_rate === bestRate);
      if (bestProduct) highlights.bestDepositRate = bestProduct.id;
    }

    // Лучший рейтинг банка
    const bestRating = Math.max(...products.map(p => p.banks.overall_rating || 0));
    const bestRatedProduct = products.find(p => p.banks.overall_rating === bestRating);
    if (bestRatedProduct) highlights.bestRating = bestRatedProduct.id;

    return highlights;
  }

  // Методы для будущего расширения
  async saveUserProfile(profile: Record<string, unknown>) {
    // Сохраняем в localStorage для статического хостинга
    const key = `user_profile_${profile.userId}`;
    localStorage.setItem(key, JSON.stringify(profile));
    return profile;
  }

  async getUserProfile(userId: string) {
    const key = `user_profile_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  }

  async trackEvent(event: Record<string, unknown>) {
    // Для статического хостинга отправляем в Google Analytics или другую аналитику
    console.log('Tracking event:', event);
    
    // Можно интегрировать с Google Analytics, Mixpanel и т.д.
    if (typeof gtag !== 'undefined') {
      gtag('event', event.type, {
        event_category: event.category,
        event_label: event.label,
        value: event.value
      });
    }
  }

  getConfig() {
    return this.config;
  }
}

// Создаем глобальный экземпляр
export const apiAdapter = new ApiAdapter();

// Экспортируем для использования в компонентах
export default apiAdapter;