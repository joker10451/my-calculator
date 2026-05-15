import { useState, useMemo } from 'react';
import { SEO } from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RangeSlider } from '@/components/ui/range-slider';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { ShareResult } from '@/components/ShareResult';
import { Plus, Trash2, Snowflake, Flame, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

function formatRub(v: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(v);
}

interface Debt {
  id: string;
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
}

function calcPayoff(debts: Debt[], extraPayment: number, strategy: 'snowball' | 'avalanche') {
  if (debts.length === 0) return { months: 0, totalPaid: 0, totalInterest: 0 };

  const sorted = [...debts].sort((a, b) =>
    strategy === 'avalanche' ? b.rate - a.rate : a.balance - b.balance
  );

  let remaining = sorted.map(d => ({ ...d, balance: d.balance }));
  let months = 0;
  let totalPaid = 0;
  const maxMonths = 600; // 50 лет макс

  while (remaining.length > 0 && months < maxMonths) {
    months++;
    const extra = extraPayment;

    for (const debt of remaining) {
      const interest = debt.balance * (debt.rate / 100 / 12);
      debt.balance += interest;
    }

    // Платим минимум по всем
    for (const debt of remaining) {
      const payment = Math.min(debt.minPayment, debt.balance);
      debt.balance -= payment;
      totalPaid += payment;
    }

    // Доп. платёж на первый долг в приоритете
    if (remaining.length > 0 && extra > 0) {
      const target = remaining[0];
      const payment = Math.min(extra, target!.balance);
      target!.balance -= payment;
      totalPaid += payment;
    }

    remaining = remaining.filter(d => d.balance > 1);
  }

  const totalBorrowed = debts.reduce((s, d) => s + d.balance, 0);
  return { months, totalPaid: Math.round(totalPaid), totalInterest: Math.round(totalPaid - totalBorrowed) };
}

export default function DebtPayoffPage() {
  const [debts, setDebts] = useState<Debt[]>([
    { id: '1', name: 'Кредитная карта', balance: 150_000, rate: 24, minPayment: 5_000 },
    { id: '2', name: 'Потребительский кредит', balance: 500_000, rate: 18, minPayment: 15_000 },
  ]);
  const [extraPayment, setExtraPayment] = useState(10_000);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [newRate, setNewRate] = useState('');
  const [newMin, setNewMin] = useState('');

  const snowball = useMemo(() => calcPayoff(debts, extraPayment, 'snowball'), [debts, extraPayment]);
  const avalanche = useMemo(() => calcPayoff(debts, extraPayment, 'avalanche'), [debts, extraPayment]);

  const winner = avalanche.totalPaid <= snowball.totalPaid ? 'avalanche' : 'snowball';
  const savings = Math.abs(avalanche.totalPaid - snowball.totalPaid);

  const addDebt = () => {
    if (!newName || !newBalance) return;
    setDebts(prev => [...prev, {
      id: Date.now().toString(),
      name: newName,
      balance: Number(newBalance),
      rate: Number(newRate) || 18,
      minPayment: Number(newMin) || 5000,
    }]);
    setNewName(''); setNewBalance(''); setNewRate(''); setNewMin('');
    setShowAdd(false);
  };

  return (
    <>
      <SEO
        title="Калькулятор погашения долгов — снежный ком vs лавина | Считай.RU"
        description="Сравните две стратегии погашения долгов: метод снежного кома и метод лавины. Узнайте какая сэкономит больше."
        keywords="погашение долгов, снежный ком, лавина, стратегия погашения кредитов, как быстрее закрыть кредит"
        canonical="https://schitay-online.ru/calculator/debt-payoff"
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
              <span className="text-foreground">Погашение долгов</span>
            </nav>

            <h1 className="text-2xl md:text-4xl font-black text-foreground mb-2">
              Снежный ком vs Лавина
            </h1>
            <p className="text-muted-foreground mb-8">Какая стратегия погашения долгов сэкономит больше?</p>

            <div className="grid lg:grid-cols-5 gap-6">
              {/* Долги */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-foreground">Ваши долги</h2>
                  <Button size="sm" variant="outline" onClick={() => setShowAdd(true)} className="gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Добавить
                  </Button>
                </div>

                {showAdd && (
                  <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                    <input type="text" placeholder="Название" value={newName} onChange={e => setNewName(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30" />
                    <div className="grid grid-cols-3 gap-2">
                      <input type="number" placeholder="Остаток, ₽" value={newBalance} onChange={e => setNewBalance(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30" />
                      <input type="number" placeholder="Ставка, %" value={newRate} onChange={e => setNewRate(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30" />
                      <input type="number" placeholder="Мин. платёж" value={newMin} onChange={e => setNewMin(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addDebt}>Добавить</Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Отмена</Button>
                    </div>
                  </div>
                )}

                {debts.map(debt => (
                  <div key={debt.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between group">
                    <div>
                      <p className="font-semibold text-foreground">{debt.name}</p>
                      <p className="text-xs text-muted-foreground">{debt.rate}% · мин. {formatRub(debt.minPayment)}/мес</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-bold text-foreground">{formatRub(debt.balance)}</p>
                      <button onClick={() => setDebts(prev => prev.filter(d => d.id !== debt.id))} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all" aria-label="Удалить">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="rounded-xl border border-border bg-card p-5 mt-4">
                  <RangeSlider
                    label="Дополнительный платёж сверх минимума"
                    value={extraPayment}
                    min={0}
                    max={50000}
                    step={1000}
                    onChange={setExtraPayment}
                    formatValue={formatRub}
                  />
                </div>
              </div>

              {/* Результаты */}
              <div className="lg:col-span-2 space-y-4">
                {/* Лавина */}
                <div className={`rounded-2xl border p-5 ${winner === 'avalanche' ? 'border-green-500/30 bg-green-500/[0.04]' : 'border-border bg-card'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-5 h-5 text-red-400" />
                    <span className="text-sm font-bold text-foreground">Метод лавины</span>
                    {winner === 'avalanche' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-bold ml-auto">Выгоднее</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Сначала гасим самый дорогой долг (высокая ставка)</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Срок</span><span className="font-bold">{avalanche.months} мес ({(avalanche.months / 12).toFixed(1)} лет)</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Всего заплатите</span><span className="font-bold"><AnimatedCounter value={avalanche.totalPaid} duration={400} formatFn={formatRub} /></span></div>
                  </div>
                </div>

                {/* Снежный ком */}
                <div className={`rounded-2xl border p-5 ${winner === 'snowball' ? 'border-green-500/30 bg-green-500/[0.04]' : 'border-border bg-card'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Snowflake className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-bold text-foreground">Снежный ком</span>
                    {winner === 'snowball' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-bold ml-auto">Выгоднее</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Сначала гасим самый маленький долг (мотивация)</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Срок</span><span className="font-bold">{snowball.months} мес ({(snowball.months / 12).toFixed(1)} лет)</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Всего заплатите</span><span className="font-bold"><AnimatedCounter value={snowball.totalPaid} duration={400} formatFn={formatRub} /></span></div>
                  </div>
                </div>

                {/* Разница */}
                {savings > 0 && (
                  <div className="rounded-xl border border-border bg-card p-4 text-center">
                    <p className="text-xs text-muted-foreground">Разница между стратегиями</p>
                    <p className="text-xl font-black text-primary">{formatRub(savings)}</p>
                  </div>
                )}

                {/* Шеринг */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <ShareResult
                    title={`${winner === 'avalanche' ? 'Лавина' : 'Снежный ком'} выгоднее!`}
                    text={`Экономия ${formatRub(savings)}. Закрою долги за ${Math.min(avalanche.months, snowball.months)} мес.`}
                  />
                </div>

                <Link to="/calculator/refinancing" className="flex items-center gap-2 text-sm text-primary hover:underline font-medium">
                  Рассчитать рефинансирование <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* FAQ */}
            <div className="mt-12 rounded-2xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground">Как это работает?</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Метод лавины:</strong> Платите минимум по всем долгам, а всё лишнее направляете на долг с самой высокой ставкой. Математически оптимально — экономите больше на процентах.</p>
                <p><strong className="text-foreground">Снежный ком:</strong> Платите минимум по всем, а лишнее — на самый маленький долг. Быстрее закрываете первый долг → мотивация продолжать. Психологически проще.</p>
                <p><strong className="text-foreground">Что выбрать?</strong> Если дисциплина не проблема — лавина. Если нужна мотивация видеть прогресс — снежный ком.</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
