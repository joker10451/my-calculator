import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Copy,
  Share2,
  Check,
  TrendingUp,
  Percent,
  Calendar,
  Wallet,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { fmt } from '../../lib/tax';

const DEPOSIT_PRESETS = [100000, 300000, 500000, 1000000, 3000000];
const TERM_OPTIONS = [
  { months: 3, label: '3 мес.' },
  { months: 6, label: '6 мес.' },
  { months: 9, label: '9 мес.' },
  { months: 12, label: '1 год (12 мес.)' },
  { months: 18, label: '1.5 года (18 мес.)' },
  { months: 24, label: '2 года (24 мес.)' },
  { months: 36, label: '3 года (36 мес.)' },
];
const TOPUP_PRESETS = [0, 10000, 30000, 50000];

type CapitalizationType = 'monthly' | 'end';

interface ScheduleRow {
  month: number;
  startBalance: number;
  topUp: number;
  monthlyInterest: number;
  accruedInterest: number;
  endBalance: number;
}

interface DepositCalculationResult {
  initialDeposit: number;
  totalTopUps: number;
  totalInvested: number;
  totalInterest: number;
  annualizedInterest: number;
  effectiveRate: number;
  taxFreeThreshold: number;
  taxableIncomeAnnual: number;
  annualTax: number;
  totalTax: number;
  netProfit: number;
  finalBalance: number;
  netYieldRate: number;
  schedule: ScheduleRow[];
}

