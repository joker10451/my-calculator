/**
 * Репозиторий для работы с банками и банковскими продуктами
 * Поддерживает как Supabase, так и локальное хранение
 */

import { supabase, handleDatabaseError } from './supabase';
import { localDB } from './local-storage';
import type {
  Bank,
  BankCreateData,
  BankUpdateData,
  BankProduct,
  BankProductCreateData,
  BankProductUpdateData,
  ProductFilters,
  ProductSortOptions,
  ProductSearchResult,
  QueryOptions,
  ValidationResult,
  ValidationError,
  DataSourceConfig,
  BankStatistics
} from '../../types/bank';

/**
 * Конфигурация источника данных
 */
const dataSourceConfig: DataSourceConfig = {
  type: (import.meta.env.VITE_USE_SUPABASE === 'true') ? 'supabase' : 'local',
  fallback_enabled: true,
  cache_ttl: 300, // 5 минут
  retry_attempts: 3,
  timeout: 10000 // 10 секунд
};

/**
 * Класс для валидации данных банков и продуктов
 */
export class BankDataValidator {
  /**
   * Валидация данных банка
   */
  static validateBank(data: BankCreateData | BankUpdateData): ValidationResult {
    const errors: ValidationError[] = [];

    // Проверка обязательных полей для создания
    if ('name' in data) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push({
          field: 'name',
          message: 'Название банка обязательно',
          code: 'REQUIRED',
          value: data.name
        });
      } else if (data.name.length > 255) {
        errors.push({
          field: 'name',
          message: 'Название банка не должно превышать 255 символов',
          code: 'MAX_LENGTH',
          value: data.name
        });
      }
    }

    if ('short_name' in data) {
      if (!data.short_name || data.short_name.trim().length === 0) {
        errors.push({
          field: 'short_name',
          message: 'Короткое название банка обязательно',
          code: 'REQUIRED',
          value: data.short_name
        });
      } else if (data.short_name.length > 100) {
        errors.push({
          field: 'short_name',
          message: 'Короткое название не должно превышать 100 символов',
          code: 'MAX_LENGTH',
          value: data.short_name
        });
      }
    }

    // Валидация рейтингов
    const ratingFields = ['overall_rating', 'customer_service_rating', 'reliability_rating', 'processing_speed_rating'];
    ratingFields.forEach(field => {
      const value = (data as any)[field];
      if (value !== undefined && value !== null) {
        if (typeof value !== 'number' || value < 0 || value > 5) {
          errors.push({
            field,
            message: 'Рейтинг должен быть числом от 0 до 5',
            code: 'INVALID_RANGE',
            value
          });
        }
      }
    });

    // Валидация комиссии
    if (data.commission_rate !== undefined && data.commission_rate !== null) {
      if (typeof data.commission_rate !== 'number' || data.commission_rate < 0 || data.commission_rate > 100) {
        errors.push({
          field: 'commission_rate',
          message: 'Комиссия должна быть числом от 0 до 100',
          code: 'INVALID_RANGE',
          value: data.commission_rate
        });
      }
    }

    // Валидация email
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push({
        field: 'email',
        message: 'Некорректный формат email',
        code: 'INVALID_FORMAT',
        value: data.email
      });
    }

    // Валидация URL
    if (data.website_url && !this.isValidUrl(data.website_url)) {
      errors.push({
        field: 'website_url',
        message: 'Некорректный формат URL',
        code: 'INVALID_FORMAT',
        value: data.website_url
      });
    }

    if (data.logo_url && !this.isValidUrl(data.logo_url)) {
      errors.push({
        field: 'logo_url',
        message: 'Некорректный формат URL логотипа',
        code: 'INVALID_FORMAT',
        value: data.logo_url
      });
    }

    return {
      is_valid: errors.length === 0,
      errors
    };
  }

  /**
   * Валидация данных продукта
   */
  static validateProduct(data: BankProductCreateData | BankProductUpdateData): ValidationResult {
    const errors: ValidationError[] = [];

    // Проверка обязательных полей
    if ('bank_id' in data && (!data.bank_id || data.bank_id.trim().length === 0)) {
      errors.push({
        field: 'bank_id',
        message: 'ID банка обязателен',
        code: 'REQUIRED',
        value: data.bank_id
      });
    }

    if ('product_type' in data) {
      const validTypes = ['mortgage', 'deposit', 'credit', 'insurance'];
      if (!validTypes.includes(data.product_type)) {
        errors.push({
          field: 'product_type',
          message: 'Некорректный тип продукта',
          code: 'INVALID_VALUE',
          value: data.product_type
        });
      }
    }

    if ('name' in data) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push({
          field: 'name',
          message: 'Название продукта обязательно',
          code: 'REQUIRED',
          value: data.name
        });
      } else if (data.name.length > 255) {
        errors.push({
          field: 'name',
          message: 'Название продукта не должно превышать 255 символов',
          code: 'MAX_LENGTH',
          value: data.name
        });
      }
    }

    // Валидация процентной ставки
    if ('interest_rate' in data) {
      if (typeof data.interest_rate !== 'number' || data.interest_rate < 0) {
        errors.push({
          field: 'interest_rate',
          message: 'Процентная ставка должна быть положительным числом',
          code: 'INVALID_VALUE',
          value: data.interest_rate
        });
      }
    }

    // Валидация сумм
    if (data.min_amount !== undefined && data.min_amount !== null) {
      if (typeof data.min_amount !== 'number' || data.min_amount < 0) {
        errors.push({
          field: 'min_amount',
          message: 'Минимальная сумма должна быть положительным числом',
          code: 'INVALID_VALUE',
          value: data.min_amount
        });
      }
    }

    if (data.max_amount !== undefined && data.max_amount !== null) {
      if (typeof data.max_amount !== 'number' || data.max_amount < 0) {
        errors.push({
          field: 'max_amount',
          message: 'Максимальная сумма должна быть положительным числом',
          code: 'INVALID_VALUE',
          value: data.max_amount
        });
      }
    }

    // Проверка логики min/max сумм
    if (data.min_amount && data.max_amount && data.min_amount > data.max_amount) {
      errors.push({
        field: 'max_amount',
        message: 'Максимальная сумма не может быть меньше минимальной',
        code: 'INVALID_RANGE',
        value: data.max_amount
      });
    }

    // Валидация сроков
    if (data.min_term !== undefined && data.min_term !== null) {
      if (typeof data.min_term !== 'number' || data.min_term <= 0) {
        errors.push({
          field: 'min_term',
          message: 'Минимальный срок должен быть положительным числом',
          code: 'INVALID_VALUE',
          value: data.min_term
        });
      }
    }

    if (data.max_term !== undefined && data.max_term !== null) {
      if (typeof data.max_term !== 'number' || data.max_term <= 0) {
        errors.push({
          field: 'max_term',
          message: 'Максимальный срок должен быть положительным числом',
          code: 'INVALID_VALUE',
          value: data.max_term
        });
      }
    }

    // Проверка логики min/max сроков
    if (data.min_term && data.max_term && data.min_term > data.max_term) {
      errors.push({
        field: 'max_term',
        message: 'Максимальный срок не может быть меньше минимального',
        code: 'INVALID_RANGE',
        value: data.max_term
      });
    }

    // Валидация промо-ставки
    if (data.promotional_rate !== undefined && data.promotional_rate !== null) {
      if (typeof data.promotional_rate !== 'number' || data.promotional_rate < 0) {
        errors.push({
          field: 'promotional_rate',
          message: 'Промо-ставка должна быть положительным числом',
          code: 'INVALID_VALUE',
          value: data.promotional_rate
        });
      }
    }

    // Валидация даты окончания промо
    if (data.promo_valid_until) {
      const promoDate = new Date(data.promo_valid_until);
      if (isNaN(promoDate.getTime())) {
        errors.push({
          field: 'promo_valid_until',
          message: 'Некорректная дата окончания промо',
          code: 'INVALID_FORMAT',
          value: data.promo_valid_until
        });
      } else if (promoDate <= new Date()) {
        errors.push({
          field: 'promo_valid_until',
          message: 'Дата окончания промо должна быть в будущем',
          code: 'INVALID_VALUE',
          value: data.promo_valid_until
        });
      }
    }

    // Валидация приоритета
    if (data.priority !== undefined && data.priority !== null) {
      if (typeof data.priority !== 'number' || data.priority < 0) {
        errors.push({
          field: 'priority',
          message: 'Приоритет должен быть неотрицательным числом',
          code: 'INVALID_VALUE',
          value: data.priority
        });
      }
    }

    return {
      is_valid: errors.length === 0,
      errors
    };
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Репозиторий для работы с банками
 */
