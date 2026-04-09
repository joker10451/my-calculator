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
 * Инициализация счётчика Яндекс Метрики
 * Добавляет официальный скрипт и вызывает ym(..., 'init', ...)
 */
export const initYandexMetrika = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (typeof window.ym === 'function' || document.getElementById('yandex-metrika')) {
    return;
  }

  (function (m: Window, e: Document, t: string, r: string, i: string) {
    type YMWithCallbacks = Window['ym'] & { a?: unknown[]; l?: number };
    (m as Window & { [key: string]: unknown })[i] = (m as Window & { [key: string]: unknown })[i] || function (...args: unknown[]) {
      const ymFn = (m as Window & { [key: string]: YMWithCallbacks })[i];
      if (ymFn?.a) {
        ymFn.a.push(args);
      }
    };
    const ymFn = (m as Window & { [key: string]: YMWithCallbacks })[i];
    ymFn.l = 1 * new Date().getTime();
    for (let j = 0; j < e.scripts.length; j++) {
      if (e.scripts[j].src === r) {
        return;
      }
    }
    const k = e.createElement(t);
    const a = e.getElementsByTagName(t)[0];
    k.async = true;
    k.src = r;
    k.id = 'yandex-metrika';
    a.parentNode?.insertBefore(k, a);
  })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

  if (typeof window.ym === 'function') {
    window.ym(YANDEX_METRIKA_ID, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
    });
  }
};

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
