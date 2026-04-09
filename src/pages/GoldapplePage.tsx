import { ArrowRight, Gift, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { AffiliateLink } from "@/components/AffiliateLink";
import { AFFILIATE_LINKS } from "@/config/affiliateLinks";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SITE_URL = "https://schitay-online.ru";
const OFFER_KEY = "goldapple-ecom";
const OFFER = AFFILIATE_LINKS[OFFER_KEY];

export default function GoldapplePage() {
  return (
    <>
      <Helmet>
        <title>Золотое Яблоко — косметика и парфюмерия со скидками | Считай.RU</title>
        <meta
          name="description"
          content="Золотое Яблоко: большой выбор косметики и парфюмерии, регулярные акции и доставка по России. Перейдите к актуальным предложениям."
        />
        <link rel="canonical" href={`${SITE_URL}/goldapple/`} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-950">
        <Header />
        <main id="main-content" className="flex-1 pt-16">
          <section className="section-shell pt-4 md:pt-6">
            <div className="hero-premium">
              <div className="hero-eyebrow">
                <Sparkles className="w-4 h-4" />
                Бьюти-подборка
              </div>
              <h1 className="hero-title">Золотое Яблоко: косметика и парфюмерия с акциями</h1>
              <p className="hero-lead">
                Онлайн-магазин с большим ассортиментом и регулярными скидками. Подходит для заказов косметики, ухода
                и парфюмерии с доставкой по России.
              </p>
              <div className="hero-actions">
                <AffiliateLink
                  href={OFFER.url}
                  partnerName={OFFER.bankId}
                  productType={OFFER.productType || "ecom"}
                  offerId={OFFER_KEY}
                  placement="hero"
                  className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-5 py-3 font-bold hover:bg-slate-100 transition-colors"
                >
                  Перейти к предложениям
                  <ArrowRight className="w-4 h-4" />
                </AffiliateLink>
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 pb-12 md:pb-16">
            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-4">
              <div className="surface-card p-5">
                <Gift className="w-5 h-5 text-primary" />
                <h2 className="mt-3 font-black text-slate-900 dark:text-slate-100">Регулярные скидки</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                  Акции и спецпредложения на популярные категории косметики и ухода.
                </p>
              </div>
              <div className="surface-card p-5">
                <Truck className="w-5 h-5 text-primary" />
                <h2 className="mt-3 font-black text-slate-900 dark:text-slate-100">Доставка по России</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                  Удобные варианты получения заказа в разных регионах страны.
                </p>
              </div>
              <div className="surface-card p-5">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 className="mt-3 font-black text-slate-900 dark:text-slate-100">Официальный магазин</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                  Актуальные условия и ассортимент доступны на странице магазина.
                </p>
              </div>
            </div>

            <div className="max-w-6xl mx-auto mt-7 surface-card p-6 md:p-8">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100">Перед переходом важно</h3>
              <div className="mt-4 grid md:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                <p className="surface-muted px-4 py-3 text-sm">Ассортимент и скидки зависят от текущих акций магазина.</p>
                <p className="surface-muted px-4 py-3 text-sm">Условия по промокодам и скидкам применяются по правилам магазина.</p>
                <p className="surface-muted px-4 py-3 text-sm">Некоторые категории товаров могут не участвовать в акциях.</p>
                <p className="surface-muted px-4 py-3 text-sm">Финальная стоимость определяется на этапе оформления заказа.</p>
              </div>

              <div className="mt-7">
                <AffiliateLink
                  href={OFFER.url}
                  partnerName={OFFER.bankId}
                  productType={OFFER.productType || "ecom"}
                  offerId={OFFER_KEY}
                  placement="result_block"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 font-bold hover:opacity-90 transition-opacity"
                >
                  Открыть Золотое Яблоко
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

