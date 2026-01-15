import { 
  FeeDataService as IFeeDataService,
  FeeSchedule,
  CourtType,
  DataFreshnessStatus,
  DataVersionInfo,
  FeeRule
} from '@/types/courtFee';
import { 
  getFeeRules,
  GENERAL_JURISDICTION_RULES,
  ARBITRATION_RULES
} from '@/data/courtFeeSchedule';
import { LocalDataManager } from './apiClient/LocalDataManager';
import { LocalStorageCache } from './apiClient/LocalStorageCache';

/**
 * Сервис для управления данными о госпошлинах
 * Обеспечивает проверку актуальности, валидацию и обновление данных
 * Поддерживает полную офлайн-функциональность
 */
export class FeeDataService implements IFeeDataService {
  private static readonly STORAGE_KEY_PREFIX = 'court_fee_data_';
  private static readonly VERSION_KEY = 'court_fee_version';
  private static readonly LAST_UPDATE_KEY = 'court_fee_last_update';
  private static readonly DATA_FRESHNESS_DAYS = 30; // Данные считаются актуальными 30 дней
  private static readonly OFFLINE_MODE_KEY = 'court_fee_offline_mode';
  private static readonly CACHED_SCHEDULES_KEY = 'court_fee_cached_schedules';
  private static readonly EXEMPTIONS_CACHE_KEY = 'court_fee_exemptions_cache';
  
  // Текущая версия данных (обновляется при изменении НК РФ)
  private static readonly CURRENT_VERSION = '2024.1.0';
  private static readonly CURRENT_VERSION_DATE = new Date('2024-01-01');

  private dataManager: LocalDataManager;
  private cache: LocalStorageCache;
  private isOfflineMode: boolean = false;

  constructor() {
    this.cache = new LocalStorageCache();
    this.dataManager = new LocalDataManager(this.cache);
    
    // Инициализация офлайн-режима
    this.initializeOfflineMode();
  }

  /**
   * Инициализация офлайн-режима и кэширование данных
   */
  private initializeOfflineMode(): void {
    try {
      // Проверяем, есть ли сохраненное состояние офлайн-режима
      const savedOfflineMode = localStorage.getItem(FeeDataService.OFFLINE_MODE_KEY);
      this.isOfflineMode = savedOfflineMode === 'true';

      // Кэшируем базовые данные при первом запуске
      this.ensureBasicDataCached();
      
      // Проверяем доступность сети
      this.checkNetworkStatus();
      
      // Слушаем изменения состояния сети
      if (typeof window !== 'undefined') {
        window.addEventListener('online', () => this.handleNetworkChange(true));
        window.addEventListener('offline', () => this.handleNetworkChange(false));
      }
    } catch (error) {
      console.error('Ошибка инициализации офлайн-режима:', error);
    }
  }

  /**
   * Обеспечить наличие базовых данных в кэше
   */
  private ensureBasicDataCached(): void {
    try {
      // Кэшируем расписания для обоих типов судов
      const generalSchedule = this.getCachedSchedule('general');
      if (!generalSchedule) {
        const schedule = this.createScheduleFromRules('general');
        this.cacheSchedule('general', schedule);
      }

      const arbitrationSchedule = this.getCachedSchedule('arbitration');
      if (!arbitrationSchedule) {
        const schedule = this.createScheduleFromRules('arbitration');
        this.cacheSchedule('arbitration', schedule);
      }

      // Кэшируем данные о льготах
      this.cacheExemptionsData();
      
      // Сохраняем полный набор кэшированных расписаний
      this.saveCachedSchedulesToStorage();
      
    } catch (error) {
      console.error('Ошибка кэширования базовых данных:', error);
    }
  }

