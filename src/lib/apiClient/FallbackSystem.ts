/**
 * Универсальная система fallback для API недоступности
 */

import { 
  ApiResponse, 
  ApiSourceType, 
  FeeScheduleApiData, 
  LegalDocumentData,
  CourtFeeApiRule,
  ExemptionApiData
} from '@/types/apiSources';

export interface FallbackDataProvider<T> {
  getData(): Promise<T>;
  isAvailable(): Promise<boolean>;
  getDataAge(): Promise<number>; // Возраст данных в миллисекундах
  getDataSource(): string;
}

export interface FallbackConfig {
  maxDataAge: number; // Максимальный возраст данных в миллисекундах
  gracefulDegradation: boolean; // Включить постепенную деградацию
  notifyUser: boolean; // Уведомлять пользователя о fallback
  retryInterval: number; // Интервал повторных попыток
}

export interface FallbackStrategy {
  name: string;
  priority: number; // Приоритет стратегии (1 - высший)
  canHandle(dataType: string): boolean;
  execute<T>(dataType: string, context?: Record<string, unknown>): Promise<ApiResponse<T>>;
}

export class FallbackSystem {
  private strategies: Map<string, FallbackStrategy[]> = new Map();
  private dataProviders: Map<string, FallbackDataProvider<unknown>[]> = new Map();
  private config: FallbackConfig;
  private fallbackHistory: Map<string, { timestamp: number; strategy: string; success: boolean }[]> = new Map();

  constructor(config?: Partial<FallbackConfig>) {
    this.config = {
      maxDataAge: 7 * 24 * 60 * 60 * 1000, // 7 дней по умолчанию
      gracefulDegradation: true,
      notifyUser: true,
      retryInterval: 5 * 60 * 1000, // 5 минут
      ...config
    };

    this.initializeDefaultStrategies();
    this.initializeDefaultDataProviders();
  }

  /**
   * Инициализация стратегий по умолчанию
   */
  private initializeDefaultStrategies(): void {
    // Стратегия кэшированных данных
    this.registerStrategy({
      name: 'cached_data',
      priority: 1,
      canHandle: () => true,
      execute: async <T>(dataType: string) => {
        const providers = this.dataProviders.get(dataType) || [];
        
        // Получаем возраст данных для всех провайдеров
        const providersWithAge = await Promise.all(
          providers.map(async (provider) => ({
            provider,
            age: await provider.getDataAge(),
            available: await provider.isAvailable()
          }))
        );
        
        // Сортируем по возрасту (от новых к старым) и фильтруем доступные
        const sortedProviders = providersWithAge
          .filter(item => item.available)
          .sort((a, b) => a.age - b.age);
        
        for (const { provider, age } of sortedProviders) {
          if (age <= this.config.maxDataAge) {
            const data = await provider.getData();
            return {
              success: true,
              data,
              source: 'fallback' as ApiSourceType,
              timestamp: new Date(),
              cached: true
            } as ApiResponse<T>;
          }
        }

        return {
          success: false,
          error: 'No cached data available within acceptable age limit',
          source: 'fallback' as ApiSourceType,
          timestamp: new Date(),
          cached: false
        } as ApiResponse<T>;
      }
    });

    // Стратегия статических данных по умолчанию
    this.registerStrategy({
      name: 'default_data',
      priority: 2,
      canHandle: (dataType: string) => ['fee_schedule', 'legal_document'].includes(dataType),
      execute: async <T>(dataType: string) => {
        let defaultData: unknown;

        switch (dataType) {
          case 'fee_schedule':
            defaultData = this.getDefaultFeeSchedule();
            break;
          case 'legal_document':
            defaultData = this.getDefaultLegalDocument();
            break;
          default:
            return {
              success: false,
              error: `No default data available for type: ${dataType}`,
              source: 'fallback' as ApiSourceType,
              timestamp: new Date(),
              cached: false
            } as ApiResponse<T>;
        }

        return {
          success: true,
          data: defaultData,
          source: 'fallback' as ApiSourceType,
          timestamp: new Date(),
          cached: false
        } as ApiResponse<T>;
      }
    });

    // Стратегия постепенной деградации
    this.registerStrategy({
      name: 'graceful_degradation',
      priority: 3,
      canHandle: () => this.config.gracefulDegradation,
      execute: async <T>(dataType: string, context?: Record<string, unknown>) => {
        // Возвращаем минимально функциональные данные
        const degradedData = this.getDegradedData(dataType, context);
        
        if (degradedData) {
          return {
            success: true,
            data: degradedData,
            source: 'fallback' as ApiSourceType,
            timestamp: new Date(),
            cached: false
          } as ApiResponse<T>;
        }

        return {
          success: false,
          error: 'No degraded data available',
          source: 'fallback' as ApiSourceType,
          timestamp: new Date(),
          cached: false
        } as ApiResponse<T>;
      }
    });
  }