function useAnimatedValue(target: number, duration = 300): number {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef<number>(0);
  const startRef = useRef(target);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const from = startRef.current;
    const diff = target - from;
    if (Math.abs(diff) < 0.5) {
      setDisplay(target);
      startRef.current = target;
      return;
    }
    const t0 = performance.now();

    function tick(now: number) {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - (1 - p) ** 3;
      setDisplay(from + diff * eased);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        startRef.current = target;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}

function calculateDeposit(
  initialDeposit: number,
  rate: number,
  months: number,
  capitalization: CapitalizationType,
  monthlyTopUp: number,
  keyRate: number
): DepositCalculationResult {
  const annualRate = Math.max(0, rate) / 100;
  const monthlyRate = annualRate / 12;
  const isCompounded = capitalization === 'monthly';

  const schedule: ScheduleRow[] = [];
  let currentPrincipal = initialDeposit;
  let cumulativeInterest = 0;
  let totalTopUps = 0;

  for (let m = 1; m <= months; m++) {
    const startBalance = currentPrincipal;
    const interest = startBalance * monthlyRate;
    cumulativeInterest += interest;

    const topUp = monthlyTopUp;
    totalTopUps += topUp;

    if (isCompounded) {
      currentPrincipal = startBalance + interest + topUp;
    } else {
      currentPrincipal = startBalance + topUp;
    }

    schedule.push({
      month: m,
      startBalance,
      topUp,
      monthlyInterest: interest,
      accruedInterest: cumulativeInterest,
      endBalance: isCompounded ? currentPrincipal : currentPrincipal + cumulativeInterest,
    });
  }

  const totalInterest = cumulativeInterest;
  const totalInvested = initialDeposit + totalTopUps;

  // Effective annual interest rate with compounding
  const effectiveRate = isCompounded
    ? ((1 + annualRate / 12) ** 12 - 1) * 100
    : rate;

  // Tax calculation under ст. 214.2 НК РФ (2026 Key Rate limit)
  const taxFreeThreshold = 1000000 * (keyRate / 100);
  const annualizedInterest = months > 0 ? (totalInterest / months) * 12 : 0;
  const taxableIncomeAnnual = Math.max(0, annualizedInterest - taxFreeThreshold);

  // Progressive tax scale (13% up to 5M, 15% above 5M)
  let annualTax = 0;
  if (taxableIncomeAnnual > 0) {
    if (taxableIncomeAnnual <= 5000000) {
      annualTax = taxableIncomeAnnual * 0.13;
    } else {
      annualTax = 5000000 * 0.13 + (taxableIncomeAnnual - 5000000) * 0.15;
    }
  }

  const totalTax = Math.round(annualTax * (months / 12));
  const netProfit = Math.round(totalInterest - totalTax);
  const finalBalance = Math.round(totalInvested + netProfit);
  const netYieldRate = totalInvested > 0 && months > 0
    ? (netProfit / totalInvested) * (12 / months) * 100
    : 0;

  return {
    initialDeposit,
    totalTopUps,
    totalInvested,
    totalInterest: Math.round(totalInterest),
    annualizedInterest: Math.round(annualizedInterest),
    effectiveRate,
    taxFreeThreshold: Math.round(taxFreeThreshold),
    taxableIncomeAnnual: Math.round(taxableIncomeAnnual),
    annualTax: Math.round(annualTax),
    totalTax,
    netProfit,
    finalBalance,
    netYieldRate,
    schedule,
  };
}

function ShareCard({
  result,
  rate,
  months,
  capitalization,
  keyRate,
}: {
  result: DepositCalculationResult;
  rate: number;
  months: number;
  capitalization: CapitalizationType;
  keyRate: number;
}) {
  return (
    <div
      id="share-card-deposit"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 0,
        width: 1080,
        height: 1080,
        background: '#0F172A',
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.02) 39px, rgba(255,255,255,0.02) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.02) 39px, rgba(255,255,255,0.02) 40px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: 'Unbounded, Inter, Arial, sans-serif',
        color: '#fff',
        padding: '70px 60px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div style={{ fontSize: 16, color: '#64748B', letterSpacing: 6, marginBottom: 20 }}>
          СЧИТАЙ.RU — КАЛЬКУЛЯТОР ВКЛАДОВ 2026
        </div>
        <div style={{ fontSize: 24, color: '#94A3B8' }}>
          Вклад {fmt(result.initialDeposit)} ₽ на {months} мес. под {rate.toFixed(1)}%
        </div>
      </div>

      <div style={{ textAlign: 'center', width: '100%' }}>
        <div style={{ fontSize: 18, color: '#10B981', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
          Итоговая сумма к получению
        </div>
        <div style={{ fontSize: 84, fontWeight: 900, lineHeight: 1, color: '#FFFFFF', marginBottom: 20 }}>
          {fmt(result.finalBalance)} ₽
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 20,
            padding: 30,
            border: '1px solid rgba(255,255,255,0.08)',
            maxWidth: 900,
            margin: '0 auto',
            textAlign: 'left',
          }}
        >
          <div>
            <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 4 }}>Начисленные проценты:</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#38BDF8' }}>
              +{fmt(result.totalInterest)} ₽
            </div>
          </div>
          <div>
            <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 4 }}>Налог по вкладу (ст. 214.2):</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: result.totalTax > 0 ? '#F87171' : '#10B981' }}>
              {result.totalTax > 0 ? `-${fmt(result.totalTax)} ₽` : '0 ₽ (в лимите)'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 4 }}>Чистая прибыль:</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#10B981' }}>
              +{fmt(result.netProfit)} ₽
            </div>
          </div>
          <div>
            <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 4 }}>Эффективная ставка:</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#FBBF24' }}>
              {result.effectiveRate.toFixed(2)}% годовых
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', width: '100%' }}>
        <div style={{ fontSize: 14, color: '#64748B', marginBottom: 12 }}>
          Капитализация: {capitalization === 'monthly' ? 'Ежемесячно' : 'В конце срока'} · Ставка ЦБ 2026: {keyRate.toFixed(1)}% · Лимит: {fmt(result.taxFreeThreshold)} ₽
        </div>
        <div style={{ width: 400, height: 2, background: 'rgba(255,255,255,0.1)', margin: '0 auto 16px auto' }} />
        <div style={{ fontSize: 24, color: '#2563EB', fontWeight: 800 }}>schitay-online.ru</div>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>Бесплатный финансовый калькулятор онлайн</div>
      </div>
    </div>
  );
}

