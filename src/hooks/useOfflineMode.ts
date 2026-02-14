import { useState, useEffect } from 'react';
import { feeDataService } from '@/lib/feeDataService';

interface OfflineStatus {
  isOffline: boolean;
  isOnline: boolean;
  isOfflineReady: boolean;
  cacheStatistics: {
    totalSize: number;
    schedulesCount: number;
    exemptionsCount: number;
    lastCacheUpdate: Date | null;
    isOfflineReady: boolean;
  };
}

/**
 * Хук для работы с офлайн-режимом калькулятора госпошлин
 */
export function useOfflineMode() {
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatus>({
    isOffline: false,
    isOnline: true,
    isOfflineReady: false,
    cacheStatistics: {
      totalSize: 0,
      schedulesCount: 0,
      exemptionsCount: 0,
      lastCacheUpdate: null,
      isOfflineReady: false
    }
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Обновить статус офлайн-режима
  const updateOfflineStatus = () => {
    try {
      const isOffline = feeDataService.isInOfflineMode();
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      const cacheStats = feeDataService.getCacheStatistics();

      setOfflineStatus({
        isOffline,
        isOnline,
        isOfflineReady: cacheStats.isOfflineReady,
        cacheStatistics: cacheStats
      });
    } catch (error) {
      console.error('Ошибка обновления статуса офлайн-режима:', error);
    }
  };

  // Инициализация и подписка на события
  useEffect(() => {
    // Первоначальное обновление статуса
    updateOfflineStatus();

    // Обработчики событий сети
    const handleOnline = () => {
      updateOfflineStatus();
    };

    const handleOffline = () => {
      updateOfflineStatus();
    };

    // Подписка на события
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    // Периодическое обновление статуса
    const interval = setInterval(updateOfflineStatus, 30000); // каждые 30 секунд

    // Очистка при размонтировании
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
      clearInterval(interval);
    };
  }, []);

  // Обновить офлайн-кэш
  const refreshOfflineCache = async (): Promise<boolean> => {
    if (isRefreshing) return false;

    setIsRefreshing(true);
    try {
      await feeDataService.refreshOfflineCache();
      updateOfflineStatus();
      return true;
    } catch (error) {
      console.error('Ошибка обновления офлайн-кэша:', error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  // Очистить офлайн-кэш
  const clearOfflineCache = (): void => {
    try {
      feeDataService.clearOfflineCache();
      updateOfflineStatus();
    } catch (error) {
      console.error('Ошибка очистки офлайн-кэша:', error);
    }
  };

  // Получить размер кэша в человекочитаемом формате
  const getFormattedCacheSize = (): string => {
    const bytes = offlineStatus.cacheStatistics.totalSize;
    if (bytes === 0) return '0 Б';
    
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Получить статус готовности к офлайн-работе
  const getOfflineReadinessMessage = (): string => {
    const stats = offlineStatus.cacheStatistics;
    
    if (stats.isOfflineReady) {
      return 'Готов к работе без интернета';
    }
    
    const missing = [];
    if (stats.schedulesCount < 2) {
      missing.push('тарифные данные');
    }
    if (stats.exemptionsCount === 0) {
      missing.push('данные о льготах');
    }
    
    return `Не готов к офлайн-работе. Отсутствуют: ${missing.join(', ')}`;
  };

  return {
    // Статус
    isOffline: offlineStatus.isOffline,
    isOnline: offlineStatus.isOnline,
    isOfflineReady: offlineStatus.isOfflineReady,
    cacheStatistics: offlineStatus.cacheStatistics,
    
    // Состояние операций
    isRefreshing,
    
    // Методы
    refreshOfflineCache,
    clearOfflineCache,
    updateOfflineStatus,
    
    // Утилиты
    getFormattedCacheSize,
    getOfflineReadinessMessage
  };
}