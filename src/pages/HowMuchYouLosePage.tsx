import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { TrendingDown, Calculator, ArrowRight, PiggyBank, Receipt, Percent, Banknote, Shield, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CPI_CATEGORIES, calculatePersonalInflation, getDefaultWeights } from '@/services/personalInflation';
import { getCPIData } from '@/services/rosstatCPI';
import { motion } from 'framer-motion';
import { SITE_URL } from '@/shared/constants';

const NDFL_RATE = 0.13;
const PFR_RATE = 0.22;
const FSS_RATE = 0.029;
const FFOMS_RATE = 0.051;
const TOTAL_INSURANCE = PFR_RATE + FSS_RATE + FFOMS_RATE;

export default function HowMuchYouLosePage() {
  const [salary, setSalary] = useState(80000);
  const [customWeights, setCustomWeights] = useState(getDefaultWeights());
  const cpi = getCPIData();

  const personalInflation = useMemo(() => calculatePersonalInflation(customWeights), [customWeights]);

  const calc = useMemo(() => {
    const ndfl = salary * NDFL_RATE;
    const onHands = salary - ndfl;
    const employerCost = salary * (1 + TOTAL_INSURANCE);
    const hiddenTaxes = employerCost - salary;
    const yearInflation = onHands * (personalInflation / 100);
    const yearNDFL = ndfl * 12;
    const yearTotalLoss = yearNDFL + yearInflation;
    const yearOnHands = onHands * 12;
    const lossPercent = (yearTotalLoss / (salary * 12)) * 100;

    return { ndfl, onHands, employerCost, hiddenTaxes, yearInflation, yearNDFL, yearTotalLoss, yearOnHands, lossPercent };
  }, [salary, personalInflation]);

  const fmt = (v: number) => v.toLocaleString('ru-RU', { maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Helmet>
        <title>Сколько ты теряешь — Калькулятор скрытых потерь | Считай.RU</title>
        <meta name="description" content="Узнай, сколько ты теряешь на налогах, инфляции и скрытых платежах. Бесплатный калькулятор потерь зарплаты." />
        <link rel="canonical" href={`${SITE_URL}/how-much-you-lose`} />
        <meta property="og:title" content="Сколько ты теряешь — Калькулятор скрытых потерь" />
        <meta property="og:description" content="Я зарабатываю X₽, а теряю Y₽ в год. Узнай свои потери!" />
      </Helmet>

      <Header />

      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <TrendingDown className="w-4 h-4" />
              Тебя облагают каждый день
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-100 mb-4 tracking-tight">
              Сколько ты <span className="text-red-400">теряешь</span> в год?
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto">
              НДФЛ, страховые взносы, инфляция — вот куда уходят твои деньги. Введи зарплату и узнай правду.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-12">
            <div className="surface-card p-8">
              <label className="text-sm font-bold text-slate-300 mb-3 block">Твоя зарплата до вычета налогов (оклад), ₽</label>
              <input
                type="number"
                value={salary}
                onChange={e => setSalary(Number(e.target.value) || 0)}
                className="w-full h-14 px-5 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 text-xl font-black outline-none focus:ring-2 focus:ring-red-500/30"
                placeholder="80 000"
              />
              <div className="flex gap-3 mt-4 flex-wrap">
                {[50000, 80000, 120000, 200000, 400000].map(v => (
                  <button
                    key={v}
                    onClick={() => setSalary(v)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${salary === v ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-slate-700 text-slate-400 hover:border-primary'}`}
                  >
                    {fmt(v)} ₽
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 mb-12">
            <div className="surface-card p-6 border-t-4 border-t-red-500">
              <Receipt className="w-6 h-6 text-red-400 mb-3" />
              <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">НДФЛ за год</div>
              <div className="text-3xl font-black text-red-400">{fmt(calc.yearNDFL)} ₽</div>
              <div className="text-sm text-slate-500 mt-2">13% каждый месяц — {fmt(calc.ndfl)} ₽</div>
            </div>

            <div className="surface-card p-6 border-t-4 border-t-amber-500">
              <TrendingDown className="w-6 h-6 text-amber-400 mb-3" />
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Инфляция съест</div>
              <div className="text-3xl font-black text-amber-400">{fmt(calc.yearInflation)} ₽</div>
              <div className="text-sm text-slate-500 mt-2">Покупательная способность падает на {personalInflation}% в год</div>
            </div>

            <div className="surface-card p-6 border-t-4 border-t-slate-500">
              <Percent className="w-6 h-6 text-slate-400 mb-3" />
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Скрытые налоги</div>
              <div className="text-3xl font-black text-slate-300">{fmt(calc.hiddenTaxes)} ₽/мес</div>
              <div className="text-sm text-slate-500 mt-2">Работодатель платит сверх оклада: ПФР 22%, ФСС 2.9%, ФФОМС 5.1%</div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto mb-16">
            <div className="surface-card p-8 bg-gradient-to-br from-red-500/5 to-amber-500/5 border border-red-500/10">
              <h2 className="text-center text-lg font-bold text-slate-200 mb-4">Итого за год ты теряешь</h2>
              <div className="text-center">
                <span className="text-5xl md:text-6xl font-black text-red-400">{fmt(calc.yearTotalLoss)}</span>
                <span className="text-2xl text-red-400"> ₽</span>
              </div>
              <div className="text-center text-sm text-slate-500 mt-3">
                Это {calc.lossPercent.toFixed(1)}% от зарплаты {fmt(salary * 12)} ₽/год
              </div>
              <div className="mt-6 p-4 rounded-xl bg-slate-900/50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">На руки:</span>
                    <span className="ml-2 font-bold text-slate-200">{fmt(calc.onHands)} ₽/мес</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Реально стоит:</span>
                    <span className="ml-2 font-bold text-slate-200">{fmt(calc.employerCost)} ₽/мес</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-xl font-bold text-slate-200 mb-6 text-center">Какая у тебя личная инфляция?</h2>
            <p className="text-sm text-slate-400 text-center mb-8">Официальная инфляция {cpi.currentYoY}% — это среднее. Твоя зависит от того, на что ты тратишь.</p>

            <div className="space-y-4">
              {CPI_CATEGORIES.map(cat => (
                <div key={cat.id} className="surface-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat.emoji}</span>
                      <span className="text-sm font-bold text-slate-200">{cat.name}</span>
                      <span className="text-xs text-red-400 font-bold">+{cat.rateYoY}%</span>
                    </div>
                    <span className="text-xs text-slate-500">{cat.description}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-20">Доля бюджета</span>
                    <input
                      type="range"
                      min={0}
                      max={60}
                      value={customWeights[cat.id]}
                      onChange={e => setCustomWeights(prev => ({ ...prev, [cat.id]: Number(e.target.value) }))}
                      className="flex-1 accent-blue-500"
                    />
                    <span className="text-xs font-bold text-primary w-8 text-right">{customWeights[cat.id]}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center surface-card p-6 border-t-4 border-t-amber-500">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Твоя личная инфляция</div>
              <div className="text-4xl font-black text-amber-400">{personalInflation}%</div>
              <div className="text-sm text-slate-500 mt-2">
                {personalInflation > cpi.currentYoY ? 'Выше официальной — ты чувствуешь это' : 'Ниже официальной — тебе повезло'}
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-xl font-bold text-slate-200 mb-6 text-center">Что с этим делать?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link to="/calculator/tax-deduction" className="surface-card surface-card-hover p-5 flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Налоговый вычет</h3>
                  <p className="text-xs text-slate-500">Верни до 260 000 ₽ за покупку квартиры и 120 000 ₽ за лечение</p>
                </div>
              </Link>
              <Link to="/calculator/deposit" className="surface-card surface-card-hover p-5 flex items-start gap-3">
                <PiggyBank className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Вклад под 15%+</h3>
                  <p className="text-xs text-slate-500">Перекрой инфляцию и сохрани покупательную способность</p>
                </div>
              </Link>
              <Link to="/calculator/mortgage" className="surface-card surface-card-hover p-5 flex items-start gap-3">
                <Banknote className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Рефинансирование</h3>
                  <p className="text-xs text-slate-500">Снизь ставку по кредиту и экономь каждый месяц</p>
                </div>
              </Link>
              <Link to="/calculator/salary" className="surface-card surface-card-hover p-5 flex items-start gap-3">
                <Calculator className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Зарплата на руки</h3>
                  <p className="text-xs text-slate-500">Узнай точную сумму после всех вычетов</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="max-w-xl mx-auto text-center">
            <div className="surface-card p-8 bg-gradient-to-br from-blue-500/5 to-violet-500/5 border border-blue-500/10">
              <CheckCircle2 className="w-8 h-8 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-200 mb-2">Поделись с друзьями</h3>
              <p className="text-sm text-slate-400 mb-4">Пусть они тоже узнают, куда уходят деньги</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    const text = `Я зарабатываю ${fmt(salary)} ₽ и теряю ${fmt(calc.yearTotalLoss)} ₽ в год на налогах и инфляции. А ты? → ${SITE_URL}/how-much-you-lose`;
                    navigator.share?.({ title: 'Сколько ты теряешь', text, url: `${SITE_URL}/how-much-you-lose` })
                      .catch(() => { navigator.clipboard.writeText(text); });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-sm"
                >
                  Поделиться
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