  /**
   * Кэшировать данные о льготах
   */
  private cacheExemptionsData(): void {
    try {
      // Импортируем данные о льготах из exemptionManager
      const exemptionsData = {
        categories: [
          {
            id: 'disabled_1_2',
            name: 'Инвалиды I-II группы',
            description: 'Инвалиды I или II группы, дети-инвалиды, инвалиды с детства',
            discountType: 'fixed',
            discountValue: 25000,
            applicableCourts: ['general'],
            legalBasis: 'п.2 ст.333.36 НК РФ'
          },
          {
            id: 'veterans',
            name: 'Ветераны боевых действий',
            description: 'Ветераны боевых действий, ветераны военной службы',
            discountType: 'exempt',
            discountValue: 0,
            applicableCourts: ['general'],
            legalBasis: 'п.3 ст.333.36 НК РФ'
          },
          {
            id: 'consumer_disputes',
            name: 'Потребительские споры',
            description: 'Иски, связанные с нарушением прав потребителей',
            discountType: 'exempt',
            discountValue: 0,
            applicableCourts: ['general'],
            legalBasis: 'п.2 ст.333.36 НК РФ'
          },
          {
            id: 'pensioners',
            name: 'Пенсионеры',
            description: 'Пенсионеры по искам к ПФР и НПФ',
            discountType: 'exempt',
            discountValue: 0,
            applicableCourts: ['general'],
            legalBasis: 'п.2 ст.333.36 НК РФ'
          },
          {
            id: 'disabled_arbitration',
            name: 'Инвалиды I-II группы (арбитраж)',
            description: 'Инвалиды I и II группы в арбитражных судах',
            discountType: 'fixed',
            discountValue: 55000,
            applicableCourts: ['arbitration'],
            legalBasis: 'п.2 ст.333.37 НК РФ'
          }
        ],
        version: FeeDataService.CURRENT_VERSION,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(FeeDataService.EXEMPTIONS_CACHE_KEY, JSON.stringify(exemptionsData));
    } catch (error) {
      console.error('Ошибка кэширования данных о льготах:', error);
    }
  }

  /**
   * Сохранить кэшированные расписания в localStorage
   */
  private saveCachedSchedulesToStorage(): void {
    try {
      const cachedSchedules = {
        general: this.getCachedSchedule('general'),
        arbitration: this.getCachedSchedule('arbitration'),
        version: FeeDataService.CURRENT_VERSION,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(FeeDataService.CACHED_SCHEDULES_KEY, JSON.stringify(cachedSchedules));
    } catch (error) {
      console.error('Ошибка сохранения кэшированных расписаний:', error);
    }
  }

  /**
   * Проверить состояние сети
   */
  private checkNetworkStatus(): void {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      if (!navigator.onLine) {
        this.enableOfflineMode();
      }
    }
  }

  /**
   * Обработать изменение состояния сети
   */
  private handleNetworkChange(isOnline: boolean): void {
    if (isOnline) {
      this.disableOfflineMode();
      console.log('Сеть доступна, офлайн-режим отключен');
    } else {
      this.enableOfflineMode();
      console.log('Сеть недоступна, включен офлайн-режим');
    }
  }

  /**
   * Включить офлайн-режим
   */
  private enableOfflineMode(): void {
    this.isOfflineMode = true;
    localStorage.setItem(FeeDataService.OFFLINE_MODE_KEY, 'true');
  }

  /**
   * Отключить офлайн-режим
   */
  private disableOfflineMode(): void {
    this.isOfflineMode = false;
    localStorage.setItem(FeeDataService.OFFLINE_MODE_KEY, 'false');
  }

  /**
   * Проверить, работает ли система в офлайн-режиме
   */
  isInOfflineMode(): boolean {
    return this.isOfflineMode;
  }

  /**
   * Получить текущее расписание госпошлин для типа суда
   * Поддерживает офлайн-режим с fallback на кэшированные данные
   */
  async getCurrentSchedule(courtType: CourtType): Promise<FeeSchedule> {
    try {
      // В офлайн-режиме сразу используем кэшированные данные
      if (this.isOfflineMode) {
        console.log('Офлайн-режим: используем кэшированные данные');
        return this.getOfflineSchedule(courtType);
      }

      // Получаем данные через LocalDataManager
      const apiResponse = await this.dataManager.getFeeSchedule();
      
      if (apiResponse.success && apiResponse.data) {
        // Преобразуем данные API в локальный формат
        const schedule = this.transformApiDataToSchedule(apiResponse.data, courtType);
        
        // Сохраняем в локальный кэш
        this.cacheSchedule(courtType, schedule);
        this.saveCachedSchedulesToStorage();
        
        return schedule;
      } else {
        console.warn('API failed, falling back to cached data:', apiResponse.error);
      }

      // Fallback на кэшированные данные
      return this.getOfflineSchedule(courtType);
      
    } catch (error) {
      console.error('Ошибка получения расписания госпошлин:', error);
      // В случае ошибки всегда используем офлайн-данные
      return this.getOfflineSchedule(courtType);
    }
  }

  /**
   * Получить расписание в офлайн-режиме
   */
  private getOfflineSchedule(courtType: CourtType): FeeSchedule {
    // Сначала пытаемся получить из кэша
    const cachedSchedule = this.getCachedSchedule(courtType);
    if (cachedSchedule && this.validateScheduleIntegrity(cachedSchedule)) {
      return cachedSchedule;
    }

    // Если кэш недоступен, создаем из статических данных
    console.warn('Используем статические данные для офлайн-режима');
    const schedule = this.createScheduleFromRules(courtType);
    
    // Сохраняем в кэш для будущего использования
    this.cacheSchedule(courtType, schedule);
    this.saveCachedSchedulesToStorage();
    
    return schedule;
  }

  /**
   * Проверить наличие обновлений
   * В офлайн-режиме возвращает false
   */
  async checkForUpdates(): Promise<boolean> {
    try {
      // В офлайн-режиме обновления недоступны
      if (this.isOfflineMode) {
        return false;
      }

      // Проверяем обновления через LocalDataManager
      const apiResponse = await this.dataManager.checkForUpdates();
      
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data.hasUpdates;
      }

      // Fallback на локальную проверку версии
      const storedVersion = localStorage.getItem(FeeDataService.VERSION_KEY);
      return storedVersion !== FeeDataService.CURRENT_VERSION;
    } catch (error) {
      console.error('Ошибка проверки обновлений:', error);
      return false;
    }
  }