export class BankRepository {
  /**
   * Получить все банки
   */
  static async getBanks(options: QueryOptions = {}): Promise<Bank[]> {
    try {
      if (dataSourceConfig.type === 'supabase') {
        return await this.getBanksFromSupabase(options);
      } else {
        return await this.getBanksFromLocal(options);
      }
    } catch (error) {
      console.error('Ошибка получения банков:', error);
      
      if (dataSourceConfig.fallback_enabled && dataSourceConfig.type === 'supabase') {
        console.log('Переключение на локальное хранилище');
        return await this.getBanksFromLocal(options);
      }
      
      throw error;
    }
  }

  /**
   * Получить банк по ID
   */
  static async getBankById(id: string): Promise<Bank | null> {
    try {
      if (dataSourceConfig.type === 'supabase') {
        const { data, error } = await supabase
          .from('banks')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return null; // Банк не найден
          }
          handleDatabaseError(error);
        }

        return data;
      } else {
        const banks = await localDB.getBanks();
        return banks.find(bank => bank.id === id) || null;
      }
    } catch (error) {
      console.error('Ошибка получения банка:', error);
      
      if (dataSourceConfig.fallback_enabled && dataSourceConfig.type === 'supabase') {
        const banks = await localDB.getBanks();
        return banks.find(bank => bank.id === id) || null;
      }
      
      throw error;
    }
  }

  /**
   * Создать новый банк
   */
  static async createBank(data: BankCreateData): Promise<Bank> {
    // Валидация данных
    const validation = BankDataValidator.validateBank(data);
    if (!validation.is_valid) {
      throw new Error(`Ошибка валидации: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    try {
      if (dataSourceConfig.type === 'supabase') {
        const { data: bank, error } = await supabase
          .from('banks')
          .insert([data])
          .select()
          .single();

        if (error) {
          handleDatabaseError(error);
        }

        return bank;
      } else {
        const banks = await localDB.getBanks();
        const newBank: Bank = {
          id: this.generateId(),
          ...data,
          is_partner: data.is_partner ?? false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        banks.push(newBank);
        await localDB.saveBanks(banks);
        return newBank;
      }
    } catch (error) {
      console.error('Ошибка создания банка:', error);
      throw error;
    }
  }

  /**
   * Обновить банк
   */
  static async updateBank(id: string, data: BankUpdateData): Promise<Bank> {
    // Валидация данных
    const validation = BankDataValidator.validateBank(data);
    if (!validation.is_valid) {
      throw new Error(`Ошибка валидации: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    try {
      if (dataSourceConfig.type === 'supabase') {
        const { data: bank, error } = await supabase
          .from('banks')
          .update(data)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          handleDatabaseError(error);
        }

        return bank;
      } else {
        const banks = await localDB.getBanks();
        const index = banks.findIndex(bank => bank.id === id);
        
        if (index === -1) {
          throw new Error('Банк не найден');
        }

        banks[index] = {
          ...banks[index],
          ...data,
          updated_at: new Date().toISOString()
        };
        
        await localDB.saveBanks(banks);
        return banks[index];
      }
    } catch (error) {
      console.error('Ошибка обновления банка:', error);
      throw error;
    }
  }

  /**
   * Удалить банк
   */
  static async deleteBank(id: string): Promise<void> {
    try {
      if (dataSourceConfig.type === 'supabase') {
        const { error } = await supabase
          .from('banks')
          .delete()
          .eq('id', id);

        if (error) {
          handleDatabaseError(error);
        }
      } else {
        const banks = await localDB.getBanks();
        const filteredBanks = banks.filter(bank => bank.id !== id);
        await localDB.saveBanks(filteredBanks);
      }
    } catch (error) {
      console.error('Ошибка удаления банка:', error);
      throw error;
    }
  }

  /**
   * Получить статистику по банкам
   */
  static async getBankStatistics(): Promise<BankStatistics> {
    try {
      const banks = await this.getBanks();
      const products = await BankProductRepository.getProducts();

      const productsByType = products.reduce((acc, product) => {
        acc[product.product_type] = (acc[product.product_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const averageRates = products.reduce((acc, product) => {
        if (!acc[product.product_type]) {
          acc[product.product_type] = { sum: 0, count: 0 };
        }
        acc[product.product_type].sum += product.interest_rate;
        acc[product.product_type].count += 1;
        return acc;
      }, {} as Record<string, { sum: number; count: number }>);

      const avgRates = Object.entries(averageRates).reduce((acc, [type, data]) => {
        acc[type as any] = data.sum / data.count;
        return acc;
      }, {} as Record<string, number>);

      const topRatedBanks = banks
        .filter(bank => bank.overall_rating)
        .sort((a, b) => (b.overall_rating || 0) - (a.overall_rating || 0))
        .slice(0, 5);

      return {
        total_banks: banks.length,
        partner_banks: banks.filter(bank => bank.is_partner).length,
        total_products: products.length,
        active_products: products.filter(product => product.is_active).length,
        products_by_type: productsByType as any,
        average_rates: avgRates as any,
        top_rated_banks: topRatedBanks
      };
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      throw error;
    }
  }

  // Приватные методы для работы с Supabase
  private static async getBanksFromSupabase(options: QueryOptions): Promise<Bank[]> {
    let query = supabase.from('banks').select('*');

    if (options.sort) {
      query = query.order(options.sort.field, { ascending: options.sort.direction === 'asc' });
    } else {
      query = query.order('name', { ascending: true });
    }

    if (options.page && options.page_size) {
      const from = (options.page - 1) * options.page_size;
      const to = from + options.page_size - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;

    if (error) {
      handleDatabaseError(error);
    }

    return data || [];
  }

  // Приватные методы для работы с локальным хранилищем
  private static async getBanksFromLocal(options: QueryOptions): Promise<Bank[]> {
    let banks = await localDB.getBanks();

    if (options.sort) {
      banks.sort((a, b) => {
        const aValue = (a as any)[options.sort!.field];
        const bValue = (b as any)[options.sort!.field];
        
        if (options.sort!.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    if (options.page && options.page_size) {
      const start = (options.page - 1) * options.page_size;
      const end = start + options.page_size;
      banks = banks.slice(start, end);
    }

    return banks;
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

/**
 * Репозиторий для работы с банковскими продуктами
 */
export class BankProductRepository {
  /**
   * Получить продукты с фильтрацией и пагинацией
   */
  static async getProducts(
    filters: ProductFilters = {},
    options: QueryOptions = {}
  ): Promise<BankProduct[]> {
    try {
      if (dataSourceConfig.type === 'supabase') {
        return await this.getProductsFromSupabase(filters, options);
      } else {
        return await this.getProductsFromLocal(filters, options);
      }
    } catch (error) {
      console.error('Ошибка получения продуктов:', error);
      
      if (dataSourceConfig.fallback_enabled && dataSourceConfig.type === 'supabase') {
        console.log('Переключение на локальное хранилище');
        return await this.getProductsFromLocal(filters, options);
      }
      
      throw error;
    }
  }

  /**
   * Поиск продуктов с пагинацией
   */
  static async searchProducts(
    filters: ProductFilters = {},
    options: QueryOptions = {}
  ): Promise<ProductSearchResult> {
    try {
      const products = await this.getProducts(filters, options);
      const totalProducts = await this.getProducts(filters, { ...options, page: undefined, page_size: undefined });
      
      const page = options.page || 1;
      const pageSize = options.page_size || 20;
      const totalCount = totalProducts.length;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        products,
        total_count: totalCount,
        page,
        page_size: pageSize,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
      };
    } catch (error) {
      console.error('Ошибка поиска продуктов:', error);
      throw error;
    }
  }

  /**
   * Получить продукт по ID
   */
  static async getProductById(id: string, includeBank = false): Promise<BankProduct | null> {
    try {
      if (dataSourceConfig.type === 'supabase') {
        let query = supabase.from('bank_products').select('*');
        
        if (includeBank) {
          query = query.select('*, bank:banks(*)');
        }
        
        const { data, error } = await query.eq('id', id).single();

        if (error) {
          if (error.code === 'PGRST116') {
            return null;
          }
          handleDatabaseError(error);
        }

        return data;
      } else {
        const products = await localDB.getProducts();
        const product = products.find(p => p.id === id);
        
        if (!product) {
          return null;
        }

        if (includeBank) {
          const banks = await localDB.getBanks();
          const bank = banks.find(b => b.id === product.bank_id);
          return { ...product, bank };
        }

        return product;
      }
    } catch (error) {
      console.error('Ошибка получения продукта:', error);
      
      if (dataSourceConfig.fallback_enabled && dataSourceConfig.type === 'supabase') {
        const products = await localDB.getProducts();
        return products.find(p => p.id === id) || null;
      }
      
      throw error;
    }
  }

  /**
   * Создать новый продукт
   */
  static async createProduct(data: BankProductCreateData): Promise<BankProduct> {
    // Валидация данных
    const validation = BankDataValidator.validateProduct(data);
    if (!validation.is_valid) {
      throw new Error(`Ошибка валидации: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    try {
      if (dataSourceConfig.type === 'supabase') {
        const { data: product, error } = await supabase
          .from('bank_products')
          .insert([{
            ...data,
            fees: data.fees || {},
            requirements: data.requirements || {},
            features: data.features || {},
            available_regions: data.available_regions || ['all'],
            is_active: data.is_active ?? true,
            is_featured: data.is_featured ?? false,
            priority: data.priority ?? 0
          }])
          .select()
          .single();

        if (error) {
          handleDatabaseError(error);
        }

        return product;
      } else {
        const products = await localDB.getProducts();
        const newProduct: BankProduct = {
          id: this.generateId(),
          ...data,
          fees: data.fees || {},
          requirements: data.requirements || {},
          features: data.features || {},
          available_regions: data.available_regions || ['all'],
          is_active: data.is_active ?? true,
          is_featured: data.is_featured ?? false,
          priority: data.priority ?? 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        products.push(newProduct);
        await localDB.saveProducts(products);
        return newProduct;
      }
    } catch (error) {
      console.error('Ошибка создания продукта:', error);
      throw error;
    }
  }

  /**
   * Обновить продукт
   */
  static async updateProduct(id: string, data: BankProductUpdateData): Promise<BankProduct> {
    // Валидация данных
    const validation = BankDataValidator.validateProduct(data);
    if (!validation.is_valid) {
      throw new Error(`Ошибка валидации: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    try {
      if (dataSourceConfig.type === 'supabase') {
        const { data: product, error } = await supabase
          .from('bank_products')
          .update(data)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          handleDatabaseError(error);
        }

        return product;
      } else {
        const products = await localDB.getProducts();
        const index = products.findIndex(product => product.id === id);
        
        if (index === -1) {
          throw new Error('Продукт не найден');
        }

        products[index] = {
          ...products[index],
          ...data,
          updated_at: new Date().toISOString()
        };
        
        await localDB.saveProducts(products);
        return products[index];
      }
    } catch (error) {
      console.error('Ошибка обновления продукта:', error);
      throw error;
    }
  }

  /**
   * Удалить продукт
   */
  static async deleteProduct(id: string): Promise<void> {
    try {
      if (dataSourceConfig.type === 'supabase') {
        const { error } = await supabase
          .from('bank_products')
          .delete()
          .eq('id', id);

        if (error) {
          handleDatabaseError(error);
        }
      } else {
        const products = await localDB.getProducts();
        const filteredProducts = products.filter(product => product.id !== id);
        await localDB.saveProducts(filteredProducts);
      }
    } catch (error) {
      console.error('Ошибка удаления продукта:', error);
      throw error;
    }
  }

  // Приватные методы для работы с Supabase
  private static async getProductsFromSupabase(
    filters: ProductFilters,
    options: QueryOptions
  ): Promise<BankProduct[]> {
    let query = supabase.from('bank_products').select('*');

    // Применяем фильтры
    if (filters.product_type) {
      query = query.eq('product_type', filters.product_type);
    }
    if (filters.bank_id) {
      query = query.eq('bank_id', filters.bank_id);
    }
    if (filters.min_rate !== undefined) {
      query = query.gte('interest_rate', filters.min_rate);
    }
    if (filters.max_rate !== undefined) {
      query = query.lte('interest_rate', filters.max_rate);
    }
    if (filters.min_amount !== undefined) {
      query = query.gte('min_amount', filters.min_amount);
    }
    if (filters.max_amount !== undefined) {
      query = query.lte('max_amount', filters.max_amount);
    }
    if (filters.region) {
      query = query.contains('available_regions', [filters.region]);
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }
    if (filters.search_query) {
      query = query.textSearch('name', filters.search_query);
    }

    // Сортировка
    if (options.sort) {
      query = query.order(options.sort.field, { ascending: options.sort.direction === 'asc' });
    } else {
      query = query.order('priority', { ascending: false }).order('name', { ascending: true });
    }

    // Пагинация
    if (options.page && options.page_size) {
      const from = (options.page - 1) * options.page_size;
      const to = from + options.page_size - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;

    if (error) {
      handleDatabaseError(error);
    }

    return data || [];
  }

  // Приватные методы для работы с локальным хранилищем
  private static async getProductsFromLocal(
    filters: ProductFilters,
    options: QueryOptions
  ): Promise<BankProduct[]> {
    let products = await localDB.getProducts(filters);

    // Дополнительная фильтрация
    if (filters.search_query) {
      const query = filters.search_query.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query))
      );
    }

    // Сортировка
    if (options.sort) {
      products.sort((a, b) => {
        const aValue = (a as any)[options.sort!.field];
        const bValue = (b as any)[options.sort!.field];
        
        if (options.sort!.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    } else {
      products.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.name.localeCompare(b.name);
      });
    }

    // Пагинация
    if (options.page && options.page_size) {
      const start = (options.page - 1) * options.page_size;
      const end = start + options.page_size;
      products = products.slice(start, end);
    }

    return products;
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}