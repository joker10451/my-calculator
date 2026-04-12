import { lazy, Suspense, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import PopularCalculators from "@/components/PopularCalculators";
import RecentCalculators from "@/components/RecentCalculators";
import CalculatorOfTheWeek from "@/components/CalculatorOfTheWeek";
import PersonalizedRecommendations from "@/components/PersonalizedRecommendations";
import CurrencyRatesWidget from "@/components/CurrencyRatesWidget";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { ArrowRight } from "lucide-react";

const BlogSection = lazy(() => import("@/components/blog/BlogSection"));

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

  return (
    <>
      <Helmet>
        <title>Считай.RU — Онлайн калькуляторы для России и СНГ</title>
        <meta
          name="description"
          content="Бесплатные онлайн калькуляторы: ипотека, кредит, зарплата, ЖКХ, налоги, здоровье. Точные расчёты по актуальным данным РФ за 10 секунд."
        />
        <meta name="keywords" content="калькулятор онлайн, ипотека калькулятор, расчёт кредита, зарплата на руки, ЖКХ калькулятор" />
        <link rel="canonical" href="https://schitay-online.ru/" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-950">
        <Header />
        <main id="main-content" className="flex-1">
          <Hero />
          <CurrencyRatesWidget />
          <Categories />
          <PopularCalculators />
          <RecentCalculators />
          <CalculatorOfTheWeek />
          <PersonalizedRecommendations />
          <section className="section-shell bg-slate-950">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-black text-slate-100 mb-6 text-center">Полезные инструменты</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link to="/checklist" className="surface-card surface-card-hover p-5 text-center">
                  <span className="text-3xl">📋</span>
                  <h3 className="mt-3 text-sm font-bold text-slate-200">Чек-лист финансовой грамотности</h3>
                  <p className="mt-1 text-xs text-slate-500">28 шагов к свободе. Отмечай прогресс!</p>
                </Link>
                <Link to="/how-much-you-lose" className="surface-card surface-card-hover p-5 text-center">
                  <span className="text-3xl">💸</span>
                  <h3 className="mt-3 text-sm font-bold text-slate-200">Сколько ты теряешь</h3>
                  <p className="mt-1 text-xs text-slate-500">Налоги, инфляция, скрытые платежи</p>
                </Link>
                <Link to="/key-rate" className="surface-card surface-card-hover p-5 text-center">
                  <span className="text-3xl">📊</span>
                  <h3 className="mt-3 text-sm font-bold text-slate-200">Ключевая ставка ЦБ</h3>
                  <p className="mt-1 text-xs text-slate-500">Сегодня, динамика, влияние на тебя</p>
                </Link>
              </div>
            </div>
          </section>
          <section className="section-shell bg-slate-950">
            <div className="max-w-5xl mx-auto surface-card p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100">Подбор предложений по вашим задачам</h2>
                  <p className="text-slate-600 dark:text-slate-300 mt-2">
                    Собрали актуальные предложения в одном месте: карты, займы, страхование и вакансии.
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
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
                <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-slate-100">Работа и подработка</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
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
                <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-slate-100">Защита от клеща</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
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
                <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-slate-100">Золотое Яблоко</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
                  Переход к актуальным акциям и ассортименту косметики и парфюмерии.
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-primary font-bold text-sm">
                  Открыть предложения
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </section>
          <Suspense fallback={<section className="container mx-auto px-4 py-12 bg-slate-950"><div className="h-40 rounded-3xl border border-slate-800 bg-slate-900/70 animate-pulse" /></section>}>
            <BlogSection />
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