  /**
   * Обновить расписание для типа суда
   * В офлайн-режиме использует кэшированные данные
   */
  async updateSchedule(courtType: CourtType): Promise<FeeSchedule> {
    try {
      // В офлайн-режиме возвращаем кэшированные данные
      if (this.isOfflineMode) {
        console.log('Офлайн-режим: обновление недоступно, используем кэшированные данные');
        return this.getOfflineSchedule(courtType);
      }

      // Получаем свежие данные через LocalDataManager
      const apiResponse = await this.dataManager.getFeeSchedule();
      
      let schedule: FeeSchedule;
      
      if (apiResponse.success && apiResponse.data) {
        // Преобразуем данные API в локальный формат
        schedule = this.transformApiDataToSchedule(apiResponse.data, courtType);
      } else {
        // Fallback на создание нового расписания с актуальными данными
        schedule = this.createScheduleFromRules(courtType);
      }
      
      // Обновляем кэш
      this.cacheSchedule(courtType, schedule);
      this.saveCachedSchedulesToStorage();
      
      // Обновляем метаданные
      localStorage.setItem(FeeDataService.VERSION_KEY, FeeDataService.CURRENT_VERSION);
      localStorage.setItem(FeeDataService.LAST_UPDATE_KEY, new Date().toISOString());
      
      return schedule;
    } catch (error) {
      console.error('Ошибка обновления расписания:', error);
      
      // В случае ошибки всегда возвращаем кэшированные данные или создаем новые
      try {
        return this.getOfflineSchedule(courtType);
      } catch (fallbackError) {
        console.error('Ошибка получения fallback данных:', fallbackError);
        // Последний fallback - создаем расписание из статических данных
        const schedule = this.createScheduleFromRules(courtType);
        this.cacheSchedule(courtType, schedule);
        return schedule;
      }
    }
  }

