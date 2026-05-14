/**
 * Web Vitals — мониторинг Core Web Vitals (CLS, FID, LCP, INP, TTFB)
 * Отправляет данные в Яндекс Метрику как параметры визита
 */

import type { Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  // Отправляем в Яндекс Метрику
  if (typeof window.ym === 'function') {
    window.ym(106217699, 'params', {
      web_vitals: {
        [metric.name]: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        [`${metric.name}_rating`]: metric.rating, // 'good' | 'needs-improvement' | 'poor'
      },
    });
  }
}

export function initWebVitals() {
  // Lazy-load web-vitals для минимального влияния на загрузку
  import('web-vitals').then(({ onCLS, onFID, onLCP, onINP, onTTFB }) => {
    onCLS(sendToAnalytics);
    onFID(sendToAnalytics);
    onLCP(sendToAnalytics);
    onINP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  });
}
