import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import './i18n';
import { initGA } from "./lib/analytics/googleAnalytics";
import { initConversionTracking } from "./lib/analytics/conversionTracking";
import { registerServiceWorker } from "./utils/serviceWorker";
import { initYandexMetrika } from "./hooks/useYandexMetrika";

// Add no-transition class to prevent flash on initial load
document.body.classList.add('no-transition');

// Initialize analytics
initGA();
initYandexMetrika();
initConversionTracking();

// Register Service Worker for caching
if (import.meta.env.PROD) {
  registerServiceWorker();
}

createRoot(document.getElementById("root")!).render(<App />);
