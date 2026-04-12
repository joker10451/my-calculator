import { Link } from 'react-router-dom';
import { BANKS } from '@/lib/seoPages';
import { Star, Building2, ArrowRight, TrendingUp, Percent, Wallet } from 'lucide-react';
import { SEO } from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SITE_URL = 'https://schitay-online.ru';

const PRODUCT_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  mortgage: { label: 'Ипотека', color: 'text-blue-400 bg-blue-500/10', icon: Building2 },
  credit: { label: 'Кредит', color: 'text-emerald-400 bg-emerald-500/10', icon: Wallet },
  deposit: { label: 'Вклад', color: 'text-amber-400 bg-amber-500/10', icon: TrendingUp },
};

export default function BanksRatingPage() {
  const sorted = [...BANKS].sort((a, b) => b.rating - a.rating);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <SEO
        title="Рейтинг банков 2026 — ставки по ипотеке, кредитам и вкладам"
        description="Сравните ставки крупнейших банков России: ипотека, кредиты, вклады. Рейтинг на основе ставок и отзывов клиентов."
        keywords="рейтинг банков 2026, сравнение ставок банков, ипотека банки ставки, вклады банки ставки"
        canonical={`${SITE_URL}/banks`}
      />
      <Header />

      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Building2 className="w-4 h-4" />
              Рейтинг банков
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-100 mb-4 tracking-tight">
              Банки России — ставки 2026
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Сравните ставки по ипотеке, кредитам и вкладам у крупнейших банков. Данные актуальны на 2026 год.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid gap-4">
              {sorted.map((bank, idx) => (
                <div
                  key={bank.bankSlug}
                  className="surface-card p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl font-black text-slate-300 flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-slate-100 truncate">{bank.bankName}</h2>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold text-slate-200">{bank.rating}</span>
                        <span className="text-xs text-slate-500">/5</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 flex-1">
                    <Link to={`/bank/${bank.bankSlug}/mortgage`} className="group text-center p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/30 transition-colors">
                      <Percent className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                      <div className="text-xs text-slate-500">Ипотека</div>
                      <div className="text-lg font-black text-blue-400">{bank.mortgageRate}%</div>
                    </Link>
                    <Link to={`/bank/${bank.bankSlug}/credit`} className="group text-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
                      <Wallet className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                      <div className="text-xs text-slate-500">Кредит</div>
                      <div className="text-lg font-black text-emerald-400">{bank.creditRate}%</div>
                    </Link>
                    <Link to={`/bank/${bank.bankSlug}/deposit`} className="group text-center p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/30 transition-colors">
                      <TrendingUp className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                      <div className="text-xs text-slate-500">Вклад</div>
                      <div className="text-lg font-black text-amber-400">{bank.depositRate}%</div>
                    </Link>
                  </div>

                  <div className="flex-shrink-0">
                    <Link
                      to={`/bank/${bank.bankSlug}/mortgage`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      Подробнее
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-16 text-center">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">Не нашёл свой банк?</h2>
            <p className="text-slate-400 mb-6">Попробуй наш калькулятор — он считает по актуальным ставкам ЦБ</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/calculator/mortgage" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-sm">
                Ипотечный калькулятор
              </Link>
              <Link to="/calculator/credit" className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-700 text-slate-200 font-bold rounded-xl hover:border-primary hover:text-primary transition-colors text-sm">
                Кредитный калькулятор
              </Link>
              <Link to="/calculator/deposit" className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-700 text-slate-200 font-bold rounded-xl hover:border-primary hover:text-primary transition-colors text-sm">
                Калькулятор вкладов
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