  /**
   * Получить дату последнего обновления
   */
  getLastUpdateDate(): Date {
    try {
      const lastUpdateStr = localStorage.getItem(FeeDataService.LAST_UPDATE_KEY);
      if (lastUpdateStr) {
        return new Date(lastUpdateStr);
      }
      
      // Если данных нет, возвращаем дату версии
      return FeeDataService.CURRENT_VERSION_DATE;
    } catch (error) {
      console.error('Ошибка получения даты обновления:', error);
      return FeeDataService.CURRENT_VERSION_DATE;
    }
  }

  /**
   * Проверить актуальность данных
   */
  checkDataFreshness(): DataFreshnessStatus {
    const lastUpdate = this.getLastUpdateDate();
    const now = new Date();
    
    // Обрабатываем случай будущих дат (например, в тестах)
    const timeDiff = now.getTime() - lastUpdate.getTime();
    const daysSinceUpdate = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
    
    const isUpToDate = daysSinceUpdate <= FeeDataService.DATA_FRESHNESS_DAYS;
    
    let warningMessage: string | undefined;
    if (!isUpToDate) {
      if (daysSinceUpdate <= 60) {
        warningMessage = `Данные о госпошлинах обновлялись ${daysSinceUpdate} дней назад. Рекомендуется проверить актуальность тарифов.`;
      } else if (daysSinceUpdate <= 180) {
        warningMessage = `Внимание! Данные о госпошлинах устарели (${daysSinceUpdate} дней). Обязательно проверьте актуальные тарифы в НК РФ.`;
      } else {
        warningMessage = `Критическое предупреждение! Данные сильно устарели (${daysSinceUpdate} дней). Расчеты могут быть неточными.`;
      }
    }

    return {
      isUpToDate,
      lastUpdateDate: lastUpdate,
      daysSinceUpdate,
      warningMessage
    };
  }

  /**
   * Получить информацию о версии данных
   */
  getDataVersionInfo(): DataVersionInfo {
    return {
      version: FeeDataService.CURRENT_VERSION,
      releaseDate: FeeDataService.CURRENT_VERSION_DATE,
      source: 'НК РФ статьи 333.19, 333.21, 333.36, 333.37',
      checksum: this.calculateDataChecksum()
    };
  }

