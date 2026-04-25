import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";

import { ComparisonProvider } from "./context/ComparisonContext";
import { useYandexMetrika } from "./hooks/useYandexMetrika";
import { trackPageView } from "./lib/analytics/googleAnalytics";
import { CalculatorLoadingSkeleton } from "./components/LoadingSkeleton";
import { SkipToContent } from "./components/SkipToContent";

import { ThemeInitializer } from "./components/ThemeInitializer";
import { ErrorBoundary } from "./components/ErrorBoundary";

const PWAInstallPrompt = lazy(() => import("./components/PWAInstallPrompt").then(m => ({ default: m.PWAInstallPrompt })));
const CookieConsent = lazy(() => import("./components/CookieConsent").then(m => ({ default: m.CookieConsent })));

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
const WaterCalculatorPage = lazy(() => import("./pages/WaterCalculatorPage"));
const AlimonyCalculatorPage = lazy(() => import("./pages/AlimonyCalculatorPage"));
const RefinancingCalculatorPage = lazy(() => import("./pages/RefinancingCalculatorPage"));
const DepositCalculatorPage = lazy(() => import("./pages/DepositCalculatorPage"));
const DepositTaxCalculatorPage = lazy(() => import("./pages/DepositTaxCalculatorPage"));
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
const OverpaymentCalculatorPage = lazy(() => import("./pages/OverpaymentCalculatorPage"));
const YandexCourierPage = lazy(() => import("./pages/YandexCourierPage"));
const JoyMoneyPage = lazy(() => import("./pages/JoyMoneyPage"));
const EmbedWidgetPage = lazy(() => import("./pages/EmbedWidgetPage"));
const BankMortgagePage = lazy(() => import("./pages/BankMortgagePage"));
const BankCreditPage = lazy(() => import("./pages/BankCreditPage"));
const BankDepositPage = lazy(() => import("./pages/BankDepositPage"));
const MFOPage = lazy(() => import("./pages/MFOPage"));
const FinancialLiteracyQuiz = lazy(() => import("./pages/FinancialLiteracyQuiz"));
const TaxDeductionCalculatorPage = lazy(() => import("./pages/TaxDeductionCalculatorPage"));
const ZettaOSGOPPage = lazy(() => import("./pages/ZettaOSGOPPage"));
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
const OffersCatalogPage = lazy(() => import("./pages/OffersCatalogPage"));
const JobsLandingPage = lazy(() => import("./pages/JobsLandingPage"));
const TickInsuranceLandingPage = lazy(() => import("./pages/TickInsuranceLandingPage"));
const RukiVacancyPage = lazy(() => import("./pages/RukiVacancyPage"));
const GoldapplePage = lazy(() => import("./pages/GoldapplePage"));

