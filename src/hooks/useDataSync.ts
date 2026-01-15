/**
 * React хук для работы с автоматической синхронизацией данных
 * Позволяет компонентам отслеживать статус синхронизации и управлять ею
 */

import { useState, useEffect, useCallback } from 'react';
import { dataSyncManager, type SyncResult } from '../lib/database/dataSync';
import type { SyncStatus } from '../types/bank';

export interface DataSyncHookResult {
  syncStatus: SyncStatus;
  isSyncing: boolean;
  lastSync: string | null;
  errors: string[];
  dataFreshness: 'fresh' | 'stale' | 'outdated' | 'unknown';
  syncNow: () => Promise<SyncResult[]>;
  checkFreshness: () => Promise<void>;
}

/**
 * Хук для работы с синхронизацией данных
 */
export function useDataSync(): DataSyncHookResult {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(dataSyncManager.getSyncStatus());
  const [dataFreshness, setDataFreshness] = useState<'fresh' | 'stale' | 'outdated' | 'unknown'>('unknown');

  // Обновляем статус синхронизации
  const updateStatus = useCallback(() => {
    setSyncStatus(dataSyncManager.getSyncStatus());
  }, []);

  // Проверяем свежесть данных
  const checkFreshness = useCallback(async () => {
    try {
      const freshness = await dataSyncManager.checkDataFreshness();
      setDataFreshness(freshness.overall);
    } catch (error) {
      console.error('Ошибка проверки свежести данных:', error);
      setDataFreshness('unknown');
    }
  }, []);

  // Запускаем синхронизацию вручную
  const syncNow = useCallback(async (): Promise<SyncResult[]> => {
    try {
      const results = await dataSyncManager.syncAll();
      updateStatus();
      await checkFreshness();
      return results;
    } catch (error) {
      console.error('Ошибка синхронизации:', error);
      throw error;
    }
  }, [updateStatus, checkFreshness]);

  // Подписываемся на изменения статуса
  useEffect(() => {
    // Обновляем статус каждые 5 секунд
    const intervalId = setInterval(() => {
      updateStatus();
    }, 5000);

    // Проверяем свежесть при монтировании
    checkFreshness();

    return () => {
      clearInterval(intervalId);
    };
  }, [updateStatus, checkFreshness]);

  return {
    syncStatus,
    isSyncing: syncStatus.is_syncing,
    lastSync: syncStatus.last_sync,
    errors: syncStatus.errors,
    dataFreshness,
    syncNow,
    checkFreshness
  };
}

/**
 * Хук для автоматической синхронизации при монтировании компонента
 */
export function useAutoSync(enabled: boolean = true): DataSyncHookResult {
  const syncHook = useDataSync();

  useEffect(() => {
    if (enabled && syncHook.dataFreshness === 'outdated') {
      console.log('Автоматическая синхронизация: данные устарели');
      syncHook.syncNow().catch(error => {
        console.error('Ошибка автоматической синхронизации:', error);
      });
    }
  }, [enabled, syncHook.dataFreshness]);

  return syncHook;
}