  /**
   * Валидировать целостность данных
   */
  validateDataIntegrity(): boolean {
    try {
      // Проверяем наличие основных правил
      const generalRules = getFeeRules('general');
      const arbitrationRules = getFeeRules('arbitration');
      
      if (!generalRules || generalRules.length === 0) {
        console.error('Отсутствуют правила для судов общей юрисдикции');
        return false;
      }
      
      if (!arbitrationRules || arbitrationRules.length === 0) {
        console.error('Отсутствуют правила для арбитражных судов');
        return false;
      }

      // Проверяем корректность диапазонов
      if (!this.validateRuleRanges(generalRules) || !this.validateRuleRanges(arbitrationRules)) {
        console.error('Некорректные диапазоны в правилах расчета');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Ошибка валидации данных:', error);
      return false;
    }
  }

  /**
   * Преобразовать данные API в локальный формат расписания
   */
  private transformApiDataToSchedule(apiData: any, courtType: CourtType): FeeSchedule {
    try {
      // Если данные уже в правильном формате API
      if (apiData.courtTypes && apiData.courtTypes[courtType]) {
        const rules = apiData.courtTypes[courtType].map((apiRule: any) => ({
          minAmount: apiRule.minAmount,
          maxAmount: apiRule.maxAmount,
          feeType: apiRule.feeType,
          feeValue: apiRule.feeValue,
          minimumFee: apiRule.minimumFee,
          maximumFee: apiRule.maximumFee,
          formula: apiRule.formula,
          legalBasis: apiRule.legalBasis
        }));

        return {
          courtType,
          version: apiData.version || FeeDataService.CURRENT_VERSION,
          lastUpdated: new Date(apiData.effectiveDate || Date.now()),
          rules
        };
      }

      // Fallback на статические данные если API данные в неожиданном формате
      console.warn('API data format unexpected, using static data');
      return this.createScheduleFromRules(courtType);
    } catch (error) {
      console.error('Error transforming API data:', error);
      return this.createScheduleFromRules(courtType);
    }
  }

  /**
   * Получить статистику API источников
   */
  getApiSourcesStatus(): Array<{ 
    id: string; 
    name: string; 
    enabled: boolean; 
    priority: number;
    remainingRequests: number;
  }> {
    return this.dataManager.getSourcesStatus();
  }

  /**
   * Тестировать подключение к локальным данным
   */
  async testApiConnections(): Promise<boolean> {
    return await this.dataManager.testConnection();
  }

  /**
   * Очистить API кэш
   */
  async clearApiCache(): Promise<void> {
    await this.dataManager.clearCache();
  }

  /**
   * Поиск правовых документов через API
   */
  async searchLegalDocuments(query: string): Promise<any[]> {
    try {
      // В офлайн-режиме поиск недоступен
      if (this.isOfflineMode) {
        console.log('Офлайн-режим: поиск правовых документов недоступен');
        return [];
      }

      const response = await this.dataManager.searchDocuments(query);
      return response.success ? response.data || [] : [];
    } catch (error) {
      console.error('Error searching legal documents:', error);
      return [];
    }
  }

  /**
   * Получить кэшированные данные о льготах
   */
  getCachedExemptions(): any[] {
    try {
      const cachedData = localStorage.getItem(FeeDataService.EXEMPTIONS_CACHE_KEY);
      if (cachedData) {
        const exemptionsData = JSON.parse(cachedData);
        return exemptionsData.categories || [];
      }
      return [];
    } catch (error) {
      console.error('Ошибка получения кэшированных льгот:', error);
      return [];
    }
  }

  /**
   * Получить статистику кэшированных данных
   */
  getCacheStatistics(): {
    totalSize: number;
    schedulesCount: number;
    exemptionsCount: number;
    lastCacheUpdate: Date | null;
    isOfflineReady: boolean;
  } {
    try {
      let totalSize = 0;
      let schedulesCount = 0;
      let exemptionsCount = 0;
      let lastCacheUpdate: Date | null = null;

      // Подсчитываем размер кэшированных расписаний
      const cachedSchedules = localStorage.getItem(FeeDataService.CACHED_SCHEDULES_KEY);
      if (cachedSchedules) {
        totalSize += cachedSchedules.length;
        const schedulesData = JSON.parse(cachedSchedules);
        if (schedulesData.general) schedulesCount++;
        if (schedulesData.arbitration) schedulesCount++;
        if (schedulesData.lastUpdated) {
          lastCacheUpdate = new Date(schedulesData.lastUpdated);
        }
      }

      // Подсчитываем размер кэшированных льгот
      const cachedExemptions = localStorage.getItem(FeeDataService.EXEMPTIONS_CACHE_KEY);
      if (cachedExemptions) {
        totalSize += cachedExemptions.length;
        const exemptionsData = JSON.parse(cachedExemptions);
        exemptionsCount = exemptionsData.categories?.length || 0;
      }

      // Проверяем готовность к офлайн-работе
      const isOfflineReady = schedulesCount >= 2 && exemptionsCount > 0;

      return {
        totalSize,
        schedulesCount,
        exemptionsCount,
        lastCacheUpdate,
        isOfflineReady
      };
    } catch (error) {
      console.error('Ошибка получения статистики кэша:', error);
      return {
        totalSize: 0,
        schedulesCount: 0,
        exemptionsCount: 0,
        lastCacheUpdate: null,
        isOfflineReady: false
      };
    }
  }

  /**
   * Очистить весь кэш офлайн-данных
   */
  clearOfflineCache(): void {
    try {
      localStorage.removeItem(FeeDataService.CACHED_SCHEDULES_KEY);
      localStorage.removeItem(FeeDataService.EXEMPTIONS_CACHE_KEY);
      localStorage.removeItem(FeeDataService.STORAGE_KEY_PREFIX + 'general');
      localStorage.removeItem(FeeDataService.STORAGE_KEY_PREFIX + 'arbitration');
      localStorage.removeItem(FeeDataService.OFFLINE_MODE_KEY);
      
      console.log('Кэш офлайн-данных очищен');
    } catch (error) {
      console.error('Ошибка очистки кэша:', error);
    }
  }

  /**
   * Принудительно обновить офлайн-кэш
   */
  async refreshOfflineCache(): Promise<void> {
    try {
      // Временно отключаем офлайн-режим для обновления
      const wasOffline = this.isOfflineMode;
      this.isOfflineMode = false;

      // Обновляем данные для обоих типов судов
      await this.updateSchedule('general');
      await this.updateSchedule('arbitration');
      
      // Обновляем кэш льгот
      this.cacheExemptionsData();
      
      // Восстанавливаем предыдущий режим
      this.isOfflineMode = wasOffline;
      
      console.log('Офлайн-кэш успешно обновлен');
    } catch (error) {
      console.error('Ошибка обновления офлайн-кэша:', error);
      throw error;
    }
  }
  private createScheduleFromRules(courtType: CourtType): FeeSchedule {
    const rules = getFeeRules(courtType);
    
    return {
      courtType,
      version: FeeDataService.CURRENT_VERSION,
      lastUpdated: this.getLastUpdateDate(),
      rules
    };
  }

  /**
   * Получить кэшированное расписание
   */
  private getCachedSchedule(courtType: CourtType): FeeSchedule | null {
    try {
      const cacheKey = FeeDataService.STORAGE_KEY_PREFIX + courtType;
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData) {
        const schedule = JSON.parse(cachedData) as FeeSchedule;
        // Восстанавливаем Date объекты
        schedule.lastUpdated = new Date(schedule.lastUpdated);
        return schedule;
      }
      
      return null;
    } catch (error) {
      console.error('Ошибка чтения кэша:', error);
      return null;
    }
  }

