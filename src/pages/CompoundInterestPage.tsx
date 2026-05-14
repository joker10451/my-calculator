import { useState, useMemo } from 'react';
import { SEO } from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { RangeSlider } from '@/components/ui/range-slider';
import { ResultVsMarket } from '@/components/ResultVsMarket';
import { RateAlertSignup } from '@/components/RateAlertSignup';
import { ShareResult } from '@/components/ShareResult';
import { TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

function formatRub(value: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);
}

function calcCompoundInterest(principal: number, monthlyAdd: number, rate: number, years: number) {
  const monthlyRate = rate / 100 / 12;
  const months = years * 12;
  let total = principal;
  let totalDeposited = principal;

  for (let i = 0; i < months; i++) {
    total = total * (1 + monthlyRate) + monthlyAdd;
    totalDeposited += monthlyAdd;
  }

  return {
    total: Math.round(total),
    deposited: Math.round(totalDeposited),
    earned: Math.round(total - totalDeposited),
  };
}

export default function CompoundInterestPage() {
  const [principal, setPrincipal] = useState(100000);
  const [monthlyAdd, setMonthlyAdd] = useState(10000);
  const [rate, setRate] = useState(17);
  const [years, setYears] = useState(10);

  const result = useMemo(
    () => calcCompoundInterest(principal, monthlyAdd, rate, years),
    [principal, monthlyAdd, rate, years]
  );

  const earnedPercent = result.deposited > 0 ? ((result.earned / result.deposited) * 100).toFixed(0) : '0';

  return (
    <>
      <SEO
        title="Калькулятор сложного процента 2026 — расчёт доходности | Считай.RU"
        description="Рассчитайте доходность инвестиций со сложным процентом. Узнайте сколько накопите за 5, 10, 20 лет с ежемесячными пополнениями."
        keywords="сложный процент калькулятор, калькулятор доходности, капитализация процентов, расчёт накоплений"
        canonical="https://schitay-online.ru/calculator/compound-interest"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main id="main-content" className="flex-1 pt-20">
          <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
            {/* Breadcrumb */}
            <nav className="text-sm text-muted-foreground mb-6" aria-label="Навигация">
              <Link to="/" className="hover:text-primary">Главная</Link>
              <span className="mx-2">/</span>
              <Link to="/category/finance" className="hover:text-primary">Финансы</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">Сложный процент</span>
            </nav>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-foreground">Калькулятор сложного процента</h1>
                <p className="text-sm text-muted-foreground">Узнайте силу капитализации процентов</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
              {/* Inputs */}
              <div className="lg:col-span-3 space-y-5">
                <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
                  <RangeSlider
                    label="Начальная сумма"
                    value={principal}
                    min={0}
                    max={5000000}
                    step={10000}
                    onChange={setPrincipal}
                    formatValue={formatRub}
                  />
                  <RangeSlider
                    label="Ежемесячное пополнение"
                    value={monthlyAdd}
                    min={0}
                    max={200000}
                    step={1000}
                    onChange={setMonthlyAdd}
                    formatValue={formatRub}
                  />
                  <RangeSlider
                    label="Годовая ставка"
                    value={rate}
                    min={1}
                    max={30}
                    step={0.5}
                    onChange={setRate}
                    formatValue={v => `${v}%`}
                  />
                  <RangeSlider
                    label="Срок"
                    value={years}
                    min={1}
                    max={30}
                    step={1}
                    onChange={setYears}
                    formatValue={v => `${v} лет`}
                  />
                </div>
              </div>

              {/* Results */}
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Итого через {years} лет</p>
                  <p className="text-3xl font-black text-primary mb-4">
                    <AnimatedCounter value={result.total} duration={500} formatFn={formatRub} />
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Вложено</span>
                      <span className="text-sm font-bold text-foreground">{formatRub(result.deposited)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Заработано на процентах</span>
                      <span className="text-sm font-bold text-green-400">{formatRub(result.earned)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">Доходность</span>
                      <span className="text-sm font-bold text-green-400">+{earnedPercent}%</span>
                    </div>
                  </div>
                </div>

                {/* Визуализация */}
                <div className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Структура</p>
                  <div className="h-4 rounded-full overflow-hidden flex">
                    <div
                      className="bg-primary/60 transition-all duration-500"
                      style={{ width: `${(result.deposited / result.total) * 100}%` }}
                    />
                    <div
                      className="bg-green-400 transition-all duration-500"
                      style={{ width: `${(result.earned / result.total) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[11px]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary/60" />Вложения</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" />Проценты</span>
                  </div>
                </div>

                {/* Сравнение с рынком */}
                <ResultVsMarket
                  userValue={rate}
                  marketAverage={15}
                  label="Ваша ставка vs средняя по вкладам"
                  unit="%"
                  lowerIsBetter={false}
                  formatValue={v => `${v}%`}
                />

                {/* Шеринг */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Поделиться результатом</p>
                  <ShareResult
                    title={`Сложный процент: ${formatRub(result.total)} за ${years} лет`}
                    text={`Вложил ${formatRub(result.deposited)}, заработал ${formatRub(result.earned)} на процентах (${earnedPercent}%)`}
                  />
                </div>

                {/* Email-захват */}
                <RateAlertSignup calculatorType="deposit" />
              </div>
            </div>

            {/* FAQ */}
            <div className="mt-12 rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Что такое сложный процент?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Сложный процент — это начисление процентов не только на начальную сумму, но и на ранее начисленные проценты.
                Это создаёт эффект "снежного кома": чем дольше вы инвестируете, тем быстрее растёт капитал.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Например, при ставке 17% годовых и ежемесячном пополнении 10 000 ₽ за 10 лет вы вложите 1 300 000 ₽,
                а получите более 3 000 000 ₽. Разница — это сила сложного процента.
              </p>
            </div>

            {/* Ссылки */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/calculator/deposit" className="text-sm px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors">
                Калькулятор вкладов →
              </Link>
              <Link to="/calculator/investment" className="text-sm px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors">
                Доходность инвестиций →
              </Link>
              <Link to="/how-much-you-lose" className="text-sm px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors">
                Сколько вы теряете на инфляции →
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
