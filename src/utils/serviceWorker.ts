/**
 * Утилиты для работы с Service Worker
 * Регистрация и управление кешированием
 */

/**
 * Регистрация Service Worker
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker registered successfully:', registration.scope);

      // Обработка обновлений
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Новая версия доступна
              console.log('New Service Worker available');
              
              // Можно показать уведомление пользователю
              if (confirm('Доступна новая версия сайта. Обновить?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  return null;
};

/**
 * Отмена регистрации Service Worker
 */
export const unregisterServiceWorker = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const success = await registration.unregister();
        console.log('Service Worker unregistered:', success);
        return success;
      }
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  }

  return false;
};

/**
 * Очистка всех кешей
 */
export const clearAllCaches = async (): Promise<void> => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('All caches cleared');
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }
};

/**
 * Проверка поддержки Service Worker
 */
export const isServiceWorkerSupported = (): boolean => {
  return 'serviceWorker' in navigator;
};

/**
 * Получение статуса Service Worker
 */
export const getServiceWorkerStatus = async (): Promise<{
  registered: boolean;
  active: boolean;
  waiting: boolean;
}> => {
  if (!isServiceWorkerSupported()) {
    return { registered: false, active: false, waiting: false };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    return {
      registered: !!registration,
      active: !!registration?.active,
      waiting: !!registration?.waiting,
    };
  } catch (error) {
    console.error('Failed to get Service Worker status:', error);
    return { registered: false, active: false, waiting: false };
  }
};
