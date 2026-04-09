import { ArrowRight, CheckCircle2, Leaf, Shield, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AffiliateLink } from "@/components/AffiliateLink";
import { AFFILIATE_LINKS } from "@/config/affiliateLinks";

const OFFER_KEY = "pari-tick-insurance";
const OFFER = AFFILIATE_LINKS[OFFER_KEY];

const TickInsuranceLandingPage = () => {
  return (
    <>
      <Helmet>
        <title>Страхование от укуса клеща — онлайн оформление | Считай.RU</title>
        <meta
          name="description"
          content="Подберите страхование от укуса клеща: оформление онлайн, понятные условия и покрытие для поездок на природу и дачи."
        />
        <link rel="canonical" href="https://schitay-online.ru/tick-insurance/" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-950">
        <Header />
        <main id="main-content" className="flex-1 pt-16">
          <section className="container mx-auto px-4 pt-4 pb-10 md:pt-6 md:pb-14">
            <div className="hero-premium">
              <div className="hero-eyebrow text-emerald-200">
                <Leaf className="w-4 h-4" />
                Сезонная защита
              </div>
              <h1 className="hero-title">
                Защитите себя и близких в сезон активности клещей
              </h1>
              <p className="hero-lead">
                Если вы часто бываете на даче, в парке или на природе, важно заранее продумать медицинскую защиту.
                Собрали удобные варианты оформления в одном месте.
              </p>
              <div className="hero-actions">
                <AffiliateLink
                  href={OFFER.url}
                  partnerName={OFFER.bankId}
                  productType={OFFER.productType || "insurance"}
                  offerId={OFFER_KEY}
                  placement="hero"
                  className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-5 py-3 font-bold hover:bg-slate-100 transition-colors"
                >
                  Подобрать полис
                  <ArrowRight className="w-4 h-4" />
                </AffiliateLink>
                <Link
                  to="/calculator/bmi"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 text-white px-5 py-3 font-semibold hover:bg-white/20 transition-colors"
                >
                  К разделу здоровья
                </Link>
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 pb-12 md:pb-16">
            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-4 mb-8">
              <div className="surface-card p-5">
                <Shield className="w-5 h-5 text-emerald-600" />
                <h2 className="mt-3 font-black text-slate-900 dark:text-slate-100">Покрытие рисков</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Финансовая защита при обращении за медпомощью по условиям программы.</p>
              </div>
              <div className="surface-card p-5">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
                <h2 className="mt-3 font-black text-slate-900 dark:text-slate-100">Медицинская поддержка</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Поддержка по вопросам лечения и действий после укуса.</p>
              </div>
              <div className="surface-card p-5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h2 className="mt-3 font-black text-slate-900 dark:text-slate-100">Оформление онлайн</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Быстрая подача заявки без лишних шагов и поездок в офис.</p>
              </div>
            </div>

            <div className="max-w-6xl mx-auto surface-card p-6 md:p-8">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100">
                Кому особенно полезно
              </h3>
              <div className="mt-4 grid md:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                <p className="surface-muted px-4 py-3">Тем, кто часто бывает на природе и в лесопарковых зонах</p>
                <p className="surface-muted px-4 py-3">Семьям с детьми, которые много времени проводят на улице</p>
                <p className="surface-muted px-4 py-3">Владельцам дач и любителям походов/рыбалки</p>
                <p className="surface-muted px-4 py-3">Тем, кто хочет заранее подготовиться к сезону</p>
              </div>

              <div className="mt-7">
                <AffiliateLink
                  href={OFFER.url}
                  partnerName={OFFER.bankId}
                  productType={OFFER.productType || "insurance"}
                  offerId={OFFER_KEY}
                  placement="result_block"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 font-bold hover:opacity-90 transition-opacity"
                >
                  Оформить полис
                  <ArrowRight className="w-4 h-4" />
                </AffiliateLink>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default TickInsuranceLandingPage;
