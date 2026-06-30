import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initGA } from "./lib/analytics/googleAnalytics";
import { initConversionTracking } from "./lib/analytics/conversionTracking";
import { initWebVitals } from "./lib/analytics/webVitals";
import { registerServiceWorker } from "./utils/serviceWorker";
// Add no-transition class to prevent flash on initial load
document.documentElement.classList.add('no-transition');

// Проверяем cookie consent перед инициализацией аналитики
const hasConsent = (() => {
  try { return localStorage.getItem('cookie_consent') === 'true'; }
  catch { return false; }
})();

if (hasConsent) {
  // Пользователь уже дал согласие — инициализируем аналитику
  initGA();
  initConversionTracking();
  initWebVitals();
} else {
  // Слушаем событие согласия (CookieConsent компонент диспатчит его)
  window.addEventListener('cookie-consent-accepted', () => {
    initGA();
    initConversionTracking();
    initWebVitals();
  }, { once: true });
}

// Register Service Worker for caching
if (import.meta.env.PROD) {
  registerServiceWorker();
}

createRoot(document.getElementById("root")!).render(<App />);

// Включаем transitions после первого рендера
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.documentElement.classList.remove('no-transition');
    document.body.classList.remove('no-transition');
  });
});

// Lazy-load i18n после отрисовки — не блокируем critical path
import('./i18n').catch(() => {});
