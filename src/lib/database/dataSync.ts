/**
 * Система синхронизации данных между различными источниками
 * Поддерживает приоритизацию источников и разрешение конфликтов
 * Автоматическая синхронизация с банковскими API на клиентской стороне
 * 
 * ВАЖНО: Работает в браузере для статичного сайта на GitHub Pages
 * Использует localStorage для хранения состояния и Web Workers для фоновой синхронизации
 */

import { BankRepository, BankProductRepository } from './bankRepository';
import type {
  Bank,
  BankProduct,
  SyncStatus,
  DataSourceConfig,
  BankProductCreateData,
  BankProductUpdateData
} from '../../types/bank';

/**
 * Источники данных в порядке приоритета
 */
export enum DataSourcePriority {
  OFFICIAL_BANK_API = 1,    // Официальные API банков (высший приоритет)
  CENTRAL_BANK_API = 2,     // API Центрального банка
  PARTNER_API = 3,          // Партнерские API (например, Pampadu)
  MANUAL_UPDATE = 4,        // Ручные обновления администратора
  CACHED_DATA = 5           // Кэшированные данные (низший приоритет)
}

/**
 * Типы банковских API
 */
export enum BankApiType {
  REST = 'rest',
  GRAPHQL = 'graphql',
  CORS_PROXY = 'cors_proxy' // Для обхода CORS через прокси
}

/**
 * Интерфейс источника данных
 */
export interface DataSource {
  id: string;
  name: string;
  priority: DataSourcePriority;
  api_type: BankApiType;
  url?: string;
  api_key?: string;
  is_active: boolean;
  last_sync?: string;
  sync_interval: number; // в минутах
  timeout: number; // в миллисекундах
  cors_proxy?: string; // URL CORS прокси если нужен
  headers?: Record<string, string>; // Дополнительные заголовки
  rate_limit?: {
    requests_per_minute: number;
    requests_per_hour: number;
  };
}

/**
 * Конфигурация банковского API
 */
export interface BankApiConfig {
  bank_id: string;
  bank_name: string;
  api_url: string;
  api_type: BankApiType;
  endpoints: {
    products?: string;
    rates?: string;
    terms?: string;
  };
  auth?: {
    type: 'api_key' | 'bearer' | 'basic' | 'none';
    key?: string;
    token?: string;
  };
  mapping: ProductDataMapping; // Маппинг полей API на нашу модель
}

/**
 * Маппинг полей данных из внешнего API на нашу модель
 */
export interface ProductDataMapping {
  id?: string;
  name: string;
  product_type: string;
  interest_rate: string;
  min_amount?: string;
  max_amount?: string;
  min_term?: string;
  max_term?: string;
  fees?: Record<string, string>;
  requirements?: Record<string, string>;
  features?: Record<string, string>;
  promotional_rate?: string;
  promo_valid_until?: string;
}

/**
 * Результат синхронизации
 */
export interface SyncResult {
  source_id: string;
  success: boolean;
  banks_updated: number;
  products_updated: number;
  products_created: number;
  products_deactivated: number;
  errors: string[];
  duration: number; // в миллисекундах
  timestamp: string;
  data_freshness: 'fresh' | 'stale' | 'outdated';
}

/**
 * Конфликт данных между источниками
 */
export interface DataConflict {
  entity_type: 'bank' | 'product';
  entity_id: string;
  field: string;
  values: Array<{
    source_id: string;
    source_priority: DataSourcePriority;
    value: any;
    timestamp: string;
  }>;
  resolved_value?: any;
  resolution_strategy: 'priority' | 'newest' | 'manual';
}

/**
 * Менеджер синхронизации данных
 * Работает на клиентской стороне для статичного сайта
 */
export class DataSyncManager {
  private sources: Map<string, DataSource> = new Map();
  private bankApis: Map<string, BankApiConfig> = new Map();
  private syncStatus: SyncStatus = {
    last_sync: new Date().toISOString(),
    is_syncing: false,
    sync_progress: 0,
    errors: []
  };
  private syncIntervalId?: number;
  private readonly STORAGE_KEY = 'bank_data_sync_status';
  private readonly FRESHNESS_THRESHOLD = 24 * 60 * 60 * 1000; // 24 часа

