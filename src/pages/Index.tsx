import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import PopularCalculators from "@/components/PopularCalculators";
import { SEO } from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FadeInSection } from "@/components/FadeInSection";

const BlogSection = lazy(() => import("@/components/blog/BlogSection"));
const Footer = lazy(() => import("@/components/Footer"));
const CurrencyRatesWidget = lazy(() => import("@/components/CurrencyRatesWidget"));

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [location]);

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://schitay-online.ru/#website',
        'url': 'https://schitay-online.ru/',
        'name': 'Считай.RU',
        'description': 'Бесплатные онлайн калькуляторы для России и СНГ',
        'inLanguage': 'ru',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://schitay-online.ru/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@type': 'Organization',
        '@id': 'https://schitay-online.ru/#organization',
        'name': 'Считай.RU',
        'url': 'https://schitay-online.ru/',
        'logo': { '@type': 'ImageObject', 'url': 'https://schitay-online.ru/icon.svg' }
      }
    ]
  };

  return (
    <>
      <SEO
        title="Считай.RU — Финансовые калькуляторы для России"
        description="Бесплатные онлайн калькуляторы: ипотека, кредит, зарплата, ЖКХ, налоги. Точные расчёты по актуальным данным РФ."
        keywords="калькулятор онлайн, ипотека калькулятор, расчёт кредита, зарплата на руки"
        canonical="https://schitay-online.ru/"
        structuredData={structuredData}
      />

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main id="main-content" className="flex-1">
          {/* 1. Hero с поиском */}
          <Hero />

          {/* 2. Курсы валют (компактная строка) */}
          <Suspense fallback={<div className="h-10" />}>
            <CurrencyRatesWidget />
          </Suspense>

          {/* 3. Категории */}
          <FadeInSection>
            <Categories />
          </FadeInSection>

          {/* 4. Популярные калькуляторы */}
          <FadeInSection delay={100}>
            <PopularCalculators />
          </FadeInSection>

          {/* 5. Блог */}
          <FadeInSection delay={150}>
            <ErrorBoundary fallback={null}>
              <Suspense fallback={<div className="section-shell"><Skeleton className="h-40 rounded-2xl" /></div>}>
                <BlogSection />
              </Suspense>
            </ErrorBoundary>
          </FadeInSection>
        </main>

        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </div>
    </>
  );
};

export default Index;