export function DepositCalculator() {
  const [initialDeposit, setInitialDeposit] = useState(300000);
  const [rate, setRate] = useState(20.0);
  const [months, setMonths] = useState(12);
  const [capitalization, setCapitalization] = useState<CapitalizationType>('monthly');
  const [monthlyTopUp, setMonthlyTopUp] = useState(0);
  const [keyRate, setKeyRate] = useState(21.0);
  const [showSchedule, setShowSchedule] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareInProgress, setShareInProgress] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();
  const shareCardRef = useRef<HTMLDivElement>(null);

  const result = useMemo(
    () => calculateDeposit(initialDeposit, rate, months, capitalization, monthlyTopUp, keyRate),
    [initialDeposit, rate, months, capitalization, monthlyTopUp, keyRate]
  );

  // Animated values
  const animatedFinalBalance = useAnimatedValue(result.finalBalance);
  const animatedTotalInterest = useAnimatedValue(result.totalInterest);
  const animatedTotalTax = useAnimatedValue(result.totalTax);
  const animatedNetProfit = useAnimatedValue(result.netProfit);

  const handleCopy = useCallback(async () => {
    const text = [
      `Расчёт доходности и налога по вкладу (2026):`,
      `Сумма вклада: ${fmt(initialDeposit)} ₽ на ${months} мес.`,
      `Ставка: ${rate.toFixed(1)}% (${capitalization === 'monthly' ? 'с ежемесячной капитализацией' : 'выплата в конце срока'}).`,
      `Эффективная ставка: ${result.effectiveRate.toFixed(2)}% годовых.`,
      monthlyTopUp > 0 ? `Ежемесячное пополнение: ${fmt(monthlyTopUp)} ₽/мес.` : '',
      `Начислено процентов: ${fmt(result.totalInterest)} ₽.`,
      `Необлагаемый лимит (ст. 214.2 НК РФ): ${fmt(result.taxFreeThreshold)} ₽.`,
      `Налог к уплате: ${result.totalTax > 0 ? `${fmt(result.totalTax)} ₽` : '0 ₽ (доход в пределах лимита)'}.`,
      `Чистая прибыль: ${fmt(result.netProfit)} ₽.`,
      `Итоговая сумма к получению: ${fmt(result.finalBalance)} ₽.`,
      'Рассчитано на schitay-online.ru',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }

    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  }, [initialDeposit, months, rate, capitalization, monthlyTopUp, result]);

  const handleShare = useCallback(async () => {
    setShareInProgress(true);
    try {
      const cardNode = document.getElementById('share-card-deposit');
      if (!cardNode) return;

      const dataUrl = await toPng(cardNode, { width: 1080, height: 1080 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'vklad-i-nalog-2026.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Расчёт доходности вклада' });
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'vklad-i-nalog-2026.png';
        a.click();
      }
    } catch {
      // silent
    } finally {
      setShareInProgress(false);
    }
  }, []);

  const scrollToBankWidget = useCallback(() => {
    const target = document.getElementById('pampadu-banki-widget') || document.getElementById('ppdwiBanki');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.href = '/banki/#ppdwiBanki';
    }
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const isTaxExempt = result.totalTax === 0;

  return (
    <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
      {/* ---------- INPUTS (2 COLS) ---------- */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 md:p-8 sticky top-24 space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <span className="w-8 h-8 rounded-lg bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 flex items-center justify-center font-bold text-sm">
              <Wallet className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-heading font-black text-base text-gray-900 dark:text-white">
                Параметры вклада
              </h3>
              <p className="text-xs text-gray-400">С учётом налога 2026 года</p>
            </div>
          </div>

          {/* 1. Initial Deposit Amount */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="deposit-amount-range" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Сумма вклада
              </label>
              <span className="text-lg font-black text-accent-600 dark:text-accent-400">
                {fmt(initialDeposit)} ₽
              </span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <input
                id="deposit-amount-range"
                type="range"
                min={10000}
                max={10000000}
                step={10000}
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-accent-600"
                aria-label="Сумма вклада"
              />
              <input
                type="number"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(Math.max(0, Number(e.target.value)))}
                className="w-32 px-3 py-2 text-sm font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-accent-500"
                aria-label="Введите сумму вклада"
              />
            </div>
            <div className="grid grid-cols-5 gap-1 mt-2">
              {DEPOSIT_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setInitialDeposit(p)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    initialDeposit === p
                      ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {p >= 1000000 ? `${p / 1000000}М` : `${p / 1000}к`}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Interest Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="deposit-rate-range" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Процентная ставка (% годовых)
              </label>
              <span className="text-lg font-black text-accent-600 dark:text-accent-400">
                {rate.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="deposit-rate-range"
                type="range"
                min={5.0}
                max={30.0}
                step={0.1}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-accent-600"
                aria-label="Процентная ставка"
              />
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={rate}
                onChange={(e) => setRate(Math.max(0, Number(e.target.value)))}
                className="w-24 px-3 py-2 text-sm font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-accent-500"
                aria-label="Введите процентную ставку"
              />
            </div>
            <div className="flex justify-between mt-1 text-[11px] text-gray-400">
              <span>5%</span>
              <span>15%</span>
              <span>20%</span>
              <span>30%</span>
            </div>
          </div>

          {/* 3. Term */}
          <div>
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-2">
              Срок вклада
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {TERM_OPTIONS.map((t) => (
                <button
                  key={t.months}
                  type="button"
                  onClick={() => setMonths(t.months)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    months === t.months
                      ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Capitalization Mode */}
          <div>
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-2">
              Порядок выплаты процентов
            </label>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Капитализация процентов">
              <button
                type="button"
                onClick={() => setCapitalization('monthly')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  capitalization === 'monthly'
                    ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20 text-accent-900 dark:text-accent-100 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                <div className="font-bold text-xs md:text-sm mb-0.5">С капитализацией</div>
                <div className="text-[11px] text-accent-600 dark:text-accent-400 font-semibold">
                  Ежемесячно к балансу
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  Эффективная: {result.effectiveRate.toFixed(2)}%
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCapitalization('end')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  capitalization === 'end'
                    ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20 text-accent-900 dark:text-accent-100 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                <div className="font-bold text-xs md:text-sm mb-0.5">В конце срока</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">
                  Выплата на счёт
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  Номинальная: {rate.toFixed(1)}%
                </div>
              </button>
            </div>
          </div>

          {/* 5. Monthly Top-Up */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="deposit-topup-range" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Ежемесячное пополнение
              </label>
              <span className="text-sm font-black text-accent-600 dark:text-accent-400">
                {fmt(monthlyTopUp)} ₽/мес
              </span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <input
                id="deposit-topup-range"
                type="range"
                min={0}
                max={500000}
                step={5000}
                value={monthlyTopUp}
                onChange={(e) => setMonthlyTopUp(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-accent-600"
                aria-label="Ежемесячное пополнение"
              />
              <input
                type="number"
                value={monthlyTopUp}
                onChange={(e) => setMonthlyTopUp(Math.max(0, Number(e.target.value)))}
                className="w-28 px-3 py-2 text-sm font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-accent-500"
                aria-label="Введите пополнение"
              />
            </div>
            <div className="grid grid-cols-4 gap-1 mt-1">
              {TOPUP_PRESETS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMonthlyTopUp(t)}
                  className={`py-1 text-xs font-bold rounded-lg border transition-all ${
                    monthlyTopUp === t
                      ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {t === 0 ? 'Без пополн.' : `${t / 1000}к ₽`}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Central Bank Key Rate (Tax setting) */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="deposit-keyrate-input" className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-accent-500" />
                Ключевая ставка ЦБ (2026)
              </label>
              <span className="text-xs font-black text-accent-600 dark:text-accent-400">
                {keyRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="deposit-keyrate-input"
                type="range"
                min={10.0}
                max={30.0}
                step={0.5}
                value={keyRate}
                onChange={(e) => setKeyRate(Number(e.target.value))}
                className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-accent-600"
                aria-label="Ключевая ставка ЦБ"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-bold whitespace-nowrap">
                Лимит: {fmt(result.taxFreeThreshold)} ₽
              </span>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight">
              Необлагаемый доход = 1 000 000 ₽ × {keyRate.toFixed(1)}% = {fmt(result.taxFreeThreshold)} ₽/год (ст. 214.2 НК РФ).
            </p>
          </div>
        </div>
      </div>

      {/* ---------- RESULTS (3 COLS) ---------- */}
      <div className="lg:col-span-3 space-y-5">
        {/* Main Hero Result Card */}
        <div className="rounded-2xl p-7 md:p-9 text-white shadow-xl overflow-hidden relative bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full translate-y-24 -translate-x-24 pointer-events-none" />

          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-100 bg-white/10 px-3 py-1 rounded-full">
                Итого к получению
              </span>
              <span className="text-xs text-emerald-100/90 font-semibold bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                Эффективная ставка {result.effectiveRate.toFixed(2)}%
              </span>
            </div>

            <div className="my-3">
              <div className="text-4xl md:text-6xl font-black tracking-tight flex items-baseline gap-2">
                {fmt(animatedFinalBalance)} <span className="text-2xl md:text-3xl font-bold">₽</span>
              </div>
              <p className="text-xs md:text-sm text-emerald-100/80 mt-1">
                Вложено: <strong>{fmt(result.totalInvested)} ₽</strong> · Доход после налога: <strong>+{fmt(animatedNetProfit)} ₽</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/20">
              <div>
                <span className="text-xs text-emerald-100 block">Начислено процентов:</span>
                <span className="text-lg md:text-xl font-black text-white">
                  +{fmt(animatedTotalInterest)} ₽
                </span>
              </div>
              <div>
                <span className="text-xs text-emerald-100 block">Налог НДФЛ (2026):</span>
                <span className={`text-lg md:text-xl font-black ${result.totalTax > 0 ? 'text-rose-200' : 'text-emerald-200'}`}>
                  {result.totalTax > 0 ? `-${fmt(animatedTotalTax)} ₽` : '0 ₽ (в лимите)'}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-xs text-emerald-100 block">Чистая доходность:</span>
                <span className="text-lg md:text-xl font-black text-amber-200">
                  {result.netYieldRate.toFixed(2)}% годовых
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-bold mb-1">
              <Wallet className="w-3.5 h-3.5 text-blue-500" />
              Вложено всего
            </div>
            <div className="text-lg font-black text-gray-900 dark:text-white">
              {fmt(result.totalInvested)} ₽
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {result.totalTopUps > 0 ? `+${fmt(result.totalTopUps)} ₽ пополнений` : 'Без пополнений'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-bold mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              Начислено %
            </div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              +{fmt(result.totalInterest)} ₽
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {capitalization === 'monthly' ? 'с капитализацией' : 'в конце срока'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-bold mb-1">
              <Percent className="w-3.5 h-3.5 text-rose-500" />
              Налог по вкладу
            </div>
            <div className={`text-lg font-black ${result.totalTax > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {result.totalTax > 0 ? `${fmt(result.totalTax)} ₽` : '0 ₽'}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {result.totalTax > 0 ? '13% с превышения' : 'в пределах лимита'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Чистая прибыль
            </div>
            <div className="text-lg font-black text-gray-900 dark:text-white">
              +{fmt(result.netProfit)} ₽
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              {result.netYieldRate.toFixed(2)}% годовых
            </div>
          </div>
        </div>

        {/* Tax 2026 Explanation Box (ст. 214.2 НК РФ) */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-heading font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              {isTaxExempt ? (
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-amber-500" />
              )}
              Налог на проценты по вкладам 2026 (ст. 214.2 НК РФ)
            </h4>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                isTaxExempt
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
              }`}
            >
              {isTaxExempt ? 'Налог 0 ₽' : `Налог ${fmt(result.totalTax)} ₽`}
            </span>
          </div>

          <div className="space-y-3 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            <div className="grid sm:grid-cols-3 gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <div>
                <span className="text-gray-400 block">Необлагаемый лимит (год):</span>
                <strong className="text-sm text-gray-900 dark:text-white">
                  {fmt(result.taxFreeThreshold)} ₽
                </strong>
                <span className="text-[10px] text-gray-400 block">1 млн ₽ × {keyRate}%</span>
              </div>
              <div>
                <span className="text-gray-400 block">Годовой доход по вкладу:</span>
                <strong className="text-sm text-gray-900 dark:text-white">
                  {fmt(result.annualizedInterest)} ₽
                </strong>
                <span className="text-[10px] text-gray-400 block">годовой эквивалент</span>
              </div>
              <div>
                <span className="text-gray-400 block">Налоговая база:</span>
                <strong className={`text-sm ${result.taxableIncomeAnnual > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {fmt(result.taxableIncomeAnnual)} ₽
                </strong>
                <span className="text-[10px] text-gray-400 block">превышение лимита</span>
              </div>
            </div>

            {isTaxExempt ? (
              <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                ✓ Ваш доход по вкладу ({fmt(result.totalInterest)} ₽) полностью укладывается в необлагаемый лимит ({fmt(result.taxFreeThreshold)} ₽/год). Платить налог не потребуется.
              </p>
            ) : (
              <p className="text-amber-700 dark:text-amber-400 font-medium">
                ! Доход превышает необлагаемый лимит на {fmt(result.taxableIncomeAnnual)} ₽ в год. На сумму превышения начисляется НДФЛ 13% ({fmt(result.totalTax)} ₽ за весь срок {months} мес.). ФНС пришлёт уведомление автоматически до 1 декабря 2027 г.
              </p>
            )}
          </div>
        </div>

        {/* Month-by-month Schedule Table Accordion */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
          <button
            type="button"
            onClick={() => setShowSchedule(!showSchedule)}
            className="w-full flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent-500" />
              <h4 className="font-heading font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                Помесячный график начисления процентов ({months} мес.)
              </h4>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-accent-600 dark:text-accent-400 group-hover:underline">
              <span>{showSchedule ? 'Скрыть таблицу' : 'Показать таблицу'}</span>
              {showSchedule ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showSchedule && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 z-10">
                    <tr>
                      <th className="text-left py-2 px-2 font-bold">Месяц</th>
                      <th className="text-right py-2 px-2 font-bold">Пополнение</th>
                      <th className="text-right py-2 px-2 font-bold text-emerald-600 dark:text-emerald-400">Проценты</th>
                      <th className="text-right py-2 px-2 font-bold">Накоплено %</th>
                      <th className="text-right py-2 px-2 font-bold">Баланс вклада</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                    {result.schedule.map((row) => (
                      <tr key={row.month} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="py-2 px-2 font-bold text-gray-900 dark:text-white">
                          {row.month}-й мес.
                        </td>
                        <td className="py-2 px-2 text-right font-medium text-gray-600 dark:text-gray-300">
                          {row.topUp > 0 ? `+${fmt(row.topUp)} ₽` : '—'}
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          +{fmt(row.monthlyInterest)} ₽
                        </td>
                        <td className="py-2 px-2 text-right font-medium text-gray-600 dark:text-gray-300">
                          {fmt(row.accruedInterest)} ₽
                        </td>
                        <td className="py-2 px-2 text-right font-black text-gray-900 dark:text-white">
                          {fmt(row.endBalance)} ₽
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons (Copy & Share) */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className={`flex-1 h-13 px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Скопировано ✓' : 'Скопировать результат'}
          </button>

          <button
            type="button"
            onClick={handleShare}
            disabled={shareInProgress}
            className="flex-1 h-13 px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            {shareInProgress ? 'Генерация...' : 'Поделиться (PNG)'}
          </button>
        </div>

        {/* CTA Button to banking comparison widget */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-accent-600 to-blue-700 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-heading font-black text-base md:text-lg mb-1">
              Ищете максимальную ставку?
            </h4>
            <p className="text-xs md:text-sm text-blue-100">
              Сравните актуальные ставки по вкладам и накопительным счетам в 30+ банках
            </p>
          </div>
          <button
            type="button"
            onClick={scrollToBankWidget}
            className="shrink-0 px-5 py-3 rounded-xl bg-white text-accent-700 font-bold text-sm hover:bg-blue-50 transition-all shadow-md flex items-center gap-2"
          >
            Подобрать вклад со ставкой до 22%
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hidden Share Card for html-to-image */}
      <div ref={shareCardRef}>
        <ShareCard
          result={result}
          rate={rate}
          months={months}
          capitalization={capitalization}
          keyRate={keyRate}
        />
      </div>
    </div>
  );
}
