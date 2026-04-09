import { lazy, Suspense, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import PopularCalculators from "@/components/PopularCalculators";
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

      <div className="min-h-screen flex flex-col">
        <Header />
        <main id="main-content" className="flex-1">
          <Hero />
          <Categories />
          <PopularCalculators />
          <section className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-5xl mx-auto rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900">Подбор предложений по вашим задачам</h2>
                  <p className="text-slate-600 mt-2">
                    Собрали актуальные предложения в одном месте: карты, займы, страхование и вакансии.
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Для мастеров по ремонту есть отдельная подборка:{" "}
                    <Link to="/offers?category=vacancies&q=руки" className="font-semibold text-primary hover:underline">
                      вакансии «Сервис Руки»
                    </Link>
                    .
                  </p>
                </div>
                <Link
                  to="/offers"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Открыть каталог
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="max-w-5xl mx-auto mt-5 grid md:grid-cols-2 gap-4">
              <Link
                to="/jobs"
                className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-xs font-bold text-blue-700">Новая посадочная</p>
                <h3 className="mt-2 text-xl font-black text-slate-900">Работа и подработка</h3>
                <p className="mt-2 text-slate-600 text-sm">
                  Современная страница с быстрым выбором: курьерские вакансии и работа для мастеров.
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-primary font-bold text-sm">
                  Открыть /jobs
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
              <Link
                to="/tick-insurance"
                className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-xs font-bold text-emerald-700">Сезонный спрос</p>
                <h3 className="mt-2 text-xl font-black text-slate-900">Защита от клеща</h3>
                <p className="mt-2 text-slate-600 text-sm">
                  Понятная посадочная со сценариями и переходом к релевантным страховым предложениям.
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-primary font-bold text-sm">
                  Открыть /tick-insurance
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </section>
          <Suspense fallback={<section className="container mx-auto px-4 py-12"><div className="h-40 rounded-3xl border border-slate-200 bg-slate-100/70 animate-pulse" /></section>}>
            <BlogSection />
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
