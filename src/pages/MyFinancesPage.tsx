import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { SEO } from '@/components/SEO';
import { Wallet, Plus, Trash2, TrendingDown, PiggyBank, Calculator, ArrowRight, AlertCircle, Flame, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EarningsCounter } from '@/components/EarningsCounter';
import { FinancialHealthScore } from '@/components/FinancialHealthScore';

interface SavedLoan {
  id: string;
  name: string;
  monthlyPayment: number;
  remainingMonths: number;
  rate: number;
  createdAt: string;
}

interface SavedGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: string;
}

const LOANS_KEY = 'my_finances_loans';
const GOALS_KEY = 'my_finances_goals';

function loadLoans(): SavedLoan[] {
  try {
    const raw = localStorage.getItem(LOANS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function loadGoals(): SavedGoal[] {
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function formatRub(value: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);
}

const MyFinancesPage = () => {
  const [loans, setLoans] = useState<SavedLoan[]>(loadLoans);
  const [goals, setGoals] = useState<SavedGoal[]>(loadGoals);
  const [showAddLoan, setShowAddLoan] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

  // Форма нового кредита
  const [newLoanName, setNewLoanName] = useState('');
  const [newLoanPayment, setNewLoanPayment] = useState('');
  const [newLoanMonths, setNewLoanMonths] = useState('');
  const [newLoanRate, setNewLoanRate] = useState('');

  // Форма новой цели
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalCurrent, setNewGoalCurrent] = useState('');

  useEffect(() => {
    localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  }, [goals]);

  const totalMonthlyPayments = loans.reduce((sum, l) => sum + l.monthlyPayment, 0);
  const totalDebt = loans.reduce((sum, l) => sum + l.monthlyPayment * l.remainingMonths, 0);

  // Сколько уже отдано банку (приблизительно: платёж × прошедшие месяцы)
  const totalPaidToBank = useMemo(() => {
    return loans.reduce((sum, loan) => {
      const createdDate = new Date(loan.createdAt);
      const now = new Date();
      const monthsPassed = Math.max(0,
        (now.getFullYear() - createdDate.getFullYear()) * 12 +
        (now.getMonth() - createdDate.getMonth())
      );
      return sum + loan.monthlyPayment * monthsPassed;
    }, 0);
  }, [loans]);

  // Проверка: есть ли кредиты с высокой ставкой (выше ключевой + 2%)
  const KEY_RATE = 15; // Текущая ключевая ставка ЦБ
  const loansToRefinance = useMemo(() => {
    return loans.filter(l => l.rate > KEY_RATE + 2 && l.remainingMonths > 12);
  }, [loans]);

  // Потенциальная экономия при рефинансировании
  const potentialSavings = useMemo(() => {
    return loansToRefinance.reduce((sum, loan) => {
      const currentTotal = loan.monthlyPayment * loan.remainingMonths;
      // Грубая оценка: снижение ставки на (rate - keyRate - 1)% экономит ~пропорционально
      const rateDiff = loan.rate - KEY_RATE - 1;
      const savingsPercent = rateDiff / loan.rate;
      return sum + currentTotal * savingsPercent * 0.5; // консервативная оценка
    }, 0);
  }, [loansToRefinance]);

  const addLoan = useCallback(() => {
    if (!newLoanName || !newLoanPayment) return;
    const loan: SavedLoan = {
      id: Date.now().toString(),
      name: newLoanName,
      monthlyPayment: Number(newLoanPayment),
      remainingMonths: Number(newLoanMonths) || 0,
      rate: Number(newLoanRate) || 0,
      createdAt: new Date().toISOString(),
    };
    setLoans(prev => [...prev, loan]);
    setNewLoanName('');
    setNewLoanPayment('');
    setNewLoanMonths('');
    setNewLoanRate('');
    setShowAddLoan(false);
  }, [newLoanName, newLoanPayment, newLoanMonths, newLoanRate]);

  const removeLoan = (id: string) => {
    setLoans(prev => prev.filter(l => l.id !== id));
  };

  const addGoal = useCallback(() => {
    if (!newGoalName || !newGoalTarget) return;
    const goal: SavedGoal = {
      id: Date.now().toString(),
      name: newGoalName,
      targetAmount: Number(newGoalTarget),
      currentAmount: Number(newGoalCurrent) || 0,
      createdAt: new Date().toISOString(),
    };
    setGoals(prev => [...prev, goal]);
    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalCurrent('');
    setShowAddGoal(false);
  }, [newGoalName, newGoalTarget, newGoalCurrent]);

  const removeGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const updateGoalProgress = (id: string, amount: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, currentAmount: amount } : g));
  };

  return (
    <>
      <SEO
        title="Мои финансы — персональный дашборд | Считай.RU"
        description="Отслеживайте свои кредиты, цели накоплений и ежемесячные платежи. Без регистрации, данные хранятся на вашем устройстве."
        noindex
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main id="main-content" className="flex-1 py-8 md:py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Заголовок */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-foreground">Мои финансы</h1>
                <p className="text-sm text-muted-foreground">Данные хранятся только на вашем устройстве</p>
              </div>
            </div>

            {/* Счётчик заработка */}
            <div className="mb-6">
              <EarningsCounter />
            </div>

            {/* Финансовый скор */}
            <div className="mb-6">
              <FinancialHealthScore />
            </div>

            {/* Сводка */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-bold text-muted-foreground uppercase">Плачу в месяц</span>
                </div>
                <p className="text-2xl font-black text-foreground">{formatRub(totalMonthlyPayments)}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-muted-foreground uppercase">Общий долг</span>
                </div>
                <p className="text-2xl font-black text-foreground">{formatRub(totalDebt)}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <PiggyBank className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-bold text-muted-foreground uppercase">Целей</span>
                </div>
                <p className="text-2xl font-black text-foreground">{goals.length}</p>
              </div>
            </div>

            {/* Сколько отдано банку */}
            {totalPaidToBank > 0 && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Отдано банкам за всё время</p>
                      <p className="text-2xl font-black text-red-400">{formatRub(totalPaidToBank)}</p>
                    </div>
                  </div>
                  <Link to="/calculator/overpayment" className="text-xs text-red-400 hover:text-red-300 font-medium">
                    Посчитать переплату →
                  </Link>
                </div>
              </div>
            )}

            {/* Уведомление о рефинансировании */}
            {loansToRefinance.length > 0 && (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.04] p-5 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <RefreshCw className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-green-400 mb-1">💡 Можно сэкономить на рефинансировании</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {loansToRefinance.length === 1 ? 'У вас есть кредит' : `У вас ${loansToRefinance.length} кредита`} со ставкой выше {KEY_RATE + 2}%.
                      Ключевая ставка ЦБ сейчас {KEY_RATE}% — банки предлагают рефинансирование от {KEY_RATE + 1}%.
                      {potentialSavings > 10000 && (
                        <span className="block mt-1 font-semibold text-green-400">
                          Потенциальная экономия: ~{formatRub(potentialSavings)}
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {loansToRefinance.map(loan => (
                        <span key={loan.id} className="text-[11px] px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 font-medium">
                          {loan.name}: {loan.rate}%
                        </span>
                      ))}
                    </div>
                    <Link
                      to="/calculator/refinancing"
                      className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-green-400 hover:text-green-300 transition-colors"
                    >
                      Рассчитать выгоду
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Если нет уведомлений — просто отступ */}
            {loansToRefinance.length === 0 && totalPaidToBank === 0 && <div className="mb-4" />}

            {/* Кредиты */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Мои кредиты и платежи</h2>
                <Button size="sm" variant="outline" onClick={() => setShowAddLoan(true)} className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Добавить
                </Button>
              </div>

              {showAddLoan && (
                <div className="rounded-xl border border-border bg-card p-4 mb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Название (Ипотека, Авто...)"
                      value={newLoanName}
                      onChange={e => setNewLoanName(e.target.value)}
                      className="col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Платёж/мес, ₽"
                      value={newLoanPayment}
                      onChange={e => setNewLoanPayment(e.target.value)}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Осталось месяцев"
                      value={newLoanMonths}
                      onChange={e => setNewLoanMonths(e.target.value)}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Ставка, %"
                      value={newLoanRate}
                      onChange={e => setNewLoanRate(e.target.value)}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 outline-none"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addLoan} className="flex-1">Сохранить</Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowAddLoan(false)}>Отмена</Button>
                    </div>
                  </div>
                </div>
              )}

              {loans.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <Calculator className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">Добавьте свои кредиты, чтобы видеть общую картину</p>
                  <Link to="/calculator/mortgage" className="text-sm text-primary hover:underline">
                    Рассчитать ипотеку →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {loans.map(loan => (
                    <div key={loan.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 group">
                      <div>
                        <p className="font-semibold text-foreground">{loan.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {loan.rate > 0 && `${loan.rate}% · `}
                          {loan.remainingMonths > 0 && `${loan.remainingMonths} мес. осталось`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-bold text-foreground">{formatRub(loan.monthlyPayment)}<span className="text-xs text-muted-foreground">/мес</span></p>
                        <button
                          onClick={() => removeLoan(loan.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                          aria-label="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Цели */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Цели накоплений</h2>
                <Button size="sm" variant="outline" onClick={() => setShowAddGoal(true)} className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Добавить
                </Button>
              </div>

              {showAddGoal && (
                <div className="rounded-xl border border-border bg-card p-4 mb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Цель (Отпуск, Машина...)"
                      value={newGoalName}
                      onChange={e => setNewGoalName(e.target.value)}
                      className="col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Нужно, ₽"
                      value={newGoalTarget}
                      onChange={e => setNewGoalTarget(e.target.value)}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Уже есть, ₽"
                      value={newGoalCurrent}
                      onChange={e => setNewGoalCurrent(e.target.value)}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 outline-none"
                    />
                    <div className="col-span-2 flex gap-2">
                      <Button size="sm" onClick={addGoal} className="flex-1">Сохранить</Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowAddGoal(false)}>Отмена</Button>
                    </div>
                  </div>
                </div>
              )}

              {goals.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <PiggyBank className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Поставьте финансовую цель и отслеживайте прогресс</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {goals.map(goal => {
                    const progress = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
                    return (
                      <div key={goal.id} className="rounded-xl border border-border bg-card p-4 group">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-foreground">{goal.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
                            <button
                              onClick={() => removeGoal(goal.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                              aria-label="Удалить цель"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted mb-2">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatRub(goal.currentAmount)} из {formatRub(goal.targetAmount)}</span>
                          <input
                            type="number"
                            value={goal.currentAmount}
                            onChange={e => updateGoalProgress(goal.id, Number(e.target.value))}
                            className="w-28 rounded border border-border bg-background px-2 py-1 text-xs text-foreground text-right focus:ring-1 focus:ring-primary/30 outline-none"
                            aria-label="Текущая сумма"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Полезные ссылки */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Полезные калькуляторы</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link to="/calculator/refinancing" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Рефинансирование</p>
                    <p className="text-xs text-muted-foreground">Снизить ставку по кредиту</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
                <Link to="/calculator/overpayment" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Calculator className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Переплата по ипотеке</p>
                    <p className="text-xs text-muted-foreground">Сколько отдадите банку</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
                <Link to="/calculator/deposit" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <PiggyBank className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Калькулятор вкладов</p>
                    <p className="text-xs text-muted-foreground">Сколько заработаете на депозите</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
                <Link to="/how-much-you-lose" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Сколько вы теряете</p>
                    <p className="text-xs text-muted-foreground">Инфляция съедает сбережения</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default MyFinancesPage;
