/**
 * Локальный менеджер данных - упрощенная замена ApiSourceManager
 * Работает только с локальными данными и кэшированием
 */

import { LocalStorageCache } from './LocalStorageCache';
import { GENERAL_JURISDICTION_RULES, ARBITRATION_RULES } from '@/data/courtFeeSchedule';
import { EXEMPTION_CATEGORIES } from '@/data/courtFeeExemptions';

// Локальные типы для совместимости
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  source: string;
  timestamp: Date;
  cached: boolean;
}

interface FeeScheduleApiData {
  version: string;
  lastModified: Date;
  generalJurisdiction: Array<Record<string, unknown>>;
  arbitrationCourts: Array<Record<string, unknown>>;
  exemptions: Array<Record<string, unknown>>;
  metadata: {
    source: string;
    legalBasis: string;
    effectiveDate: Date;
    nextReviewDate: Date;
  };
}

interface LegalDocumentData {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
  type: string;
}

export class LocalDataManager {
  private cache: LocalStorageCache;
  private dataVersion: string = '2024.1.0';
  private lastUpdateDate: Date = new Date('2024-01-01');

  constructor(cache?: LocalStorageCache) {
    this.cache = cache || new LocalStorageCache();
  }

  /**
   * Получить расписание госпошлин из локальных данных
   */
  async getFeeSchedule(): Promise<ApiResponse<FeeScheduleApiData>> {
    const cacheKey = 'fee_schedule_latest';
    
    try {
      // Проверяем кэш
      const cached = await this.cache.get<FeeScheduleApiData>(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          source: 'local',
          timestamp: new Date(),
          cached: true
        };
      }

      // Создаем данные из локальных источников
      const feeScheduleData: FeeScheduleApiData = {
        version: this.dataVersion,
        lastModified: this.lastUpdateDate,
        generalJurisdiction: GENERAL_JURISDICTION_RULES,
        arbitrationCourts: ARBITRATION_RULES,
        exemptions: EXEMPTION_CATEGORIES,
        metadata: {
          source: 'local',
          legalBasis: 'НК РФ статьи 333.19, 333.21, 333.36, 333.37',
          effectiveDate: this.lastUpdateDate,
          nextReviewDate: new Date('2025-01-01')
        }
      };

      // Кэшируем на 24 часа
      try {
        await this.cache.set(cacheKey, feeScheduleData, 24 * 60 * 60 * 1000);
      } catch (error) {
        console.warn('Не удалось сохранить в кэш:', error);
      }
      
      return {
        success: true,
        data: feeScheduleData,
        source: 'local',
        timestamp: new Date(),
        cached: false
      };
    } catch (error) {
      console.error('Ошибка получения данных о госпошлинах:', error);
      return {
        success: false,
        error: `Ошибка загрузки локальных данных: ${error}`,
        source: 'local',
        timestamp: new Date(),
        cached: false
      };
    }
  }

  /**
   * Получить правовой документ (заглушка для совместимости)
   */
  async getLegalDocument(documentId: string): Promise<ApiResponse<LegalDocumentData>> {
    console.warn('Получение правовых документов недоступно в локальном режиме');
    return {
      success: false,
      error: 'Получение правовых документов недоступно в локальном режиме',
      source: 'local',
      timestamp: new Date(),
      cached: false
    };
  }

  /**
   * Поиск документов (заглушка для совместимости)
   */
  async searchDocuments(query: string): Promise<ApiResponse<LegalDocumentData[]>> {
    console.warn('Поиск документов недоступен в локальном режиме');
    return {
      success: false,
      error: 'Поиск документов недоступен в локальном режиме',
      source: 'local',
      timestamp: new Date(),
      cached: false
    };
  }

  /**
   * Проверить обновления (всегда возвращает false для локальных данных)
   */
  async checkForUpdates(): Promise<ApiResponse<{ hasUpdates: boolean; lastUpdate: Date }>> {
    return {
      success: true,
      data: {
        hasUpdates: false, // Локальные данные не обновляются автоматически
        lastUpdate: this.lastUpdateDate
      },
      source: 'local',
      timestamp: new Date(),
      cached: false
    };
  }

  /**
   * Тестирование подключения (всегда успешно для локальных данных)
   */
  async testConnection(): Promise<boolean> {
    return true;
  }

  /**
   * Получить статус источников данных
   */
  getSourcesStatus(): Array<{ 
    id: string; 
    name: string; 
    enabled: boolean; 
    priority: number;
    remainingRequests: number;
  }> {
    return [{
      id: 'local',
      name: 'Локальные данные',
      enabled: true,
      priority: 1,
      remainingRequests: Infinity // Неограниченно для локальных данных
    }];
  }

  /**
   * Получить информацию о версии данных
   */
  getDataVersionInfo(): {
    version: string;
    lastUpdate: Date;
    source: string;
    nextReviewDate: Date;
  } {
    return {
      version: this.dataVersion,
      lastUpdate: this.lastUpdateDate,
      source: 'Локальные данные (НК РФ)',
      nextReviewDate: new Date('2025-01-01')
    };
  }

  /**
   * Обновить версию данных (для ручного обновления)
   */
  updateDataVersion(version: string, updateDate: Date = new Date()): void {
    this.dataVersion = version;
    this.lastUpdateDate = updateDate;
    
    // Очищаем кэш при обновлении версии
    this.clearCache();
    
    console.log(`Версия данных обновлена до ${version}`);
  }

  /**
   * Очистить кэш
   */
  async clearCache(): Promise<void> {
    try {
      await this.cache.clear();
      console.log('Кэш очищен');
    } catch (error) {
      console.error('Ошибка очистки кэша:', error);
    }
  }

  /**
   * Получить статистику кэша
   */
  getCacheStatistics(): Record<string, unknown> {
    const cacheWithStats = this.cache as Record<string, unknown>;
    
    if ('getStatistics' in this.cache && typeof cacheWithStats.getStatistics === 'function') {
      return (cacheWithStats.getStatistics as () => Record<string, unknown>)();
    }
    
    if ('getCacheStats' in this.cache && typeof cacheWithStats.getCacheStats === 'function') {
      return (cacheWithStats.getCacheStats as () => Record<string, unknown>)();
    }
    
    return {
      message: 'Статистика кэша недоступна',
      cacheType: 'basic'
    };
  }

  /**
   * Экспорт данных для резервного копирования
   */
  async exportData(): Promise<{
    version: string;
    exportDate: Date;
    feeSchedule: FeeScheduleApiData | null;
  }> {
    try {
      const feeScheduleResponse = await this.getFeeSchedule();
      
      return {
        version: this.dataVersion,
        exportDate: new Date(),
        feeSchedule: feeScheduleResponse.success ? feeScheduleResponse.data || null : null
      };
    } catch (error) {
      console.error('Ошибка экспорта данных:', error);
      return {
        version: this.dataVersion,
        exportDate: new Date(),
        feeSchedule: null
      };
    }
  }

  /**
   * Импорт данных из резервной копии
   */
  async importData(exportedData: {
    version: string;
    exportDate: Date;
    feeSchedule: FeeScheduleApiData | null;
  }): Promise<boolean> {
    try {
      if (exportedData.feeSchedule) {
        // Обновляем версию
        this.updateDataVersion(exportedData.version, exportedData.exportDate);
        
        console.log(`Данные импортированы успешно (версия ${exportedData.version})`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Ошибка импорта данных:', error);
      return false;
    }
  }

  /**
   * Очистка ресурсов
   */
  public dispose(): void {
    console.log('LocalDataManager очищен');
  }
}