  /**
   * Кэшировать расписание
   */
  private cacheSchedule(courtType: CourtType, schedule: FeeSchedule): void {
    try {
      const cacheKey = FeeDataService.STORAGE_KEY_PREFIX + courtType;
      localStorage.setItem(cacheKey, JSON.stringify(schedule));
    } catch (error) {
      console.error('Ошибка записи в кэш:', error);
    }
  }

  /**
   * Валидировать целостность расписания
   */
  private validateScheduleIntegrity(schedule: FeeSchedule): boolean {
    try {
      if (!schedule.rules || schedule.rules.length === 0) {
        return false;
      }

      // Проверяем версию
      if (schedule.version !== FeeDataService.CURRENT_VERSION) {
        return false;
      }

      return this.validateRuleRanges(schedule.rules);
    } catch (error) {
      console.error('Ошибка валидации расписания:', error);
      return false;
    }
  }

  /**
   * Валидировать диапазоны правил
   */
  private validateRuleRanges(rules: FeeRule[]): boolean {
    try {
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        
        // Проверяем корректность диапазона
        if (rule.minAmount < 0) {
          return false;
        }
        
        if (rule.maxAmount !== null && rule.maxAmount <= rule.minAmount) {
          return false;
        }
        
        // Проверяем непрерывность диапазонов
        if (i > 0) {
          const prevRule = rules[i - 1];
          if (prevRule.maxAmount !== null && rule.minAmount !== prevRule.maxAmount + 1) {
            return false;
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка валидации диапазонов:', error);
      return false;
    }
  }

  /**
   * Вычислить контрольную сумму данных
   */
  private calculateDataChecksum(): string {
    try {
      const generalRules = JSON.stringify(GENERAL_JURISDICTION_RULES);
      const arbitrationRules = JSON.stringify(ARBITRATION_RULES);
      const combined = generalRules + arbitrationRules + FeeDataService.CURRENT_VERSION;
      
      // Простая хэш-функция для демонстрации
      let hash = 0;
      for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Конвертируем в 32-битное число
      }
      
      return Math.abs(hash).toString(16);
    } catch (error) {
      console.error('Ошибка вычисления контрольной суммы:', error);
      return 'unknown';
    }
  }
}

/**
 * Экспортируем экземпляр сервиса для использования в приложении
 */
export const feeDataService = new FeeDataService();