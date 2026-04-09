import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import PopularCalculators from "@/components/PopularCalculators";
import BlogSection from "@/components/blog/BlogSection";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { ArrowRight } from "lucide-react";

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
                    Собрали актуальные партнёрские предложения в одном месте: карты, займы, страхование и вакансии.
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
          </section>
          <BlogSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
