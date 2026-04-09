import { ArrowRight, Briefcase, Clock3, ShieldCheck, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const JobsLandingPage = () => {
  return (
    <>
      <Helmet>
        <title>Работа и подработка в Москве — курьер и мастер | Считай.RU</title>
        <meta
          name="description"
          content="Подберите актуальную работу и подработку: курьерские вакансии и заказы для мастеров. Быстрый старт, понятные условия, удобный формат."
        />
        <link rel="canonical" href="https://schitay-online.ru/jobs/" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-950">
        <Header />
        <main id="main-content" className="flex-1 pt-16">
          <section className="section-shell pt-4 md:pt-6">
            <div className="hero-premium">
              <div className="hero-eyebrow">
                <Briefcase className="w-4 h-4" />
                Подбор вакансий 2026
              </div>
              <h1 className="hero-title">
                Найдите работу, с которой удобно стартовать уже сегодня
              </h1>
              <p className="hero-lead">
                Собрали направления с понятным входом: курьерские вакансии и работа для мастеров по ремонту.
                Выберите формат под ваш график и опыт.
              </p>
              <div className="hero-actions">
                <Link
                  to="/offers?category=vacancies"
                  className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-5 py-3 font-bold hover:bg-slate-100 transition-colors"
                >
                  Смотреть все вакансии
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/courier-yandex"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 text-white px-5 py-3 font-semibold hover:bg-white/20 transition-colors"
                >
                  Курьерские вакансии
                </Link>
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 pb-12 md:pb-16">
            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-4 mb-8">
              <div className="surface-card p-5">
                <Clock3 className="w-5 h-5 text-primary" />
                <h2 className="mt-3 font-black text-slate-900 dark:text-slate-100">Быстрый старт</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Понятный путь старта и быстрый выход в рабочий ритм.</p>
              </div>
              <div className="surface-card p-5">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 className="mt-3 font-black text-slate-900 dark:text-slate-100">Прозрачные условия</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Смотрите требования, ограничения и формат работы до отклика.</p>
              </div>
              <div className="surface-card p-5">
                <Wrench className="w-5 h-5 text-primary" />
                <h2 className="mt-3 font-black text-slate-900 dark:text-slate-100">Формат под вас</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Есть варианты для курьеров и мастеров с разной загрузкой.</p>
              </div>
            </div>

            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-5">
              <article className="surface-card p-6">
                <p className="inline-flex rounded-full bg-primary/10 text-primary text-xs font-bold px-3 py-1">Популярно</p>
                <h3 className="mt-3 text-2xl font-black text-slate-900 dark:text-slate-100">Курьер Яндекс.Еда / Яндекс.Лавка</h3>
                <p className="text-slate-600 dark:text-slate-300 mt-2">
                  Подходит тем, кто хочет гибкий график и быстрый вход без долгого ожидания.
                </p>
                <div className="mt-5">
                  <Link
                    to="/courier-yandex"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 font-bold hover:opacity-90 transition-opacity"
                  >
                    Открыть страницу вакансии
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>

              <article className="surface-card p-6">
                <p className="inline-flex rounded-full bg-primary/10 text-primary text-xs font-bold px-3 py-1">Для мастеров</p>
                <h3 className="mt-3 text-2xl font-black text-slate-900 dark:text-slate-100">Сервис «Руки»</h3>
                <p className="text-slate-600 dark:text-slate-300 mt-2">
                  Для мастеров по ремонту в Москве: понятные требования и стабильный поток заказов.
                </p>
                <div className="mt-5">
                  <Link
                    to="/ruki-masters"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 font-bold hover:opacity-90 transition-opacity"
                  >
                    Открыть страницу вакансии
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default JobsLandingPage;
