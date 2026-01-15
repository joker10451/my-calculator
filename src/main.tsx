import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initGA } from "./lib/analytics/googleAnalytics";
import { initConversionTracking } from "./lib/analytics/conversionTracking";

// Initialize analytics
initGA();
initConversionTracking();

createRoot(document.getElementById("root")!).render(<App />);
