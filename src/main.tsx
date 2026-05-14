import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import './i18n';
import { initGA } from "./lib/analytics/googleAnalytics";
import { initConversionTracking } from "./lib/analytics/conversionTracking";
import { registerServiceWorker } from "./utils/serviceWorker";
// Add no-transition class to prevent flash on initial load
document.documentElement.classList.add('no-transition');

// Initialize analytics (Yandex Metrika is loaded in index.html directly)
initGA();
initConversionTracking();

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
