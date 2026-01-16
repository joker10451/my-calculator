import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { ComparisonProvider } from "./context/ComparisonContext";
import { useYandexMetrika } from "./hooks/useYandexMetrika";
import { trackPageView } from "./lib/analytics/googleAnalytics";
import { CalculatorLoadingSkeleton, PageLoadingSkeleton } from "./components/LoadingSkeleton";
import { SkipToContent } from "./components/SkipToContent";

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
        <TooltipProvider>
          <ComparisonProvider>
            <SkipToContent />
            <Toaster />
            <Sonner />
            <Router>
              <YandexMetrikaTracker />
              <GoogleAnalyticsTracker />
              <Suspense fallback={<CalculatorLoadingSkeleton />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/calculator/mortgage" element={<MortgageCalculatorPage />} />
                  <Route path="/calculator/salary" element={<SalaryCalculatorPage />} />
                  <Route path="/calculator/credit" element={<CreditCalculatorPage />} />
                  <Route path="/calculator/bmi" element={<BMICalculatorPage />} />
                  <Route path="/calculator/fuel" element={<FuelCalculatorPage />} />
                  <Route path="/calculator/tire-size" element={<TireSizeCalculatorPage />} />
                  <Route path="/calculator/court-fee" element={<CourtFeeCalculatorPage />} />
                  <Route path="/calculator/utilities" element={<UtilitiesCalculatorPage />} />
                  <Route path="/calculator/osago" element={<OSAGOCalculatorPage />} />
                  <Route path="/calculator/vacation" element={<VacationCalculatorPage />} />
                  <Route path="/calculator/sick-leave" element={<SickLeaveCalculatorPage />} />
                  <Route path="/calculator/self-employed" element={<SelfEmployedCalculatorPage />} />
                  <Route path="/calculator/pension" element={<PensionCalculatorPage />} />
                  <Route path="/calculator/kasko" element={<KASKOCalculatorPage />} />
                  <Route path="/calculator/investment" element={<InvestmentCalculatorPage />} />
                  <Route path="/category/:id" element={<CategoryPage />} />
                  <Route path="/calculator/maternity-capital" element={<MaternityCapitalCalculatorPage />} />
                  <Route path="/calculator/calories" element={<CalorieCalculatorPage />} />
                  <Route path="/calculator/water" element={<WaterCalculatorPage />} />
                  <Route path="/calculator/alimony" element={<AlimonyCalculatorPage />} />
                  <Route path="/calculator/refinancing" element={<RefinancingCalculatorPage />} />
                  <Route path="/calculator/deposit" element={<DepositCalculatorPage />} />
                  <Route path="/calculator/currency" element={<CurrencyConverterPage />} />
                  <Route path="/compare" element={<ComparisonPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/all" element={<AllCalculatorsPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/privacy" element={<LegalPage type="privacy" />} />
                  <Route path="/terms" element={<LegalPage type="terms" />} />
                  <Route path="/contacts" element={<ContactsPage />} />
                  <Route path="/admin/analytics" element={<AnalyticsDashboardPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
                  <Route path="/blog/category/:slug" element={<BlogCategoryPage />} />
                  {/* Multilingual blog routes */}
                  <Route path="/:lang/blog" element={<BlogPage />} />
                  <Route path="/:lang/blog/:slug" element={<BlogPostPage />} />
                  <Route path="/:lang/blog/category/:slug" element={<BlogCategoryPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Router>
          </ComparisonProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

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
