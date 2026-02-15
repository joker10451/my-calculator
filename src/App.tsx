import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { AnimatePresence } from "framer-motion";
import { ComparisonProvider } from "./context/ComparisonContext";
import { useYandexMetrika } from "./hooks/useYandexMetrika";
import { trackPageView } from "./lib/analytics/googleAnalytics";
import { CalculatorLoadingSkeleton, PageLoadingSkeleton } from "./components/LoadingSkeleton";
import { SkipToContent } from "./components/SkipToContent";
import { PageTransition } from "./components/animations/PageTransition";
import { ThemeInitializer } from "./components/ThemeInitializer";

// Lazy loading для страниц
const Index = lazy(() => import("./pages/Index"));
const MortgageCalculatorPage = lazy(() => import("./pages/MortgageCalculatorPage"));
const SalaryCalculatorPage = lazy(() => import("./pages/SalaryCalculatorPage"));
const CreditCalculatorPage = lazy(() => import("./pages/CreditCalculatorPage"));
const BMICalculatorPage = lazy(() => import("./pages/BMICalculatorPage"));
const FuelCalculatorPage = lazy(() => import("./pages/FuelCalculatorPage"));
const UtilitiesCalculatorPage = lazy(() => import("./pages/UtilitiesCalculatorPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const MaternityCapitalCalculatorPage = lazy(() => import("./pages/MaternityCapitalCalculatorPage"));
const CalorieCalculatorPage = lazy(() => import("./pages/CalorieCalculatorPage"));
const WaterCalculatorPage = lazy(() => import("./pages/WaterCalculatorPage"));
const AlimonyCalculatorPage = lazy(() => import("./pages/AlimonyCalculatorPage"));
const RefinancingCalculatorPage = lazy(() => import("./pages/RefinancingCalculatorPage"));
const DepositCalculatorPage = lazy(() => import("./pages/DepositCalculatorPage"));
const CurrencyConverterPage = lazy(() => import("./pages/CurrencyConverterPage"));
const ComparisonPage = lazy(() => import("./pages/ComparisonPage"));
const TireSizeCalculatorPage = lazy(() => import("./pages/TireSizeCalculatorPage"));
const CourtFeeCalculatorPage = lazy(() => import("./pages/CourtFeeCalculatorPage"));
const OSAGOCalculatorPage = lazy(() => import("./pages/OSAGOCalculatorPage"));
const VacationCalculatorPage = lazy(() => import("./pages/VacationCalculatorPage"));
const SickLeaveCalculatorPage = lazy(() => import("./pages/SickLeaveCalculatorPage"));
const SelfEmployedCalculatorPage = lazy(() => import("./pages/SelfEmployedCalculatorPage"));
const PensionCalculatorPage = lazy(() => import("./pages/PensionCalculatorPage"));
const KASKOCalculatorPage = lazy(() => import("./pages/KASKOCalculatorPage"));
const InvestmentCalculatorPage = lazy(() => import("./pages/InvestmentCalculatorPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const AllCalculatorsPage = lazy(() => import("./pages/AllCalculatorsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const ContactsPage = lazy(() => import("./pages/ContactsPage"));
// Blog pages with code splitting
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const BlogCategoryPage = lazy(() => import("./pages/BlogCategoryPage"));
// Demo pages
const ColourfulTextDemo = lazy(() => import("./pages/ColourfulTextDemo"));
const EnhancedBlogCardDemo = lazy(() => import("./pages/EnhancedBlogCardDemo"));
const ColorSystemDemo = lazy(() => import("./pages/ColorSystemDemo"));
const GlassmorphismDemo = lazy(() => import("./pages/GlassmorphismDemo"));
const SitemapPage = lazy(() => import("./pages/SitemapPage"));

// Blog components with lazy loading (loaded on demand)
export const BlogComments = lazy(() => import("./components/blog/BlogComments"));
export const BlogShare = lazy(() => import("./components/blog/BlogShare"));
export const BlogRecommendations = lazy(() => import("./components/blog/BlogRecommendations"));
const AnalyticsDashboardPage = lazy(() => import("./pages/AnalyticsDashboardPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Конфигурация QueryClient с оптимизацией
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут
      gcTime: 10 * 60 * 1000, // 10 минут (ранее cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ThemeInitializer />
        <TooltipProvider>
          <ComparisonProvider>
            <SkipToContent />
            <Toaster />
            <Sonner />
            <Router>
              <YandexMetrikaTracker />
              <GoogleAnalyticsTracker />
              <AnimatedRoutes />
            </Router>
          </ComparisonProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

// Компонент с анимированными маршрутами
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<CalculatorLoadingSkeleton />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/calculator/mortgage" element={<PageTransition><MortgageCalculatorPage /></PageTransition>} />
          <Route path="/calculator/salary" element={<PageTransition><SalaryCalculatorPage /></PageTransition>} />
          <Route path="/calculator/credit" element={<PageTransition><CreditCalculatorPage /></PageTransition>} />
          <Route path="/calculator/bmi" element={<PageTransition><BMICalculatorPage /></PageTransition>} />
          <Route path="/calculator/fuel" element={<PageTransition><FuelCalculatorPage /></PageTransition>} />
          <Route path="/calculator/tire-size" element={<PageTransition><TireSizeCalculatorPage /></PageTransition>} />
          <Route path="/calculator/court-fee" element={<PageTransition><CourtFeeCalculatorPage /></PageTransition>} />
          <Route path="/calculator/utilities" element={<PageTransition><UtilitiesCalculatorPage /></PageTransition>} />
          <Route path="/calculator/osago" element={<PageTransition><OSAGOCalculatorPage /></PageTransition>} />
          <Route path="/calculator/vacation" element={<PageTransition><VacationCalculatorPage /></PageTransition>} />
          <Route path="/calculator/sick-leave" element={<PageTransition><SickLeaveCalculatorPage /></PageTransition>} />
          <Route path="/calculator/self-employed" element={<PageTransition><SelfEmployedCalculatorPage /></PageTransition>} />
          <Route path="/calculator/pension" element={<PageTransition><PensionCalculatorPage /></PageTransition>} />
          <Route path="/calculator/kasko" element={<PageTransition><KASKOCalculatorPage /></PageTransition>} />
          <Route path="/calculator/investment" element={<PageTransition><InvestmentCalculatorPage /></PageTransition>} />
          <Route path="/category/:id" element={<PageTransition><CategoryPage /></PageTransition>} />
          <Route path="/calculator/maternity-capital" element={<PageTransition><MaternityCapitalCalculatorPage /></PageTransition>} />
          <Route path="/calculator/calories" element={<PageTransition><CalorieCalculatorPage /></PageTransition>} />
          <Route path="/calculator/water" element={<PageTransition><WaterCalculatorPage /></PageTransition>} />
          <Route path="/calculator/alimony" element={<PageTransition><AlimonyCalculatorPage /></PageTransition>} />
          <Route path="/calculator/refinancing" element={<PageTransition><RefinancingCalculatorPage /></PageTransition>} />
          <Route path="/calculator/deposit" element={<PageTransition><DepositCalculatorPage /></PageTransition>} />
          <Route path="/calculator/currency" element={<PageTransition><CurrencyConverterPage /></PageTransition>} />
          <Route path="/compare" element={<PageTransition><ComparisonPage /></PageTransition>} />
          <Route path="/search" element={<PageTransition><SearchPage /></PageTransition>} />
          <Route path="/all" element={<PageTransition><AllCalculatorsPage /></PageTransition>} />
          <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><LegalPage type="privacy" /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><LegalPage type="terms" /></PageTransition>} />
          <Route path="/contacts" element={<PageTransition><ContactsPage /></PageTransition>} />
          <Route path="/admin/analytics" element={<PageTransition><AnalyticsDashboardPage /></PageTransition>} />
          <Route path="/blog" element={<PageTransition><BlogPage /></PageTransition>} />
          <Route path="/blog/:slug" element={<PageTransition><BlogPostPage /></PageTransition>} />
          <Route path="/blog/category/:slug" element={<PageTransition><BlogCategoryPage /></PageTransition>} />
          {/* Demo pages */}
          <Route path="/demo/colourful-text" element={<PageTransition><ColourfulTextDemo /></PageTransition>} />
          <Route path="/demo/enhanced-blog-card" element={<PageTransition><EnhancedBlogCardDemo /></PageTransition>} />
          <Route path="/demo/color-system" element={<PageTransition><ColorSystemDemo /></PageTransition>} />
          <Route path="/demo/glassmorphism" element={<PageTransition><GlassmorphismDemo /></PageTransition>} />
          {/* Multilingual blog routes */}
          <Route path="/:lang/blog" element={<PageTransition><BlogPage /></PageTransition>} />
          <Route path="/:lang/blog/:slug" element={<PageTransition><BlogPostPage /></PageTransition>} />
          <Route path="/:lang/blog/category/:slug" element={<PageTransition><BlogCategoryPage /></PageTransition>} />
          {/* Sitemap for SEO */}
          <Route path="/sitemap" element={<PageTransition><SitemapPage /></PageTransition>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

// Компонент для отслеживания переходов в Яндекс Метрике
const YandexMetrikaTracker = () => {
  useYandexMetrika();
  return null;
};

// Компонент для отслеживания переходов в Google Analytics
const GoogleAnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view in Google Analytics
    trackPageView(location.pathname + location.search, document.title);
  }, [location]);

  return null;
};

export default App;