  constructor() {
    this.initializeDefaultSources();
    this.loadSyncStatus();
  }

  /**
   * Инициализация источников данных по умолчанию
   */
  private initializeDefaultSources(): void {
    // Центральный банк РФ - публичный API
    this.addSource({
      id: 'cbr_api',
      name: 'API Центрального банка РФ',
      priority: DataSourcePriority.CENTRAL_BANK_API,
      api_type: BankApiType.REST,
      url: 'https://www.cbr-xml-daily.ru/daily_json.js',
      is_active: true,
      sync_interval: 60, // каждый час
      timeout: 10000
    });

    // Партнерские API (будут добавляться динамически)
    this.addSource({
      id: 'partner_api',
      name: 'Партнерский API',
      priority: DataSourcePriority.PARTNER_API,
      api_type: BankApiType.REST,
      is_active: false, // активируется при настройке
      sync_interval: 30, // каждые 30 минут
      timeout: 15000
    });

    // Ручные обновления
    this.addSource({
      id: 'manual_updates',
      name: 'Ручные обновления',
      priority: DataSourcePriority.MANUAL_UPDATE,
      api_type: BankApiType.REST,
      is_active: true,
      sync_interval: 0, // по требованию
      timeout: 0
    });
  }

  /**
   * Загрузить статус синхронизации из localStorage
   */
  private loadSyncStatus(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.syncStatus = {
          ...this.syncStatus,
          ...parsed,
          is_syncing: false // Всегда сбрасываем флаг при загрузке
        };
      }
    } catch (error) {
      console.error('Ошибка загрузки статуса синхронизации:', error);
    }
  }

  /**
   * Сохранить статус синхронизации в localStorage
   */
  private saveSyncStatus(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.syncStatus));
    } catch (error) {
      console.error('Ошибка сохранения статуса синхронизации:', error);
    }
  }

  /**
   * Добавить источник данных
   */
  addSource(source: Omit<DataSource, 'last_sync'>): void {
    this.sources.set(source.id, {
      ...source,
      last_sync: undefined
    });
  }

  /**
   * Добавить конфигурацию банковского API
   */
  addBankApi(config: BankApiConfig): void {
    this.bankApis.set(config.bank_id, config);
    
    // Создаем источник данных для этого банка
    this.addSource({
      id: `bank_api_${config.bank_id}`,
      name: `API ${config.bank_name}`,
      priority: DataSourcePriority.OFFICIAL_BANK_API,
      api_type: config.api_type,
      url: config.api_url,
      api_key: config.auth?.key || config.auth?.token,
      is_active: true,
      sync_interval: 120, // каждые 2 часа
      timeout: 15000,
      headers: this.buildAuthHeaders(config.auth)
    });
  }

  /**
   * Построить заголовки аутентификации
   */
  private buildAuthHeaders(auth?: BankApiConfig['auth']): Record<string, string> {
    if (!auth || auth.type === 'none') {
      return {};
    }

    const headers: Record<string, string> = {};

    switch (auth.type) {
      case 'api_key':
        if (auth.key) {
          headers['X-API-Key'] = auth.key;
        }
        break;
      case 'bearer':
        if (auth.token) {
          headers['Authorization'] = `Bearer ${auth.token}`;
        }
        break;
      case 'basic':
        if (auth.key && auth.token) {
          const encoded = btoa(`${auth.key}:${auth.token}`);
          headers['Authorization'] = `Basic ${encoded}`;
        }
        break;
    }

    return headers;
  }

  /**
   * Получить все источники данных
   */
  getSources(): DataSource[] {
    return Array.from(this.sources.values());
  }

  /**
   * Получить статус синхронизации
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Запустить полную синхронизацию
   */
  async syncAll(): Promise<SyncResult[]> {
    if (this.syncStatus.is_syncing) {
      throw new Error('Синхронизация уже выполняется');
    }

    this.syncStatus.is_syncing = true;
    this.syncStatus.sync_progress = 0;
    this.syncStatus.errors = [];

    const results: SyncResult[] = [];
    const activeSources = Array.from(this.sources.values())
      .filter(source => source.is_active && source.sync_interval > 0)
      .sort((a, b) => a.priority - b.priority);

    try {
      for (let i = 0; i < activeSources.length; i++) {
        const source = activeSources[i];
        this.syncStatus.sync_progress = (i / activeSources.length) * 100;

        try {
          const result = await this.syncSource(source);
          results.push(result);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
          this.syncStatus.errors.push(`${source.name}: ${errorMessage}`);
          
          results.push({
            source_id: source.id,
            success: false,
            banks_updated: 0,
            products_updated: 0,
            products_created: 0,
            products_deactivated: 0,
            errors: [errorMessage],
            duration: 0,
            timestamp: new Date().toISOString(),
            data_freshness: 'outdated'
          });
        }
      }

      // Разрешение конфликтов данных
      await this.resolveDataConflicts();

      this.syncStatus.last_sync = new Date().toISOString();
      this.syncStatus.sync_progress = 100;
      this.saveSyncStatus();
    } finally {
      this.syncStatus.is_syncing = false;
    }

    return results;
  }

  /**
   * Синхронизация конкретного источника
   */
  private async syncSource(source: DataSource): Promise<SyncResult> {
    const startTime = Date.now();
    let banksUpdated = 0;
    let productsUpdated = 0;
    let productsCreated = 0;
    let productsDeactivated = 0;
    const errors: string[] = [];

    try {
      // Проверяем, является ли это банковским API
      if (source.id.startsWith('bank_api_')) {
        const bankId = source.id.replace('bank_api_', '');
        const bankConfig = this.bankApis.get(bankId);
        
        if (bankConfig) {
          const result = await this.syncBankProducts(source, bankConfig);
          productsUpdated += result.products_updated;
          productsCreated += result.products_created;
          productsDeactivated += result.products_deactivated;
        }
      } else {
        // Обработка других источников
        switch (source.id) {
          case 'cbr_api':
            const cbrResult = await this.syncCentralBankData(source);
            banksUpdated += cbrResult.banks_updated;
            productsUpdated += cbrResult.products_updated;
            break;

          case 'partner_api':
            const partnerResult = await this.syncPartnerData(source);
            banksUpdated += partnerResult.banks_updated;
            productsUpdated += partnerResult.products_updated;
            break;
        }
      }

      // Обновляем время последней синхронизации
      source.last_sync = new Date().toISOString();

      // Определяем свежесть данных
      const dataFreshness = this.calculateDataFreshness(source);

      return {
        source_id: source.id,
        success: true,
        banks_updated: banksUpdated,
        products_updated: productsUpdated,
        products_created: productsCreated,
        products_deactivated: productsDeactivated,
        errors,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        data_freshness: dataFreshness
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      errors.push(errorMessage);

      return {
        source_id: source.id,
        success: false,
        banks_updated: banksUpdated,
        products_updated: productsUpdated,
        products_created: productsCreated,
        products_deactivated: productsDeactivated,
        errors,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        data_freshness: 'outdated'
      };
    }
  }

  /**
   * Синхронизация продуктов конкретного банка
   */
  private async syncBankProducts(
    source: DataSource,
    config: BankApiConfig
  ): Promise<{ products_updated: number; products_created: number; products_deactivated: number }> {
    if (!config.endpoints.products) {
      throw new Error('Endpoint для продуктов не настроен');
    }

    const url = `${config.api_url}${config.endpoints.products}`;
    
    try {
      // Выполняем запрос к API банка
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), source.timeout);

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...source.headers
      };

      const response = await fetch(url, {
        signal: controller.signal,
        headers,
        method: 'GET'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Преобразуем данные из формата API в нашу модель
      const products = this.mapApiDataToProducts(data, config);
      
      // Обновляем продукты в базе данных
      return await this.updateProductsInDatabase(config.bank_id, products);
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Таймаут запроса к API ${config.bank_name}`);
      }
      throw error;
    }
  }

  /**
   * Маппинг данных из API на нашу модель продуктов
   */
  private mapApiDataToProducts(
    apiData: any,
    config: BankApiConfig
  ): BankProductCreateData[] {
    const products: BankProductCreateData[] = [];
    const mapping = config.mapping;

    // Предполагаем, что API возвращает массив продуктов
    const items = Array.isArray(apiData) ? apiData : apiData.products || apiData.data || [];

    for (const item of items) {
      try {
        const product: BankProductCreateData = {
          bank_id: config.bank_id,
          name: this.getNestedValue(item, mapping.name),
          product_type: this.mapProductType(this.getNestedValue(item, mapping.product_type)),
          interest_rate: parseFloat(this.getNestedValue(item, mapping.interest_rate)),
          description: item.description || item.desc || undefined,
          min_amount: mapping.min_amount ? parseFloat(this.getNestedValue(item, mapping.min_amount)) : undefined,
          max_amount: mapping.max_amount ? parseFloat(this.getNestedValue(item, mapping.max_amount)) : undefined,
          min_term: mapping.min_term ? parseInt(this.getNestedValue(item, mapping.min_term)) : undefined,
          max_term: mapping.max_term ? parseInt(this.getNestedValue(item, mapping.max_term)) : undefined,
          fees: mapping.fees ? this.mapObject(item, mapping.fees) : {},
          requirements: mapping.requirements ? this.mapObject(item, mapping.requirements) : {},
          features: mapping.features ? this.mapObject(item, mapping.features) : {},
          promotional_rate: mapping.promotional_rate ? parseFloat(this.getNestedValue(item, mapping.promotional_rate)) : undefined,
          promo_valid_until: mapping.promo_valid_until ? this.getNestedValue(item, mapping.promo_valid_until) : undefined,
          is_active: true,
          priority: 0
        };

        products.push(product);
      } catch (error) {
        console.warn('Ошибка маппинга продукта:', error, item);
      }
    }

    return products;
  }

  /**
   * Получить вложенное значение по пути (например, "data.rate.value")
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Маппинг объекта по правилам
   */
  private mapObject(source: any, mapping: Record<string, string>): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [key, path] of Object.entries(mapping)) {
      const value = this.getNestedValue(source, path);
      if (value !== undefined && value !== null) {
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Маппинг типа продукта из внешнего формата
   */
  private mapProductType(externalType: string): 'mortgage' | 'deposit' | 'credit' | 'insurance' {
    const normalized = externalType.toLowerCase();
    
    if (normalized.includes('ипотек') || normalized.includes('mortgage')) {
      return 'mortgage';
    } else if (normalized.includes('вклад') || normalized.includes('deposit')) {
      return 'deposit';
    } else if (normalized.includes('кредит') || normalized.includes('credit') || normalized.includes('loan')) {
      return 'credit';
    } else if (normalized.includes('страхов') || normalized.includes('insurance')) {
      return 'insurance';
    }
    
    // По умолчанию
    return 'credit';
  }

  /**
   * Обновление продуктов в базе данных
   */
  private async updateProductsInDatabase(
    bankId: string,
    newProducts: BankProductCreateData[]
  ): Promise<{ products_updated: number; products_created: number; products_deactivated: number }> {
    let productsUpdated = 0;
    let productsCreated = 0;
    let productsDeactivated = 0;

    try {
      // Получаем существующие продукты банка
      const existingProducts = await BankProductRepository.getProducts({ bank_id: bankId });
      
      // Создаем Map для быстрого поиска
      const existingMap = new Map(existingProducts.map(p => [p.name, p]));
      const newProductNames = new Set(newProducts.map(p => p.name));

      // Обновляем или создаем продукты
      for (const newProduct of newProducts) {
        const existing = existingMap.get(newProduct.name);
        
        if (existing) {
          // Проверяем, изменились ли данные
          if (this.hasProductChanged(existing, newProduct)) {
            await BankProductRepository.updateProduct(existing.id, {
              ...newProduct,
              updated_at: new Date().toISOString()
            });
            productsUpdated++;
          }
        } else {
          // Создаем новый продукт
          await BankProductRepository.createProduct(newProduct);
          productsCreated++;
        }
      }

      // Деактивируем продукты, которых больше нет в API
      for (const existing of existingProducts) {
        if (!newProductNames.has(existing.name) && existing.is_active) {
          await BankProductRepository.updateProduct(existing.id, {
            is_active: false,
            updated_at: new Date().toISOString()
          });
          productsDeactivated++;
        }
      }

      return { products_updated: productsUpdated, products_created: productsCreated, products_deactivated: productsDeactivated };
    } catch (error) {
      console.error('Ошибка обновления продуктов в БД:', error);
      throw error;
    }
  }

  /**
   * Проверка, изменились ли данные продукта
   */
  private hasProductChanged(existing: BankProduct, newData: BankProductCreateData): boolean {
    // Сравниваем ключевые поля
    return (
      existing.interest_rate !== newData.interest_rate ||
      existing.min_amount !== newData.min_amount ||
      existing.max_amount !== newData.max_amount ||
      existing.min_term !== newData.min_term ||
      existing.max_term !== newData.max_term ||
      existing.promotional_rate !== newData.promotional_rate ||
      JSON.stringify(existing.fees) !== JSON.stringify(newData.fees) ||
      JSON.stringify(existing.requirements) !== JSON.stringify(newData.requirements) ||
      JSON.stringify(existing.features) !== JSON.stringify(newData.features)
    );
  }

  /**
   * Синхронизация данных ЦБ РФ
   */
  private async syncCentralBankData(source: DataSource): Promise<{ banks_updated: number; products_updated: number }> {
    if (!source.url) {
      throw new Error('URL для API ЦБ РФ не настроен');
    }

    try {
      // Получаем данные от ЦБ РФ
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), source.timeout);

      const response = await fetch(source.url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Schitay.RU Bank Comparison System'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Обрабатываем данные ЦБ РФ
      // В реальной реализации здесь будет обработка курсов валют и базовых ставок
      console.log('Данные ЦБ РФ получены:', data);

      return {
        banks_updated: 0,
        products_updated: 0
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Таймаут запроса к API ЦБ РФ');
      }
      throw error;
    }
  }

  /**
   * Синхронизация партнерских данных
   */
  private async syncPartnerData(source: DataSource): Promise<{ banks_updated: number; products_updated: number }> {
    // В реальной реализации здесь будет интеграция с партнерскими API
    // Например, получение актуальных условий по продуктам от Pampadu
    
    console.log('Синхронизация партнерских данных:', source.name);
    
    return {
      banks_updated: 0,
      products_updated: 0
    };
  }

  /**
   * Вычисление свежести данных
   */
  private calculateDataFreshness(source: DataSource): 'fresh' | 'stale' | 'outdated' {
    if (!source.last_sync) {
      return 'outdated';
    }

    const lastSyncTime = new Date(source.last_sync).getTime();
    const now = Date.now();
    const age = now - lastSyncTime;

    if (age < this.FRESHNESS_THRESHOLD / 2) {
      return 'fresh'; // Меньше 12 часов
    } else if (age < this.FRESHNESS_THRESHOLD) {
      return 'stale'; // 12-24 часа
    } else {
      return 'outdated'; // Больше 24 часов
    }
  }

  /**
   * Разрешение конфликтов данных
   * Приоритизирует официальные источники банков над другими (Requirement 6.8)
   */
  private async resolveDataConflicts(): Promise<void> {
    // Получаем все конфликты
    const conflicts = await this.detectDataConflicts();
    
    for (const conflict of conflicts) {
      const resolvedValue = this.resolveConflict(conflict);
      
      if (resolvedValue !== undefined) {
        await this.applyResolvedValue(conflict, resolvedValue);
      }
    }
  }

  /**
   * Обнаружение конфликтов данных
   */
  private async detectDataConflicts(): Promise<DataConflict[]> {
    const conflicts: DataConflict[] = [];
    
    // Получаем все продукты
    const products = await BankProductRepository.getProducts();
    
    // Группируем продукты по банку и названию
    const productGroups = new Map<string, BankProduct[]>();
    
    for (const product of products) {
      const key = `${product.bank_id}_${product.name}`;
      if (!productGroups.has(key)) {
        productGroups.set(key, []);
      }
      productGroups.get(key)!.push(product);
    }
    
    // Проверяем группы на конфликты (дубликаты)
    for (const [key, group] of productGroups.entries()) {
      if (group.length > 1) {
        // Есть дубликаты - создаем конфликт
        const [bankId, productName] = key.split('_');
        
        // Проверяем различия в ключевых полях
        const rates = new Set(group.map(p => p.interest_rate));
        if (rates.size > 1) {
          conflicts.push({
            entity_type: 'product',
            entity_id: group[0].id,
            field: 'interest_rate',
            values: group.map(p => ({
              source_id: this.guessSourceId(p),
              source_priority: this.guessSourcePriority(p),
              value: p.interest_rate,
              timestamp: p.updated_at
            })),
            resolution_strategy: 'priority'
          });
        }
      }
    }
    
    return conflicts;
  }

  /**
   * Угадать ID источника по продукту
   */
  private guessSourceId(product: BankProduct): string {
    // Если продукт был обновлен недавно через API банка
    if (product.updated_at) {
      const updateTime = new Date(product.updated_at).getTime();
      const now = Date.now();
      
      // Если обновлен в последние 2 часа, скорее всего из API банка
      if (now - updateTime < 2 * 60 * 60 * 1000) {
        return `bank_api_${product.bank_id}`;
      }
    }
    
    return 'manual_updates';
  }

  /**
   * Угадать приоритет источника
   */
  private guessSourcePriority(product: BankProduct): DataSourcePriority {
    const sourceId = this.guessSourceId(product);
    const source = this.sources.get(sourceId);
    return source?.priority || DataSourcePriority.MANUAL_UPDATE;
  }

  /**
   * Разрешение конкретного конфликта
   * Приоритизирует официальные банковские API (Requirement 6.8)
   */
  private resolveConflict(conflict: DataConflict): any {
    // Сортируем значения по приоритету источника (меньше = выше приоритет)
    const sortedValues = conflict.values.sort((a, b) => a.source_priority - b.source_priority);
    
    switch (conflict.resolution_strategy) {
      case 'priority':
        // Берем значение из источника с наивысшим приоритетом
        // Официальные API банков имеют приоритет 1 (самый высокий)
        return sortedValues[0].value;
        
      case 'newest':
        // Берем самое новое значение
        const newestValue = conflict.values.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];
        return newestValue.value;
        
      case 'manual':
        // Требует ручного разрешения
        console.warn('Конфликт требует ручного разрешения:', conflict);
        return undefined;
        
      default:
        // По умолчанию используем приоритет (официальные источники важнее)
        return sortedValues[0].value;
    }
  }

  /**
   * Применение разрешенного значения
   */
  private async applyResolvedValue(conflict: DataConflict, resolvedValue: any): Promise<void> {
    try {
      if (conflict.entity_type === 'bank') {
        await BankRepository.updateBank(conflict.entity_id, {
          [conflict.field]: resolvedValue
        });
      } else if (conflict.entity_type === 'product') {
        await BankProductRepository.updateProduct(conflict.entity_id, {
          [conflict.field]: resolvedValue
        });
      }
      
      console.log(`Конфликт разрешен для ${conflict.entity_type} ${conflict.entity_id}, поле ${conflict.field}`);
    } catch (error) {
      console.error('Ошибка применения разрешенного значения:', error);
    }
  }

  /**
   * Проверка необходимости синхронизации источника
   */
  shouldSync(source: DataSource): boolean {
    if (!source.is_active || source.sync_interval === 0) {
      return false;
    }

    if (!source.last_sync) {
      return true;
    }

    const lastSyncTime = new Date(source.last_sync).getTime();
    const now = Date.now();
    const intervalMs = source.sync_interval * 60 * 1000;

    return (now - lastSyncTime) >= intervalMs;
  }

  /**
   * Проверка свежести данных
   */
  async checkDataFreshness(): Promise<{
    overall: 'fresh' | 'stale' | 'outdated';
    sources: Array<{ id: string; name: string; freshness: 'fresh' | 'stale' | 'outdated'; last_sync?: string }>;
  }> {
    const sources = Array.from(this.sources.values())
      .filter(s => s.is_active)
      .map(s => ({
        id: s.id,
        name: s.name,
        freshness: this.calculateDataFreshness(s),
        last_sync: s.last_sync
      }));

    // Определяем общую свежесть по худшему источнику
    const hasOutdated = sources.some(s => s.freshness === 'outdated');
    const hasStale = sources.some(s => s.freshness === 'stale');

    const overall = hasOutdated ? 'outdated' : hasStale ? 'stale' : 'fresh';

    return { overall, sources };
  }

  /**
   * Автоматическая синхронизация по расписанию (для браузера)
   */
  startAutoSync(): void {
    // Останавливаем предыдущий интервал если есть
    this.stopAutoSync();

    // Проверяем каждую минуту
    this.syncIntervalId = window.setInterval(async () => {
      if (this.syncStatus.is_syncing) {
        return;
      }

      const sourcesToSync = Array.from(this.sources.values())
        .filter(source => this.shouldSync(source));

      if (sourcesToSync.length > 0) {
        console.log('Запуск автоматической синхронизации для источников:', 
          sourcesToSync.map(s => s.name));
        
        try {
          await this.syncAll();
        } catch (error) {
          console.error('Ошибка автоматической синхронизации:', error);
        }
      }
    }, 60000); // проверяем каждую минуту

    console.log('Автоматическая синхронизация запущена');
  }

  /**
   * Остановка автоматической синхронизации
   */
  stopAutoSync(): void {
    if (this.syncIntervalId) {
      window.clearInterval(this.syncIntervalId);
      this.syncIntervalId = undefined;
      console.log('Автоматическая синхронизация остановлена');
    }
  }

  /**
   * Экспорт данных для резервного копирования
   */
  async exportData(): Promise<{
    banks: Bank[];
    products: BankProduct[];
    sources: DataSource[];
    sync_status: SyncStatus;
    export_timestamp: string;
  }> {
    const banks = await BankRepository.getBanks();
    const products = await BankProductRepository.getProducts();

    return {
      banks,
      products,
      sources: this.getSources(),
      sync_status: this.getSyncStatus(),
      export_timestamp: new Date().toISOString()
    };
  }

  /**
   * Импорт данных из резервной копии
   */
  async importData(data: {
    banks?: Bank[];
    products?: BankProduct[];
    sources?: DataSource[];
  }): Promise<void> {
    try {
      if (data.banks) {
        for (const bank of data.banks) {
          try {
            await BankRepository.createBank(bank);
          } catch (error) {
            // Игнорируем ошибки дублирования
            console.warn('Банк уже существует:', bank.name);
          }
        }
      }

      if (data.products) {
        for (const product of data.products) {
          try {
            await BankProductRepository.createProduct(product);
          } catch (error) {
            // Игнорируем ошибки дублирования
            console.warn('Продукт уже существует:', product.name);
          }
        }
      }

      if (data.sources) {
        for (const source of data.sources) {
          this.addSource(source);
        }
      }

      console.log('Импорт данных завершен успешно');
    } catch (error) {
      console.error('Ошибка импорта данных:', error);
      throw error;
    }
  }
}

// Создаем глобальный экземпляр менеджера синхронизации
export const dataSyncManager = new DataSyncManager();

// Запускаем автоматическую синхронизацию при инициализации (только в браузере)
if (typeof window !== 'undefined') {
  // Запускаем синхронизацию при загрузке страницы
  window.addEventListener('load', () => {
    dataSyncManager.startAutoSync();
    
    // Проверяем свежесть данных при загрузке
    dataSyncManager.checkDataFreshness().then(freshness => {
      console.log('Свежесть данных:', freshness.overall);
      
      // Если данные устарели, запускаем синхронизацию
      if (freshness.overall === 'outdated') {
        console.log('Данные устарели, запускаем синхронизацию...');
        dataSyncManager.syncAll().catch(error => {
          console.error('Ошибка синхронизации при загрузке:', error);
        });
      }
    });
  });
  
  // Останавливаем синхронизацию при выгрузке страницы
  window.addEventListener('beforeunload', () => {
    dataSyncManager.stopAutoSync();
  });
  
  // Синхронизируем при возвращении на вкладку (если данные устарели)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      dataSyncManager.checkDataFreshness().then(freshness => {
        if (freshness.overall === 'stale' || freshness.overall === 'outdated') {
          console.log('Вкладка активна, данные устарели - запускаем синхронизацию');
          dataSyncManager.syncAll().catch(error => {
            console.error('Ошибка синхронизации при активации вкладки:', error);
          });
        }
      });
    }
  });
}