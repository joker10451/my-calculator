/**
 * Локальный менеджер данных - работает только с локальными данными
 * Заменяет ApiSourceManager после удаления API инфраструктуры
 */

import { LocalDataManager } from './LocalDataManager';

export class ApiSourceManager {
  private dataManager: LocalDataManager;

  constructor() {
    // Инициализируем только локальный менеджер данных
    this.dataManager = new LocalDataManager();
  }

  /**
   * Получить расписание госпошлин (только локальные данные)
   */
  async getFeeSchedule() {
    return await this.dataManager.getFeeSchedule();
  }

  /**
   * Проверить обновления (только локальная проверка)
   */
  async checkForUpdates() {
    return await this.dataManager.checkForUpdates();
  }

  /**
   * Получить статус источников (только локальные данные)
   */
  getSourcesStatus() {
    return this.dataManager.getSourcesStatus();
  }

  /**
   * Тестирование подключения (только локальные данные)
   */
  async testAllConnections() {
    return await this.dataManager.testConnection();
  }

  /**
   * Очистить кэш
   */
  async clearCache() {
    return await this.dataManager.clearCache();
  }

  /**
   * Поиск документов (недоступен в локальном режиме)
   */
  async searchDocuments(query: string) {
    console.warn('Поиск документов недоступен в локальном режиме');
    return { success: false, data: [], error: 'Local mode only' };
  }
}