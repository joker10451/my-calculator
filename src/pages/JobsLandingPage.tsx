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

      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main id="main-content" className="flex-1 pt-16">
          <section className="container mx-auto px-4 pt-4 pb-10 md:pt-6 md:pb-14">
            <div className="max-w-6xl mx-auto rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6 md:p-10 text-white shadow-xl">
              <div className="flex items-center gap-2 text-blue-200 text-sm font-semibold">
                <Briefcase className="w-4 h-4" />
                Подбор вакансий 2026
              </div>
              <h1 className="mt-3 text-3xl md:text-5xl font-black leading-tight">
                Найдите работу, с которой удобно стартовать уже сегодня
              </h1>
              <p className="mt-4 text-slate-200 max-w-3xl text-base md:text-lg">
                Собрали направления с понятным входом: курьерские вакансии и работа для мастеров по ремонту.
                Выберите формат под ваш график и опыт.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
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
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Clock3 className="w-5 h-5 text-primary" />
                <h2 className="mt-3 font-black text-slate-900">Быстрый старт</h2>
                <p className="text-sm text-slate-600 mt-2">Понятный путь старта и быстрый выход в рабочий ритм.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 className="mt-3 font-black text-slate-900">Прозрачные условия</h2>
                <p className="text-sm text-slate-600 mt-2">Смотрите требования, ограничения и формат работы до отклика.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Wrench className="w-5 h-5 text-primary" />
                <h2 className="mt-3 font-black text-slate-900">Формат под вас</h2>
                <p className="text-sm text-slate-600 mt-2">Есть варианты для курьеров и мастеров с разной загрузкой.</p>
              </div>
            </div>

            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-5">
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="inline-flex rounded-full bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1">Популярно</p>
                <h3 className="mt-3 text-2xl font-black text-slate-900">Курьер Яндекс.Еда / Яндекс.Лавка</h3>
                <p className="text-slate-600 mt-2">
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

              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="inline-flex rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1">Для мастеров</p>
                <h3 className="mt-3 text-2xl font-black text-slate-900">Сервис «Руки»</h3>
                <p className="text-slate-600 mt-2">
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
