import { useParams, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { SEO_LANDINGS } from '@/data/seoLandings';
import { SEO } from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CalculatorLoadingSkeleton } from '@/components/LoadingSkeleton';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const MortgageCalculatorWithComparison = lazy(() => import('@/components/calculators/mortgage/MortgageCalculatorWithComparison'));
const CreditCalculator = lazy(() => import('@/components/calculators/CreditCalculator'));
const DepositCalculator = lazy(() => import('@/components/calculators/DepositCalculator'));

export default function SeoLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const config = SEO_LANDINGS.find(l => l.slug === slug);

  if (!config) return <Navigate to="/404" replace />;

  const calcTypeLabels = {
    mortgage: { label: 'Ипотечный калькулятор', href: '/calculator/mortgage' },
    credit: { label: 'Кредитный калькулятор', href: '/calculator/credit' },
    deposit: { label: 'Калькулятор вкладов', href: '/calculator/deposit' },
  };

  const calcInfo = calcTypeLabels[config.calculatorType];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title={config.title}
        description={config.description}
        canonical={`https://schitay-online.ru/calc/${config.slug}`}
      />
      <Header />

      <main id="main-content" className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6" aria-label="Навигация">
            <Link to="/" className="hover:text-primary">Главная</Link>
            <span className="mx-2">/</span>
            <Link to={calcInfo.href} className="hover:text-primary">{calcInfo.label}</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{config.h1}</span>
          </nav>

          {/* H1 */}
          <h1 className="text-2xl md:text-4xl font-black text-foreground mb-4 tracking-tight">
            {config.h1}
          </h1>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            {config.description.replace(/ \| Считай\.RU$/, '')}
          </p>

          {/* Калькулятор */}
          <Suspense fallback={<CalculatorLoadingSkeleton />}>
            {config.calculatorType === 'mortgage' && (
              <MortgageCalculatorWithComparison />
            )}
            {config.calculatorType === 'credit' && (
              <CreditCalculator />
            )}
            {config.calculatorType === 'deposit' && (
              <DepositCalculator />
            )}
          </Suspense>

          {/* Ссылки на похожие расчёты */}
          <div className="mt-12 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Похожие расчёты</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {SEO_LANDINGS
                .filter(l => l.calculatorType === config.calculatorType && l.slug !== config.slug)
                .slice(0, 6)
                .map(landing => (
                  <Link
                    key={landing.slug}
                    to={`/calc/${landing.slug}`}
                    className="flex items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors group"
                  >
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{landing.h1}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary ml-auto flex-shrink-0" />
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
