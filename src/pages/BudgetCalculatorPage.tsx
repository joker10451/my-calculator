import { useState, useMemo } from 'react';
import { SEO } from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RangeSlider } from '@/components/ui/range-slider';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { ShareResult } from '@/components/ShareResult';
import { Wallet, ShoppingBag, PiggyBank, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

function formatRub(value: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);
}

export default function BudgetCalculatorPage() {
  const [income, setIncome] = useState(80_000);
  const [needsPercent, setNeedsPercent] = useState(50);
  const [wantsPercent, setWantsPercent] = useState(30);

  const savingsPercent = 100 - needsPercent - wantsPercent;

  const budget = useMemo(() => ({
    needs: Math.round(income * needsPercent / 100),
    wants: Math.round(income * wantsPercent / 100),
    savings: Math.round(income * savingsPercent / 100),
    yearSavings: Math.round(income * savingsPercent / 100 * 12),
    fiveYearSavings: Math.round(income * savingsPercent / 100 * 12 * 5 * 1.15), // с учётом 15% годовых
  }), [income, needsPercent, wantsPercent, savingsPercent]);

  const categories = [
    { name: 'Необходимое', percent: needsPercent, amount: budget.needs, icon: ShoppingBag, color: 'bg-blue-500', textColor: 'text-blue-400', examples: 'Жильё, еда, транспорт, ЖКХ, связь' },
    { name: 'Желания', percent: wantsPercent, amount: budget.wants, icon: Sparkles, color: 'bg-amber-500', textColor: 'text-amber-400', examples: 'Развлечения, рестораны, подписки, одежда' },
    { name: 'Сбережения', percent: savingsPercent, amount: budget.savings, icon: PiggyBank, color: 'bg-green-500', textColor: 'text-green-400', examples: 'Вклады, инвестиции, подушка безопасности' },
  ];

  return (
    <>
      <SEO
        title="Калькулятор бюджета 50/30/20 — распределение доходов | Считай.RU"
        description="Распределите доход по правилу 50/30/20: необходимое, желания, сбережения. Узнайте сколько откладывать и сколько накопите за 5 лет."
        keywords="бюджет 50 30 20, калькулятор бюджета, распределение доходов, сколько откладывать"
        canonical="https://schitay-online.ru/calculator/budget"
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
              <span className="text-foreground">Бюджет 50/30/20</span>
            </nav>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-foreground">Бюджет 50/30/20</h1>
                <p className="text-sm text-muted-foreground">Простое правило распределения доходов</p>
              </div>
            </div>

            {/* Ввод дохода */}
            <div className="rounded-2xl border border-border bg-card p-5 mb-6">
              <RangeSlider
                label="Доход на руки (после налогов)"
                value={income}
                min={15000}
                max={500000}
                step={5000}
                onChange={setIncome}
                formatValue={formatRub}
              />
            </div>

            {/* Настройка пропорций */}
            <div className="rounded-2xl border border-border bg-card p-5 mb-6 space-y-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Настройте пропорции</p>
              <RangeSlider
                label="Необходимое"
                value={needsPercent}
                min={30}
                max={70}
                step={5}
                onChange={v => { setNeedsPercent(v); if (v + wantsPercent > 95) setWantsPercent(95 - v); }}
                formatValue={v => `${v}%`}
              />
              <RangeSlider
                label="Желания"
                value={wantsPercent}
                min={10}
                max={Math.min(50, 95 - needsPercent)}
                step={5}
                onChange={setWantsPercent}
                formatValue={v => `${v}%`}
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Сбережения (автоматически)</span>
                <span className={`font-bold ${savingsPercent >= 20 ? 'text-green-400' : savingsPercent >= 10 ? 'text-amber-400' : 'text-red-400'}`}>{savingsPercent}%</span>
              </div>
            </div>

            {/* Визуализация */}
            <div className="h-6 rounded-full overflow-hidden flex mb-8 shadow-inner">
              {categories.map(cat => (
                <div
                  key={cat.name}
                  className={`${cat.color} transition-all duration-500 flex items-center justify-center`}
                  style={{ width: `${cat.percent}%` }}
                >
                  {cat.percent >= 15 && <span className="text-[10px] font-bold text-white">{cat.percent}%</span>}
                </div>
              ))}
            </div>

            {/* Карточки */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {categories.map(cat => (
                <div key={cat.name} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <cat.icon className={`w-5 h-5 ${cat.textColor}`} />
                    <span className="text-sm font-bold text-foreground">{cat.name}</span>
                    <span className={`ml-auto text-xs font-bold ${cat.textColor}`}>{cat.percent}%</span>
                  </div>
                  <p className="text-2xl font-black text-foreground mb-1">
                    <AnimatedCounter value={cat.amount} duration={400} formatFn={formatRub} />
                  </p>
                  <p className="text-[11px] text-muted-foreground">{cat.examples}</p>
                </div>
              ))}
            </div>

            {/* Прогноз накоплений */}
            <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.04] p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <PiggyBank className="w-5 h-5 text-green-400" />
                <span className="text-sm font-bold text-green-400">Прогноз накоплений</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">За год</p>
                  <p className="text-xl font-black text-foreground">{formatRub(budget.yearSavings)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">За 5 лет (с инвестированием под 15%)</p>
                  <p className="text-xl font-black text-green-400">{formatRub(budget.fiveYearSavings)}</p>
                </div>
              </div>
              <Link to="/calculator/compound-interest" className="inline-block mt-3 text-xs text-green-400 hover:text-green-300 font-medium">
                Рассчитать точнее в калькуляторе сложного процента →
              </Link>
            </div>

            {/* Шеринг */}
            <div className="rounded-xl border border-border bg-card p-4 mb-6">
              <ShareResult
                title={`Мой бюджет: ${needsPercent}/${wantsPercent}/${savingsPercent}`}
                text={`Доход ${formatRub(income)}. Откладываю ${formatRub(budget.savings)}/мес. За 5 лет накоплю ${formatRub(budget.fiveYearSavings)}`}
              />
            </div>

            {/* Ссылки */}
            <div className="flex flex-wrap gap-3">
              <Link to="/calculator/salary" className="text-sm px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors">Калькулятор зарплаты →</Link>
              <Link to="/calculator/compound-interest" className="text-sm px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors">Сложный процент →</Link>
              <Link to="/my-finances" className="text-sm px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors">Мои финансы →</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
