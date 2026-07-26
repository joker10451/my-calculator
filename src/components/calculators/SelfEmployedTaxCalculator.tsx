import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Copy, Share2, Check } from 'lucide-react';
import { toPng } from 'html-to-image';
import { calcNpd, calcUsn, calcPatent, fmt, NPD_LIMIT } from '../../lib/tax';

type Mode = 'npd' | 'usn' | 'patent';

interface CalculatorState {
  income: number;
  mode: Mode;
  fromLegal: boolean;
  hasEmployees: boolean;
  patentCost: number;
}

interface TaxBreakdown {
  tax: number;
  rate: number;
  label: string;
  color: string;
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

function ShareCard({
  income,
  tax,
  rate,
  mode,
  fromLegal,
}: {
  income: number;
  tax: number;
  rate: number;
  mode: Mode;
  fromLegal: boolean;
}) {
  return (
    <div
      id="share-card"
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
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Unbounded, Inter, Arial, sans-serif',
        color: '#fff',
        padding: 60,
      }}
    >
      <div style={{ fontSize: 16, color: '#64748B', letterSpacing: 6, marginBottom: 40 }}>
        СЧИТАЙ.RU — КАЛЬКУЛЯТОР НАЛОГА
      </div>

      <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1, marginBottom: 16 }}>
        {fmt(tax)} ₽
      </div>

      <div style={{ fontSize: 24, color: '#94A3B8', textAlign: 'center' }}>
        {mode === 'npd'
          ? `налог самозанятого при доходе ${fmt(income)} ₽/мес`
          : mode === 'usn'
          ? `налог ИП на УСН при доходе ${fmt(income)} ₽/мес`
          : `налог ИП на патенте при доходе ${fmt(income)} ₽/мес`}
      </div>

      <div style={{ fontSize: 18, color: '#64748B', marginTop: 8 }}>
        Ставка: {rate.toFixed(1)}% ·{' '}
        {mode === 'npd' ? (fromLegal ? 'доход от юрлиц' : 'доход от физлиц') : ''}
      </div>

      <div
        style={{
          width: 600,
          height: 3,
          background: 'rgba(255,255,255,0.08)',
          margin: '48px 0',
        }}
      />

      <div style={{ fontSize: 28, color: '#2563EB' }}>
        schitay-online.ru
      </div>
      <div style={{ fontSize: 16, color: '#64748B', marginTop: 8 }}>
        Рассчитай свой налог за 30 секунд
      </div>
    </div>
  );
}