  /**
   * Инициализация провайдеров данных по умолчанию
   */
  private initializeDefaultDataProviders(): void {
    // Провайдер для localStorage
    this.registerDataProvider('fee_schedule', {
      getData: async () => {
        const cached = localStorage.getItem('fallback_fee_schedule');
        return cached ? JSON.parse(cached) : null;
      },
      isAvailable: async () => {
        return localStorage.getItem('fallback_fee_schedule') !== null;
      },
      getDataAge: async () => {
        const timestamp = localStorage.getItem('fallback_fee_schedule_timestamp');
        return timestamp ? Date.now() - parseInt(timestamp) : Infinity;
      },
      getDataSource: () => 'localStorage'
    });

    // Провайдер для sessionStorage
    this.registerDataProvider('fee_schedule', {
      getData: async () => {
        const cached = sessionStorage.getItem('session_fee_schedule');
        return cached ? JSON.parse(cached) : null;
      },
      isAvailable: async () => {
        return sessionStorage.getItem('session_fee_schedule') !== null;
      },
      getDataAge: async () => {
        const timestamp = sessionStorage.getItem('session_fee_schedule_timestamp');
        return timestamp ? Date.now() - parseInt(timestamp) : Infinity;
      },
      getDataSource: () => 'sessionStorage'
    });
  }

  /**
   * Регистрация стратегии fallback
   */
  registerStrategy(strategy: FallbackStrategy): void {
    const dataTypes = ['fee_schedule', 'legal_document', 'search_results'];
    
    for (const dataType of dataTypes) {
      if (strategy.canHandle(dataType)) {
        if (!this.strategies.has(dataType)) {
          this.strategies.set(dataType, []);
        }
        
        const strategies = this.strategies.get(dataType)!;
        strategies.push(strategy);
        strategies.sort((a, b) => a.priority - b.priority);
      }
    }
  }

  /**
   * Регистрация провайдера данных
   */
  registerDataProvider<T>(dataType: string, provider: FallbackDataProvider<T>): void {
    if (!this.dataProviders.has(dataType)) {
      this.dataProviders.set(dataType, []);
    }
    
    this.dataProviders.get(dataType)!.push(provider);
  }

