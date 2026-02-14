/**
 * Инициализация банковских API при старте приложения
 * Регистрирует все доступные API в менеджере синхронизации
 */

import { dataSyncManager } from './dataSync';
import { getAllBankApiConfigs } from './bankApiExamples';

/**
 * Инициализировать все банковские API
 */
export function initializeBankApis(): void {
  const configs = getAllBankApiConfigs();
  
  console.log(`Инициализация ${configs.length} банковских API...`);
  
  for (const config of configs) {
    try {
      dataSyncManager.addBankApi(config);
      console.log(`✓ API ${config.bank_name} зарегистрирован`);
    } catch (error) {
      console.error(`✗ Ошибка регистрации API ${config.bank_name}:`, error);
    }
  }
  
  console.log('Инициализация банковских API завершена');
}

/**
 * Проверить доступность всех банковских API
 */
export async function testBankApis(): Promise<{
  total: number;
  available: number;
  unavailable: number;
  results: Array<{ bank: string; available: boolean; error?: string }>;
}> {
  const configs = getAllBankApiConfigs();
  const results: Array<{ bank: string; available: boolean; error?: string }> = [];
  
  for (const config of configs) {
    try {
      // Пробуем выполнить простой запрос к API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };
      
      if (config.auth?.type === 'api_key' && config.auth.key) {
        headers['X-API-Key'] = config.auth.key;
      } else if (config.auth?.type === 'bearer' && config.auth.token) {
        headers['Authorization'] = `Bearer ${config.auth.token}`;
      }
      
      const response = await fetch(config.api_url, {
        signal: controller.signal,
        headers,
        method: 'GET'
      });
      
      clearTimeout(timeoutId);
      
      results.push({
        bank: config.bank_name,
        available: response.ok,
        error: response.ok ? undefined : `HTTP ${response.status}`
      });
    } catch (error) {
      results.push({
        bank: config.bank_name,
        available: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }
  
  const available = results.filter(r => r.available).length;
  const unavailable = results.filter(r => !r.available).length;
  
  return {
    total: configs.length,
    available,
    unavailable,
    results
  };
}

/**
 * Получить статистику по источникам данных
 */
export function getDataSourcesStats() {
  const sources = dataSyncManager.getSources();
  const syncStatus = dataSyncManager.getSyncStatus();
  
  return {
    total_sources: sources.length,
    active_sources: sources.filter(s => s.is_active).length,
    last_sync: syncStatus.last_sync,
    is_syncing: syncStatus.is_syncing,
    sync_progress: syncStatus.sync_progress,
    errors: syncStatus.errors,
    sources: sources.map(s => ({
      id: s.id,
      name: s.name,
      is_active: s.is_active,
      last_sync: s.last_sync,
      sync_interval: s.sync_interval
    }))
  };
}