export function SelfEmployedTaxCalculator() {
  const [state, setState] = useState<CalculatorState>({
    income: 100000,
    mode: 'npd',
    fromLegal: false,
    hasEmployees: false,
    patentCost: 60000,
  });
  const [copied, setCopied] = useState(false);
  const [shareInProgress, setShareInProgress] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();

  const set = useCallback(<K extends keyof CalculatorState>(k: K, v: CalculatorState[K]) => {
    setState((s) => ({ ...s, [k]: v }));
  }, []);

  const result = useMemo(() => {
    if (state.mode === 'npd') return calcNpd(state.income, state.fromLegal);
    if (state.mode === 'usn') return calcUsn(state.income, state.hasEmployees);
    return calcPatent(state.income, state.patentCost);
  }, [state]);

  const limitWarning =
    state.mode === 'npd' && state.income * 12 > NPD_LIMIT;

  const npdComp = useMemo(() => calcNpd(state.income, state.fromLegal), [state.income, state.fromLegal]);
  const usnComp = useMemo(() => calcUsn(state.income, state.hasEmployees), [state.income, state.hasEmployees]);
  const ndflTax = state.income * 0.13;

  const breakdowns: TaxBreakdown[] = useMemo(() => {
    const npdBurden = npdComp.tax;
    const usnBurden = usnComp.totalBurden ?? usnComp.tax;
    const items: TaxBreakdown[] = [
      { tax: npdBurden, rate: npdComp.rate, label: 'НПД', color: '#10B981' },
      { tax: usnBurden, rate: npdComp.rate, label: 'ИП УСН', color: '#F59E0B' },
      { tax: Math.round(ndflTax), rate: 13, label: 'НДФЛ 13%', color: '#64748B' },
    ];
    const minBurden = Math.min(...items.map((i) => i.tax));
    return items.map((i) => ({
      ...i,
      isBest: i.tax === minBurden,
    }));
  }, [npdComp, usnComp, ndflTax]);

  const maxBurden = Math.max(...breakdowns.map((b) => b.tax));

  const animatedTax = useAnimatedValue(result.tax);

  const handleCopy = useCallback(async () => {
    const text = [
      `Налог самозанятого при доходе ${fmt(state.income)} ₽/мес: ${fmt(result.tax)} ₽/мес (ставка ${result.rate.toFixed(1)}%).`,
      `Экономия vs НДФЛ 13%: ${fmt(result.savingsNdfl)} ₽/мес.`,
      'Рассчитано на schitay-online.ru',
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }

    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  }, [state.income, result]);

  const handleShare = useCallback(async () => {
    setShareInProgress(true);
    try {
      const cardNode = document.getElementById('share-card');
      if (!cardNode) return;

      const dataUrl = await toPng(cardNode, { width: 1080, height: 1080 });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'nalog-samozanyatogo-2026.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Мой налог самозанятого' });
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'nalog-samozanyatogo-2026.png';
        a.click();
      }
    } catch {
      // silent
    } finally {
      setShareInProgress(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  return (
    <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
      {/* ---------- INPUTS ---------- */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 md:p-8 sticky top-24">
          {/* Mode tabs */}
          <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 mb-6" role="tablist">
            {(
              [
                { id: 'npd' as Mode, label: 'Самозанятость' },
                { id: 'usn' as Mode, label: 'ИП УСН' },
                { id: 'patent' as Mode, label: 'Патент' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                role="tab"
                aria-selected={state.mode === m.id}
                onClick={() => set('mode', m.id)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  state.mode === m.id
                    ? 'bg-accent-600 text-white shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 -mt-3">
            {state.mode === 'npd'
              ? 'Налог на профессиональный доход: 4% с физлиц, 6% с юрлиц'
              : state.mode === 'usn'
              ? 'Упрощённая система: 6% от дохода, уменьшается на взносы'
              : 'Фиксированная стоимость патента + страховые взносы'}
          </p>

          {/* Income */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Доход в месяц
              </label>
              <span className="text-lg font-black text-accent-600 dark:text-accent-400">
                {fmt(state.income)} ₽
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={10000}
                max={1000000}
                step={5000}
                value={state.income}
                onChange={(e) => set('income', Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-accent-600"
                aria-label="Доход в месяц"
              />
              <input
                type="number"
                value={state.income}
                onChange={(e) => set('income', Math.max(0, Number(e.target.value)))}
                className="w-28 px-3 py-2 text-sm font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-accent-500"
                aria-label="Введите доход"
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-gray-400">
              <span>10 тыс</span>
              <span>250 тыс</span>
              <span>500 тыс</span>
              <span>1 млн</span>
            </div>
          </div>

          {/* Mode-specific options */}
          {state.mode === 'npd' && (
            <div className="mb-6">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-2">
                Кто ваш клиент?
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => set('fromLegal', false)}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl border-2 transition-all ${
                    !state.fromLegal
                      ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  Физлица (4%)
                </button>
                <button
                  onClick={() => set('fromLegal', true)}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl border-2 transition-all ${
                    state.fromLegal
                      ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  Юрлица / ИП (6%)
                </button>
              </div>
            </div>
          )}

          {state.mode === 'usn' && (
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.hasEmployees}
                  onChange={(e) => set('hasEmployees', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-accent-600 focus:ring-accent-500"
                />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Есть наёмные сотрудники
                </span>
              </label>
              <p className="text-xs text-gray-400 mt-1 ml-8">
                С сотрудниками налог можно уменьшить на взносы только до 50%
              </p>
            </div>
          )}

          {state.mode === 'patent' && (
            <div className="mb-6">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-2">
                Стоимость патента в год (₽)
              </label>
              <input
                type="number"
                value={state.patentCost}
                onChange={(e) => set('patentCost', Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                placeholder="Например: 60000"
              />
              <p className="text-xs text-gray-400 mt-1">
                Узнайте стоимость в вашем регионе на сайте ФНС
              </p>
            </div>
          )}

          {/* Limit warning */}
          {limitWarning && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm">
              <p className="font-bold text-red-700 dark:text-red-400 mb-1">
                Внимание: превышение лимита НПД
              </p>
              <p className="text-red-600 dark:text-red-300">
                При таком доходе ({fmt(state.income)} ₽/мес) годовая сумма
                ({fmt(state.income * 12)} ₽) превышает лимит 2,4 млн ₽.
                После превышения нужно регистрироваться как ИП.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ---------- RESULTS ---------- */}
      <div className="lg:col-span-3 space-y-5">
        {/* Main result */}
        <div
          className={`rounded-2xl p-7 md:p-9 text-white shadow-lg overflow-hidden relative ${
            state.mode === 'npd'
              ? 'bg-gradient-to-br from-emerald-600 to-emerald-800'
              : state.mode === 'usn'
              ? 'bg-gradient-to-br from-warm-500 to-warm-700'
              : 'bg-gradient-to-br from-accent-600 to-blue-800'
          }`}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />

          <div className="relative">
            <p className="text-sm font-bold uppercase tracking-widest text-white/70 mb-1">
              Налог в месяц
            </p>
            <div className="text-5xl md:text-6xl font-black tracking-tight mb-1">
              {fmt(animatedTax)} <span className="text-3xl">₽</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm text-white/80">
              <span>В год: <strong>{fmt(result.taxYear)} ₽</strong></span>
              <span>
                Ставка:{' '}
                <strong>
                  {result.rate.toFixed(1)}%
                </strong>
              </span>
              {result.insurance > 0 && (
                <span>
                  Взносы: <strong>{fmt(result.insurance)} ₽/мес</strong>
                </span>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-lg font-bold">
                Экономия vs НДФЛ 13%: {fmt(result.savingsNdfl)} ₽/мес
              </p>
            </div>
          </div>
        </div>

        {/* Comparison bars */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 md:p-7">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-5 uppercase tracking-wider">
            Сравнение режимов
          </h3>
          <div className="space-y-4">
            {breakdowns.map((b) => {
              const pct = maxBurden > 0 ? (b.tax / maxBurden) * 100 : 0;
              return (
                <div key={b.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                      {b.isBest && (
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs">✓ Выгодно</span>
                      )}
                      {b.label}
                    </span>
                    <span className="text-sm font-black text-gray-900 dark:text-white">
                      {fmt(b.tax)} ₽
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        b.isBest ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className={`flex-1 h-13 px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Скопировано ✓' : 'Скопировать результат'}
          </button>
          <button
            onClick={handleShare}
            disabled={shareInProgress}
            className="flex-1 h-13 px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            {shareInProgress ? 'Генерация...' : 'Поделиться'}
          </button>
        </div>
      </div>

      {/* Hidden share card */}
      <div ref={shareCardRef}>
        <ShareCard
          income={state.income}
          tax={result.tax}
          rate={result.rate}
          mode={state.mode}
          fromLegal={state.fromLegal}
        />
      </div>
    </div>
  );
}
