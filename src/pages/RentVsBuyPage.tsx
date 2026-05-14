import { useState, useMemo } from 'react';
import { SEO } from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RangeSlider } from '@/components/ui/range-slider';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { ResultVsMarket } from '@/components/ResultVsMarket';
import { ShareResult } from '@/components/ShareResult';
import { RateAlertSignup } from '@/components/RateAlertSignup';
import { Home, Key } from 'lucide-react';
import { Link } from 'react-router-dom';

function formatRub(value: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);
}

export default function RentVsBuyPage() {
  const [propertyPrice, setPropertyPrice] = useState(6_000_000);
  const [downPayment, setDownPayment] = useState(1_200_000);
  const [mortgageRate, setMortgageRate] = useState(15);
  const [mortgageTerm, setMortgageTerm] = useState(20);
  const [monthlyRent, setMonthlyRent] = useState(35_000);
  const [rentGrowth, setRentGrowth] = useState(7); // % в год
  const [propertyGrowth, setPropertyGrowth] = useState(5); // % в год

  const result = useMemo(() => {
    const loan = propertyPrice - downPayment;
    const monthlyRate = mortgageRate / 100 / 12;
    const months = mortgageTerm * 12;

    // Ипотечный платёж
    const mortgagePayment = monthlyRate > 0
      ? (loan * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
      : loan / months;

    // Общие расходы на покупку за весь срок
    const totalMortgagePaid = mortgagePayment * months + downPayment;

    // Стоимость квартиры через N лет
    const futurePropertyValue = propertyPrice * Math.pow(1 + propertyGrowth / 100, mortgageTerm);

    // Чистые расходы на покупку (платежи - стоимость квартиры)
    const netBuyCost = totalMortgagePaid - futurePropertyValue;

    // Общие расходы на аренду за тот же срок (с ростом)
    let totalRentPaid = 0;
    let currentRent = monthlyRent;
    for (let year = 0; year < mortgageTerm; year++) {
      totalRentPaid += currentRent * 12;
      currentRent *= (1 + rentGrowth / 100);
    }

    // Если бы вложили первоначальный взнос под депозит
    const investmentReturn = downPayment * Math.pow(1 + 0.15, mortgageTerm); // 15% годовых
    const netRentCost = totalRentPaid - investmentReturn + downPayment;

    const buyWins = netBuyCost < netRentCost;
    const savings = Math.abs(netBuyCost - netRentCost);

    return {
      mortgagePayment: Math.round(mortgagePayment),
      totalMortgagePaid: Math.round(totalMortgagePaid),
      futurePropertyValue: Math.round(futurePropertyValue),
      netBuyCost: Math.round(netBuyCost),
      totalRentPaid: Math.round(totalRentPaid),
      netRentCost: Math.round(netRentCost),
      buyWins,
      savings: Math.round(savings),
      lastYearRent: Math.round(currentRent),
    };
  }, [propertyPrice, downPayment, mortgageRate, mortgageTerm, monthlyRent, rentGrowth, propertyGrowth]);

  return (
    <>
      <SEO
        title="Аренда или покупка квартиры 2026 — что выгоднее? | Считай.RU"
        description="Сравните расходы на аренду и покупку квартиры в ипотеку. Учитываем рост цен, ставки, инвестиции. Калькулятор с визуализацией."
        keywords="аренда или покупка, ипотека или аренда, что выгоднее снимать или купить, калькулятор аренда покупка"
        canonical="https://schitay-online.ru/calculator/rent-vs-buy"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main id="main-content" className="flex-1 pt-20">
          <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
            <nav className="text-sm text-muted-foreground mb-6" aria-label="Навигация">
              <Link to="/" className="hover:text-primary">Главная</Link>
              <span className="mx-2">/</span>
              <Link to="/category/finance" className="hover:text-primary">Финансы</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">Аренда vs Покупка</span>
            </nav>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-foreground">Аренда или покупка?</h1>
                <p className="text-sm text-muted-foreground">Что выгоднее на горизонте {mortgageTerm} лет</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
              {/* Inputs */}
              <div className="lg:col-span-3 space-y-5">
                {/* Покупка */}
                <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-bold text-foreground">Покупка в ипотеку</span>
                  </div>
                  <RangeSlider label="Стоимость квартиры" value={propertyPrice} min={1_000_000} max={30_000_000} step={100_000} onChange={setPropertyPrice} formatValue={formatRub} />
                  <RangeSlider label="Первоначальный взнос" value={downPayment} min={0} max={propertyPrice * 0.8} step={100_000} onChange={setDownPayment} formatValue={formatRub} />
                  <RangeSlider label="Ставка ипотеки" value={mortgageRate} min={5} max={25} step={0.5} onChange={setMortgageRate} formatValue={v => `${v}%`} />
                  <RangeSlider label="Срок ипотеки" value={mortgageTerm} min={5} max={30} step={1} onChange={setMortgageTerm} formatValue={v => `${v} лет`} />
                  <RangeSlider label="Рост цен на жильё" value={propertyGrowth} min={0} max={15} step={0.5} onChange={setPropertyGrowth} formatValue={v => `${v}%/год`} />
                </div>

                {/* Аренда */}
                <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-foreground">Аренда</span>
                  </div>
                  <RangeSlider label="Аренда в месяц" value={monthlyRent} min={10_000} max={150_000} step={1_000} onChange={setMonthlyRent} formatValue={formatRub} />
                  <RangeSlider label="Рост аренды" value={rentGrowth} min={0} max={15} step={0.5} onChange={setRentGrowth} formatValue={v => `${v}%/год`} />
                </div>
              </div>

              {/* Results */}
              <div className="lg:col-span-2 space-y-4">
                {/* Вердикт */}
                <div className={`rounded-2xl border p-5 ${result.buyWins ? 'border-blue-500/20 bg-blue-500/[0.04]' : 'border-amber-500/20 bg-amber-500/[0.04]'}`}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2 ${result.buyWins ? 'text-blue-400' : 'text-amber-400'}">
                    {result.buyWins ? '🏠 Покупка выгоднее' : '🔑 Аренда выгоднее'}
                  </p>
                  <p className="text-2xl font-black text-foreground mb-1">
                    Экономия: <AnimatedCounter value={result.savings} duration={500} formatFn={formatRub} />
                  </p>
                  <p className="text-xs text-muted-foreground">за {mortgageTerm} лет</p>
                </div>

                {/* Детали покупки */}
                <div className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Покупка</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Платёж/мес</span><span className="font-bold">{formatRub(result.mortgagePayment)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Всего заплатите</span><span className="font-bold">{formatRub(result.totalMortgagePaid)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Квартира через {mortgageTerm} лет</span><span className="font-bold text-green-400">{formatRub(result.futurePropertyValue)}</span></div>
                    <div className="flex justify-between border-t border-border pt-2"><span className="text-muted-foreground">Чистые расходы</span><span className="font-bold">{formatRub(result.netBuyCost)}</span></div>
                  </div>
                </div>

                {/* Детали аренды */}
                <div className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Аренда</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Сейчас/мес</span><span className="font-bold">{formatRub(monthlyRent)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Через {mortgageTerm} лет/мес</span><span className="font-bold text-red-400">{formatRub(result.lastYearRent)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Всего за аренду</span><span className="font-bold">{formatRub(result.totalRentPaid)}</span></div>
                    <div className="flex justify-between border-t border-border pt-2"><span className="text-muted-foreground">Чистые расходы*</span><span className="font-bold">{formatRub(result.netRentCost)}</span></div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">*С учётом инвестирования первоначального взноса под 15% годовых</p>
                </div>

                {/* Сравнение платежей */}
                <ResultVsMarket
                  userValue={result.mortgagePayment}
                  marketAverage={monthlyRent}
                  label="Ипотечный платёж vs аренда"
                  lowerIsBetter={true}
                  formatValue={formatRub}
                />

                {/* Шеринг */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs font-bold text-muted-foreground mb-3">Поделиться</p>
                  <ShareResult
                    title={result.buyWins ? 'Покупка выгоднее аренды!' : 'Аренда выгоднее покупки!'}
                    text={`Экономия ${formatRub(result.savings)} за ${mortgageTerm} лет. Проверь свой вариант:`}
                  />
                </div>

                <RateAlertSignup calculatorType="mortgage" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
