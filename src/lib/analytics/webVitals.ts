/**
 * Web Vitals — мониторинг Core Web Vitals (CLS, FID, LCP, INP, TTFB)
 * Отправляет данные в Яндекс Метрику как параметры визита
 */

import type { Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  // Отправляем в Яндекс Метрику (если не заблокирована адблокером)
  if (typeof window !== 'undefined' && typeof window.ym === 'function') {
    try {
      window.ym(106217699, 'params', {
        web_vitals: {
          [metric.name]: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          [`${metric.name}_rating`]: metric.rating,
        },
      });
    } catch { /* ignore if ym unavailable */ }
  }
}

export function initWebVitals() {
  // Lazy-load web-vitals для минимального влияния на загрузку
  import('web-vitals').then(({ onCLS, onLCP, onINP, onTTFB }) => {
    onCLS(sendToAnalytics);
    onLCP(sendToAnalytics);
    onINP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  }).catch(() => { /* web-vitals unavailable */ });
}
