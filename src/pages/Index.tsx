import { lazy, Suspense, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import PopularCalculators from "@/components/PopularCalculators";
import PersonalizedRecommendations from "@/components/PersonalizedRecommendations";
import { SEO } from "@/components/SEO";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CalculatorOfTheDay } from "@/components/CalculatorOfTheDay";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const BlogSection = lazy(() => import("@/components/blog/BlogSection"));
const Footer = lazy(() => import("@/components/Footer"));
const RecentCalculators = lazy(() => import("@/components/RecentCalculators"));
const CalculatorOfTheWeek = lazy(() => import("@/components/CalculatorOfTheWeek"));
const CurrencyRatesWidget = lazy(() => import("@/components/CurrencyRatesWidget"));

const Index = () => {
  const location = useLocation();

  // Обработка скроллинга к якорям (например, /#categories)
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://schitay-online.ru/#website',
        'url': 'https://schitay-online.ru/',
        'name': 'Считай.RU',
        'description': 'Бесплатные онлайн калькуляторы для России и СНГ',
        'publisher': { '@id': 'https://schitay-online.ru/#organization' },
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
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://schitay-online.ru/icon.svg'
        }
      }
    ]
  };

  return (
    <>
      <SEO
        title="Считай.RU — Онлайн калькуляторы для России и СНГ"
        description="Бесплатные онлайн калькуляторы: ипотека, кредит, зарплата, ЖКХ, налоги, здоровье. Точные расчёты по актуальным данным РФ за 10 секунд."
        keywords="калькулятор онлайн, ипотека калькулятор, расчёт кредита, зарплата на руки, ЖКХ калькулятор"
        canonical="https://schitay-online.ru/"
        ogImage="https://schitay-online.ru/og-image.png"
        structuredData={organizationSchema}
      />

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main id="main-content" className="flex-1">
          <Hero />
          <Suspense fallback={<div className="h-12" />}>
            <CurrencyRatesWidget />
          </Suspense>
          <ErrorBoundary fallback={null}>
            <CalculatorOfTheDay />
          </ErrorBoundary>
          <Categories />
          <PopularCalculators />
          <Suspense fallback={<div className="py-12 container mx-auto px-4"><Skeleton className="h-8 w-64 mb-6" /><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div></div>}>
            <RecentCalculators />
          </Suspense>
          <Suspense fallback={<div className="py-12 container mx-auto px-4"><Skeleton className="h-8 w-48 mb-6 mx-auto" /><Skeleton className="h-40 rounded-xl" /></div>}>
            <CalculatorOfTheWeek />
          </Suspense>
          <ErrorBoundary fallback={null}>
            <PersonalizedRecommendations />
          </ErrorBoundary>
          <section className="section-shell">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-black text-foreground mb-6 text-center">Сравнения</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link to="/compare/mortgage-vs-credit/" className="surface-card surface-card-hover p-5 text-center">
                  <span className="text-3xl">🏠 <span className="text-muted-foreground">VS</span> 💳</span>
                  <h3 className="mt-3 text-sm font-bold text-foreground">Ипотека или кредит</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Что выгоднее для покупки жилья?</p>
                </Link>
                <Link to="/compare/osago-vs-kasko/" className="surface-card surface-card-hover p-5 text-center">
                  <span className="text-3xl">📜 <span className="text-muted-foreground">VS</span> 🛡️</span>
                  <h3 className="mt-3 text-sm font-bold text-foreground">ОСАГО или КАСКО</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Какую страховку выбрать для авто?</p>
                </Link>
                <Link to="/compare/deposit-vs-investment/" className="surface-card surface-card-hover p-5 text-center">
                  <span className="text-3xl">🏦 <span className="text-muted-foreground">VS</span> 📈</span>
                  <h3 className="mt-3 text-sm font-bold text-foreground">Вклад или инвестиции</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Куда выгоднее положить деньги?</p>
                </Link>
                <Link to="/compare/salary-vs-self-employed/" className="surface-card surface-card-hover p-5 text-center">
                  <span className="text-3xl">💼 <span className="text-muted-foreground">VS</span> 🧑‍💻</span>
                  <h3 className="mt-3 text-sm font-bold text-foreground">Найм или самозанятость</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Где ты заработаешь больше?</p>
                </Link>
                <Link to="/compare/refinancing-vs-new-credit/" className="surface-card surface-card-hover p-5 text-center">
                  <span className="text-3xl">🔄 <span className="text-muted-foreground">VS</span> 💳</span>
                  <h3 className="mt-3 text-sm font-bold text-foreground">Рефинансирование или новый кредит</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Как сэкономить на процентах?</p>
                </Link>
                <Link to="/compare/vacation-vs-sick-leave/" className="surface-card surface-card-hover p-5 text-center">
                  <span className="text-3xl">🏖️ <span className="text-muted-foreground">VS</span> 🤒</span>
                  <h3 className="mt-3 text-sm font-bold text-foreground">Отпускные или больничный</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Сколько платят в каждом случае?</p>
                </Link>
              </div>
            </div>
          </section>
          <section className="section-shell">
            <div className="max-w-5xl mx-auto surface-card p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-foreground">Подбор предложений по вашим задачам</h2>
                  <p className="text-muted-foreground mt-2">
                    Собрали актуальные предложения в одном месте: карты, займы, страхование и вакансии.
                  </p>
                  <p className="text-sm text-muted-foreground dark:text-slate-400 mt-2">
                    Для мастеров по ремонту есть отдельная подборка:{" "}
                    <Link to="/offers?category=vacancies&q=руки" className="font-semibold text-primary hover:underline">
                      вакансии «Сервис Руки»
                    </Link>
                    .
                  </p>
                </div>
                <Link
                  to="/offers"
                  className="cta-primary"
                >
                  Открыть каталог
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="max-w-5xl mx-auto mt-5 grid md:grid-cols-3 gap-4">
              <Link
                to="/jobs"
                className="surface-card surface-card-hover p-5"
              >
                <p className="text-xs font-bold text-primary">Новая посадочная</p>
                <h3 className="mt-2 text-xl font-black text-foreground">Работа и подработка</h3>
                <p className="mt-2 text-muted-foreground text-sm">
                  Современная страница с быстрым выбором: курьерские вакансии и работа для мастеров.
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-primary font-bold text-sm">
                  Открыть вакансии
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
              <Link
                to="/tick-insurance"
                className="surface-card surface-card-hover p-5"
              >
                <p className="text-xs font-bold text-primary">Сезонный спрос</p>
                <h3 className="mt-2 text-xl font-black text-foreground">Защита от клеща</h3>
                <p className="mt-2 text-muted-foreground text-sm">
                  Понятная посадочная со сценариями и переходом к релевантным страховым предложениям.
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-primary font-bold text-sm">
                  Открыть страницу страхования
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
              <Link
                to="/goldapple"
                className="surface-card surface-card-hover p-5"
              >
                <p className="text-xs font-bold text-primary">E-com оффер</p>
                <h3 className="mt-2 text-xl font-black text-foreground">Золотое Яблоко</h3>
                <p className="mt-2 text-muted-foreground text-sm">
                  Переход к актуальным акциям и ассортименту косметики и парфюмерии.
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-primary font-bold text-sm">
                  Открыть предложения
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </section>
          <Suspense fallback={<section className="section-shell"><div className="h-40 rounded-2xl border border-border bg-muted animate-pulse" /></section>}>
            <BlogSection />
          </Suspense>
        </main>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </div>
    </>
  );
};

export default Index;