  /**
   * Выполнение fallback для указанного типа данных
   */
  async executeFallback<T>(dataType: string, context?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const strategies = this.strategies.get(dataType) || [];
    
    if (strategies.length === 0) {
      return {
        success: false,
        error: `No fallback strategies available for data type: ${dataType}`,
        source: 'fallback' as ApiSourceType,
        timestamp: new Date(),
        cached: false
      };
    }

    let lastError: string | undefined;

    for (const strategy of strategies) {
      try {
        console.log(`Trying fallback strategy: ${strategy.name} for ${dataType}`);
        
        const result = await strategy.execute<T>(dataType, context);
        
        // Записываем в историю
        this.recordFallbackAttempt(dataType, strategy.name, result.success);
        
        if (result.success) {
          // Уведомляем пользователя о использовании fallback, если включено
          if (this.config.notifyUser) {
            console.warn(`Fallback used: strategy ${strategy.name} for ${dataType}`);
          }
          
          return result;
        } else {
          lastError = result.error;
        }
      } catch (error) {
        console.error(`Fallback strategy ${strategy.name} failed:`, error);
        this.recordFallbackAttempt(dataType, strategy.name, false);
        lastError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    return {
      success: false,
      error: `All fallback strategies failed. Last error: ${lastError}`,
      source: 'fallback' as ApiSourceType,
      timestamp: new Date(),
      cached: false
    };
  }

  /**
   * Сохранение данных для fallback
   */
  async storeFallbackData<T>(dataType: string, data: T, source: string = 'api'): Promise<void> {
    try {
      const timestamp = Date.now().toString();
      
      switch (dataType) {
        case 'fee_schedule':
          localStorage.setItem('fallback_fee_schedule', JSON.stringify(data));
          localStorage.setItem('fallback_fee_schedule_timestamp', timestamp);
          sessionStorage.setItem('session_fee_schedule', JSON.stringify(data));
          sessionStorage.setItem('session_fee_schedule_timestamp', timestamp);
          break;
        
        case 'legal_document': {
          // Для правовых документов используем более сложную схему хранения
          const docData = data as Record<string, unknown>;
          if (docData.id) {
            localStorage.setItem(`fallback_legal_doc_${docData.id}`, JSON.stringify(data));
            localStorage.setItem(`fallback_legal_doc_${docData.id}_timestamp`, timestamp);
          }
          break;
        }
      }
      
      console.log(`Stored fallback data for ${dataType} from ${source}`);
    } catch (error) {
      console.error(`Failed to store fallback data for ${dataType}:`, error);
    }
  }

  /**
   * Получение статистики fallback
   */
  getFallbackStatistics(): {
    totalAttempts: number;
    successfulAttempts: number;
    failedAttempts: number;
    strategiesUsed: Record<string, number>;
    dataTypesRequested: Record<string, number>;
  } {
    let totalAttempts = 0;
    let successfulAttempts = 0;
    let failedAttempts = 0;
    const strategiesUsed: Record<string, number> = {};
    const dataTypesRequested: Record<string, number> = {};

    for (const [dataType, attempts] of this.fallbackHistory.entries()) {
      dataTypesRequested[dataType] = attempts.length;
      
      for (const attempt of attempts) {
        totalAttempts++;
        
        if (attempt.success) {
          successfulAttempts++;
        } else {
          failedAttempts++;
        }
        
        strategiesUsed[attempt.strategy] = (strategiesUsed[attempt.strategy] || 0) + 1;
      }
    }

    return {
      totalAttempts,
      successfulAttempts,
      failedAttempts,
      strategiesUsed,
      dataTypesRequested
    };
  }

  /**
   * Очистка истории fallback
   */
  clearFallbackHistory(): void {
    this.fallbackHistory.clear();
  }

  /**
   * Получение данных расписания госпошлин по умолчанию
   */
  private getDefaultFeeSchedule(): FeeScheduleApiData {
    return {
      version: 'fallback-1.0',
      effectiveDate: new Date('2024-01-01'),
      source: 'fallback_system',
      courtTypes: {
        general: [
          {
            id: 'default_general_1',
            minAmount: 0,
            maxAmount: 100000,
            feeType: 'percentage',
            feeValue: 0.04, // 4%
            minimumFee: 400,
            maximumFee: 60000,
            formula: 'Math.max(400, Math.min(amount * 0.04, 60000))',
            legalBasis: 'Статья 333.19 НК РФ (резервные данные)',
            effectiveFrom: new Date('2024-01-01')
          }
        ],
        arbitration: [
          {
            id: 'default_arbitration_1',
            minAmount: 0,
            maxAmount: 500000,
            feeType: 'percentage',
            feeValue: 0.04, // 4%
            minimumFee: 2000,
            maximumFee: 100000,
            formula: 'Math.max(2000, Math.min(amount * 0.04, 100000))',
            legalBasis: 'Статья 333.21 НК РФ (резервные данные)',
            effectiveFrom: new Date('2024-01-01')
          }
        ]
      },
      exemptions: [
        {
          id: 'default_exemption_1',
          name: 'Льготы для физических лиц',
          description: 'Стандартные льготы при недоступности актуальных данных',
          discountType: 'percentage',
          discountValue: 50,
          applicableCourts: ['general', 'arbitration'],
          legalBasis: 'Статья 333.36 НК РФ (резервные данные)',
          effectiveFrom: new Date('2024-01-01')
        }
      ]
    };
  }

  /**
   * Получение правового документа по умолчанию
   */
  private getDefaultLegalDocument(): LegalDocumentData {
    return {
      id: 'fallback_document',
      title: 'Резервный правовой документ',
      type: 'regulation',
      number: 'FALLBACK-001',
      date: new Date('2024-01-01'),
      status: 'active',
      lastModified: new Date(),
      source: 'fallback_system',
      articles: [
        {
          number: '1',
          title: 'Общие положения',
          content: 'Данный документ используется при недоступности основных источников правовой информации.'
        }
      ]
    };
  }

  /**
   * Получение деградированных данных
   */
  private getDegradedData(dataType: string, context?: Record<string, unknown>): unknown {
    switch (dataType) {
      case 'fee_schedule':
        // Возвращаем минимальную структуру для расчета госпошлин
        return {
          version: 'degraded-1.0',
          effectiveDate: new Date(),
          source: 'degraded_fallback',
          courtTypes: {
            general: [{
              id: 'degraded_general',
              minAmount: 0,
              maxAmount: null,
              feeType: 'fixed' as const,
              feeValue: 300, // Минимальная фиксированная пошлина
              formula: '300',
              legalBasis: 'Минимальная пошлина (ограниченный режим)',
              effectiveFrom: new Date()
            }],
            arbitration: [{
              id: 'degraded_arbitration',
              minAmount: 0,
              maxAmount: null,
              feeType: 'fixed' as const,
              feeValue: 3000, // Минимальная фиксированная пошлина для арбитража
              formula: '3000',
              legalBasis: 'Минимальная пошлина (ограниченный режим)',
              effectiveFrom: new Date()
            }]
          },
          exemptions: []
        };
      
      case 'search_results':
        return [];
      
      default:
        return null;
    }
  }

  /**
   * Запись попытки fallback в историю
   */
  private recordFallbackAttempt(dataType: string, strategy: string, success: boolean): void {
    if (!this.fallbackHistory.has(dataType)) {
      this.fallbackHistory.set(dataType, []);
    }
    
    const attempts = this.fallbackHistory.get(dataType)!;
    attempts.push({
      timestamp: Date.now(),
      strategy,
      success
    });
    
    // Ограничиваем размер истории
    if (attempts.length > 100) {
      attempts.shift();
    }
  }

  /**
   * Проверка доступности fallback данных
   */
  async checkFallbackAvailability(dataType: string): Promise<{
    available: boolean;
    sources: string[];
    oldestDataAge: number;
    newestDataAge: number;
  }> {
    const providers = this.dataProviders.get(dataType) || [];
    const availableSources: string[] = [];
    const dataAges: number[] = [];

    for (const provider of providers) {
      if (await provider.isAvailable()) {
        availableSources.push(provider.getDataSource());
        dataAges.push(await provider.getDataAge());
      }
    }

    return {
      available: availableSources.length > 0,
      sources: availableSources,
      oldestDataAge: dataAges.length > 0 ? Math.max(...dataAges) : 0,
      newestDataAge: dataAges.length > 0 ? Math.min(...dataAges) : 0
    };
  }

  /**
   * Очистка устаревших fallback данных
   */
  async cleanupExpiredFallbackData(): Promise<void> {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();

      for (const key of keys) {
        if (key.startsWith('fallback_') && key.endsWith('_timestamp')) {
          const timestamp = parseInt(localStorage.getItem(key) || '0');
          
          if (now - timestamp > this.config.maxDataAge) {
            const dataKey = key.replace('_timestamp', '');
            localStorage.removeItem(key);
            localStorage.removeItem(dataKey);
            console.log(`Cleaned up expired fallback data: ${dataKey}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to cleanup expired fallback data:', error);
    }
  }
}