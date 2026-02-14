/**
 * Хук для интеграции Яндекс Метрики с React Router
 * Отслеживает переходы между страницами в SPA
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Расширяем глобальный объект Window для TypeScript
declare global {
  interface Window {
    ym?: (
      counterId: number,
      method: string,
      ...params: unknown[]
    ) => void;
  }
}

const YANDEX_METRIKA_ID = 106217699;

/**
 * Хук для отслеживания переходов между страницами в Яндекс Метрике
 */
export const useYandexMetrika = () => {
  const location = useLocation();

  useEffect(() => {
    // Проверяем, что Яндекс Метрика загружена
    if (typeof window.ym === 'function') {
      // Формируем корректный URL для HashRouter
      const baseUrl = window.location.origin + window.location.pathname;
      const hash = location.pathname + location.search + location.hash;
      const url = baseUrl + '#' + hash;
      
      // Отправляем хит в Яндекс Метрику
      window.ym(YANDEX_METRIKA_ID, 'hit', url, {
        title: document.title,
        referer: document.referrer
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Yandex Metrika: page view tracked', url);
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Yandex Metrika is not loaded (may be blocked by ad blocker)');
      }
    }
  }, [location.pathname, location.search, location.hash]);
};

/**
 * Функция для отслеживания целей в Яндекс Метрике
 * @param goalName - название цели
 * @param params - дополнительные параметры
 */
export const trackYandexGoal = (goalName: string, params?: Record<string, unknown>) => {
  if (typeof window.ym === 'function') {
    window.ym(YANDEX_METRIKA_ID, 'reachGoal', goalName, params);
    if (process.env.NODE_ENV === 'development') {
      console.log('Yandex Metrika: goal tracked', goalName, params);
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Yandex Metrika is not loaded (may be blocked by ad blocker)');
    }
  }
};

/**
 * Функция для отслеживания параметров визита
 * @param params - параметры визита
 */
export const trackYandexParams = (params: Record<string, unknown>) => {
  if (typeof window.ym === 'function') {
    window.ym(YANDEX_METRIKA_ID, 'params', params);
    if (process.env.NODE_ENV === 'development') {
      console.log('Yandex Metrika: params tracked', params);
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Yandex Metrika is not loaded (may be blocked by ad blocker)');
    }
  }
};