// Blog components with lazy loading (loaded on demand)
export const BlogComments = lazy(() => import("./components/blog/BlogComments"));
export const BlogShare = lazy(() => import("./components/blog/BlogShare"));
export const BlogRecommendations = lazy(() => import("./components/blog/BlogRecommendations"));
const AnalyticsDashboardPage = lazy(() => import("./pages/AnalyticsDashboardPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const BanksRatingPage = lazy(() => import("./pages/BanksRatingPage"));
const InflationCalculatorPage = lazy(() => import("./pages/InflationCalculatorPage"));
const HowMuchYouLosePage = lazy(() => import("./pages/HowMuchYouLosePage"));
const KeyRatePage = lazy(() => import("./pages/KeyRatePage"));
const FinancialLiteracyChecklist = lazy(() => import("./pages/FinancialLiteracyChecklist"));
const ComparePageWrapper = lazy(() => import("./pages/ComparePageWrapper"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => (
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <ThemeInitializer />
        <TooltipProvider>
          <ComparisonProvider>
            <SkipToContent />
            <Toaster />
            <Sonner />
            <PWAInstallPrompt />
            <CookieConsent />
            <Router>
              <YandexMetrikaTracker />
              <GoogleAnalyticsTracker />
              <AnimatedRoutes />
            </Router>
          </ComparisonProvider>
        </TooltipProvider>
      </ThemeProvider>
  </HelmetProvider>
);

// Компонент с анимированными маршрутами
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <>
      <ErrorBoundary resetKey={location.pathname}>
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
          <Route path="/calculator/overpayment" element={<OverpaymentCalculatorPage />} />
          <Route path="/courier-yandex" element={<YandexCourierPage />} />
          <Route path="/joy-money" element={<JoyMoneyPage />} />
          <Route path="/widgets" element={<EmbedWidgetPage />} />
          <Route path="/bank/:bank/mortgage" element={<BankMortgagePage />} />
          <Route path="/bank/:bank/credit" element={<BankCreditPage />} />
          <Route path="/bank/:bank/deposit" element={<BankDepositPage />} />
          <Route path="/mfo/:mfo" element={<MFOPage />} />
          <Route path="/quiz/financial-literacy" element={<FinancialLiteracyQuiz />} />
          <Route path="/calculator/tax-deduction" element={<TaxDeductionCalculatorPage />} />
          <Route path="/insurance/osgop-taxi" element={<ZettaOSGOPPage />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/calculator/maternity-capital" element={<MaternityCapitalCalculatorPage />} />

          <Route path="/calculator/water" element={<WaterCalculatorPage />} />
          <Route path="/calculator/alimony" element={<AlimonyCalculatorPage />} />
          <Route path="/calculator/refinancing" element={<RefinancingCalculatorPage />} />
          <Route path="/calculator/inflation" element={<InflationCalculatorPage />} />
          <Route path="/how-much-you-lose" element={<HowMuchYouLosePage />} />
          <Route path="/key-rate" element={<KeyRatePage />} />
          <Route path="/checklist" element={<FinancialLiteracyChecklist />} />
          <Route path="/compare/:slug" element={<ComparePageWrapper />} />
          <Route path="/calculator/deposit" element={<DepositCalculatorPage />} />
          <Route path="/calculator/deposit-tax" element={<DepositTaxCalculatorPage />} />
          <Route path="/calculator/currency" element={<CurrencyConverterPage />} />
          <Route path="/compare" element={<ComparisonPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/banks" element={<BanksRatingPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/all" element={<AllCalculatorsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/offers" element={<OffersCatalogPage />} />
          <Route path="/offers/" element={<OffersCatalogPage />} />
          <Route path="/jobs" element={<JobsLandingPage />} />
          <Route path="/jobs/" element={<JobsLandingPage />} />
          <Route path="/ruki-masters" element={<RukiVacancyPage />} />
          <Route path="/ruki-masters/" element={<RukiVacancyPage />} />
          <Route path="/tick-insurance" element={<TickInsuranceLandingPage />} />
          <Route path="/tick-insurance/" element={<TickInsuranceLandingPage />} />
          <Route path="/goldapple" element={<GoldapplePage />} />
          <Route path="/goldapple/" element={<GoldapplePage />} />
          <Route path="/admin/analytics" element={<AnalyticsDashboardPage />} />
          <Route path="/analytics-dashboard" element={<AnalyticsDashboardPage />} />
          <Route path="/analytics-dashboard/" element={<AnalyticsDashboardPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/category/:slug" element={<BlogCategoryPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          {/* Demo pages */}
          <Route path="/demo/colourful-text" element={<ColourfulTextDemo />} />
          <Route path="/demo/enhanced-blog-card" element={<EnhancedBlogCardDemo />} />
          <Route path="/demo/color-system" element={<ColorSystemDemo />} />
          <Route path="/demo/glassmorphism" element={<GlassmorphismDemo />} />
          {/* Multilingual blog routes */}
          <Route path="/:lang/blog" element={<BlogPage />} />
          <Route path="/:lang/blog/:slug" element={<BlogPostPage />} />
          <Route path="/:lang/blog/category/:slug" element={<BlogCategoryPage />} />
          {/* Sitemap for SEO */}
          <Route path="/sitemap" element={<SitemapPage />} />
          <Route path="/sitemap/" element={<SitemapPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
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
