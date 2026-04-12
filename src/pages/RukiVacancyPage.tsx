import { ArrowRight, CheckCircle2, Clock3, ShieldCheck, Wrench } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AffiliateLink } from "@/components/AffiliateLink";
import { AFFILIATE_LINKS } from "@/config/affiliateLinks";
import { SITE_URL } from '@/shared/constants';


const OFFER_KEY = "ruki-vacancy-moscow";
const OFFER = AFFILIATE_LINKS[OFFER_KEY];

export default function RukiVacancyPage() {
  const ctaVariant = useMemo<"a" | "b">(() => {
    const key = "ab_cta_ruki_masters";
    const saved = localStorage.getItem(key);
    if (saved === "a" || saved === "b") return saved;
    const assigned = Math.random() < 0.5 ? "a" : "b";
    localStorage.setItem(key, assigned);
    return assigned;
  }, []);

  const heroTitle =
    ctaVariant === "a"
      ? "Сервис «Руки» — работа для мастеров по ремонту в Москве"
      : "Стабильные заказы для мастеров по ремонту в Москве";

  const heroCtaLabel = ctaVariant === "a" ? "Оставить заявку" : "Смотреть заказы и условия";
  const finalCtaLabel = ctaVariant === "a" ? "Перейти к анкете" : "Начать оформление";

  return (
    <>
      <Helmet>
        <title>Сервис «Руки» — вакансии для мастеров в Москве | Считай.RU</title>
        <meta
          name="description"
          content="Вакансии для мастеров по ремонту в Москве: стабильный поток заказов, гибкий формат работы и понятные условия."
        />
        <link rel="canonical" href={`${SITE_URL}/ruki-masters/`} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-950">
        <Header />
        <main id="main-content" className="flex-1 pt-16">
          <section className="section-shell pt-4 md:pt-6">
            <div className="hero-premium">
              <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold">Для мастеров</p>
              <h1 className="hero-title">
                {heroTitle}
              </h1>
              <p className="hero-lead">
                Подходит мастерам по межкомнатным дверям и сборке кухонь. Выбирайте комфортный формат и
                подключайтесь к потоку заказов.
              </p>

              <div className="hero-actions">
                <AffiliateLink
                  href={OFFER.url}
                  partnerName={OFFER.bankId}
                  productType={OFFER.productType || "vacancies"}
                  offerId={OFFER_KEY}
                  placement="hero"
                  className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-5 py-3 font-bold hover:bg-slate-100 transition-colors"
                >
                  {heroCtaLabel}
                  <ArrowRight className="w-4 h-4" />
                </AffiliateLink>
                <Link
                  to="/offers?category=vacancies"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 font-semibold hover:bg-white/20 transition-colors"
                >
                  Все вакансии
                </Link>
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 pb-14 md:pb-16">
            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-4">
              <div className="surface-card p-5">
                <Wrench className="w-5 h-5 text-primary" />
                <h2 className="mt-3 font-black text-slate-900 dark:text-slate-100">Заказы по профилю</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Работы по установке дверей и сборке кухонь.</p>
              </div>
              <div className="surface-card p-5">
                <Clock3 className="w-5 h-5 text-primary" />
                <h2 className="mt-3 font-black text-slate-900 dark:text-slate-100">Гибкий формат</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Можно выбирать удобную загрузку и режим работы.</p>
              </div>
              <div className="surface-card p-5">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 className="mt-3 font-black text-slate-900 dark:text-slate-100">Понятные условия</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Прозрачные этапы оформления и правила сервиса.</p>
              </div>
            </div>

            <div className="max-w-6xl mx-auto mt-7 surface-card p-6 md:p-8">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100">Кому подойдёт</h3>
              <div className="mt-4 grid md:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                {[
                  "Мастерам с опытом от 1 года",
                  "Тем, у кого есть рабочий смартфон и инструмент",
                  "Тем, кто ищет подработку или полную загрузку",
                  "Тем, кто работает по Москве",
                ].map((item) => (
                  <p key={item} className="surface-muted px-4 py-3 text-sm">
                    <CheckCircle2 className="inline-block w-4 h-4 mr-2 text-emerald-600" />
                    {item}
                  </p>
                ))}
              </div>

              <div className="mt-7">
                <AffiliateLink
                  href={OFFER.url}
                  partnerName={OFFER.bankId}
                  productType={OFFER.productType || "vacancies"}
                  offerId={OFFER_KEY}
                  placement="result_block"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 font-bold hover:opacity-90 transition-opacity"
                >
                  {finalCtaLabel}
                  <ArrowRight className="w-4 h-4" />
                </AffiliateLink>
              </div>
            </div>

            <div className="max-w-6xl mx-auto mt-6 text-xs text-slate-500">
              {OFFER.erid && <p>Реклама • erid: {OFFER.erid}</p>}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
