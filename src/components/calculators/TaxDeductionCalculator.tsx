import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Copy, Share2, Check, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import { toPng } from 'html-to-image';
import { fmt } from '../../lib/tax';

const INITIAL_BONUS = 10000;
const PRESETS = [30000, 60000, 100000, 200000];

type ClientType = 'physical' | 'legal';

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
  clientType,
  monthlySaving,
  taxWithBonus,
  taxStandard,
  monthsLeft,
}: {
  income: number;
  clientType: ClientType;
  monthlySaving: number;
  taxWithBonus: number;
  taxStandard: number;
  monthsLeft: number;
}) {
  return (
    <div
      id="share-card-deduction"
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
        СЧИТАЙ.RU — ВЫЧЕТ САМОЗАНЯТОГО
      </div>

      <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1, marginBottom: 16, color: '#10B981' }}>
        10 000 ₽
      </div>

      <div style={{ fontSize: 24, color: '#94A3B8', textAlign: 'center', marginBottom: 24 }}>
        Налоговый бонус для самозанятых (422-ФЗ)
      </div>

      <div style={{ fontSize: 22, color: '#E2E8F0', textAlign: 'center', lineHeight: 1.6, maxWidth: 800 }}>
        При доходе <strong style={{ color: '#fff' }}>{fmt(income)} ₽/мес</strong> ({clientType === 'physical' ? 'физлица, ставка 3%' : 'юрлица / ИП, ставка 4%'}):<br />
        Экономия на налоге: <strong style={{ color: '#10B981' }}>{fmt(monthlySaving)} ₽/мес</strong><br />
        Бонуса 10 000 ₽ хватит на <strong style={{ color: '#38BDF8' }}>~{monthsLeft < 1 ? '< 1' : monthsLeft.toFixed(1)} мес.</strong>
      </div>

      <div
        style={{
          width: 600,
          height: 3,
          background: 'rgba(255,255,255,0.08)',
          margin: '48px 0',
        }}
      />

      <div style={{ fontSize: 28, color: '#2563EB', fontWeight: 700 }}>
        schitay-online.ru
      </div>
      <div style={{ fontSize: 16, color: '#64748B', marginTop: 8 }}>
        Калькулятор налогового вычета 10 000 ₽ онлайн
      </div>
    </div>
  );
}

export function TaxDeductionCalculator() {
  const [income, setIncome] = useState(80000);
  const [clientType, setClientType] = useState<ClientType>('physical');
  const [copied, setCopied] = useState(false);
  const [shareInProgress, setShareInProgress] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();
  const shareCardRef = useRef<HTMLDivElement>(null);

  // Rate logic:
  // Physical: base rate 4%, bonus reduces by 1% -> effective rate 3%
  // Legal: base rate 6%, bonus reduces by 2% -> effective rate 4%
  const baseRate = clientType === 'physical' ? 4 : 6;
  const bonusRate = clientType === 'physical' ? 1 : 2;
  const reducedRate = baseRate - bonusRate; // 3% for physical, 4% for legal

  const monthlyTaxStandard = Math.round(income * (baseRate / 100));
  const monthlyTaxWithBonus = Math.round(income * (reducedRate / 100));
  const monthlySaving = Math.round(income * (bonusRate / 100));

  const monthsUntilExhausted = monthlySaving > 0 ? INITIAL_BONUS / monthlySaving : 0;
  const monthsCeil = Math.ceil(monthsUntilExhausted);

  // Animated numbers
  const animatedTaxWithBonus = useAnimatedValue(monthlyTaxWithBonus);
  const animatedTaxStandard = useAnimatedValue(monthlyTaxStandard);
  const animatedMonthlySaving = useAnimatedValue(monthlySaving);
  const animatedMonths = useAnimatedValue(monthsUntilExhausted);

  // Month-by-month depletion schedule for visual preview (first 6 months or until exhausted)
  const schedule = useMemo(() => {
    const rows = [];
    let remaining = INITIAL_BONUS;
    const maxMonths = Math.min(12, Math.max(1, monthsCeil));

    for (let m = 1; m <= maxMonths; m++) {
      if (remaining <= 0) break;
      const deductionUsed = Math.min(remaining, monthlySaving);
      const taxPaid = monthlyTaxStandard - deductionUsed;
      const remAfter = Math.max(0, remaining - deductionUsed);
      rows.push({
        month: m,
        remainingBefore: remaining,
        deductionUsed,
        taxPaid,
        remainingAfter: remAfter,
        percentRemaining: (remAfter / INITIAL_BONUS) * 100,
      });
      remaining = remAfter;
    }
    return rows;
  }, [monthlySaving, monthlyTaxStandard, monthsCeil]);

  const handleCopy = useCallback(async () => {
    const text = [
      `Расчёт налогового вычета 10 000 ₽ для самозанятого:`,
      `Доход: ${fmt(income)} ₽/мес (${clientType === 'physical' ? 'клиенты — физлица' : 'клиенты — юрлица/ИП'}).`,
      `Налог со скидкой (${reducedRate}%): ${fmt(monthlyTaxWithBonus)} ₽/мес.`,
      `Экономия: ${fmt(monthlySaving)} ₽/мес (скидка ${bonusRate}%).`,
      `Бонуса 10 000 ₽ хватит на ~${monthsUntilExhausted.toFixed(1)} мес.`,
      `Налог после исчерпания бонуса (${baseRate}%): ${fmt(monthlyTaxStandard)} ₽/мес.`,
      'Рассчитано на schitay-online.ru/dlya-samozanyatyh/vychet/',
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }

    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  }, [income, clientType, reducedRate, monthlyTaxWithBonus, monthlySaving, bonusRate, monthsUntilExhausted, baseRate, monthlyTaxStandard]);

  const handleShare = useCallback(async () => {
    setShareInProgress(true);
    try {
      const cardNode = document.getElementById('share-card-deduction');
      if (!cardNode) return;

      const dataUrl = await toPng(cardNode, { width: 1080, height: 1080 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'vychet-samozanyatogo-10000.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Мой налоговый вычет 10 000 ₽' });
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'vychet-samozanyatogo-10000.png';
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

  // Depletion progress percentage per month
  const monthlyDepletionPct = Math.min(100, (monthlySaving / INITIAL_BONUS) * 100);

  return (
    <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
      {/* ---------- INPUTS (2 cols) ---------- */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 md:p-8 sticky top-24">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              %
            </span>
            <div>
              <h3 className="font-heading font-black text-base text-gray-900 dark:text-white">
                Параметры дохода
              </h3>
              <p className="text-xs text-gray-400">Стартовый бонус: 10 000 ₽</p>
            </div>
          </div>

          {/* Monthly Income */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="deduction-income-range" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Доход в месяц
              </label>
              <span className="text-lg font-black text-accent-600 dark:text-accent-400">
                {fmt(income)} ₽
              </span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <input
                id="deduction-income-range"
                type="range"
                min={10000}
                max={500000}
                step={5000}
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-accent-600"
                aria-label="Доход в месяц"
              />
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(Math.max(0, Number(e.target.value)))}
                className="w-28 px-3 py-2 text-sm font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-accent-500"
                aria-label="Введите доход"
              />
            </div>
            {/* Presets */}
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setIncome(p)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    income === p
                      ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {p >= 1000000 ? `${p / 1000000}М` : `${p / 1000}к`}
                </button>
              ))}
            </div>
          </div>

          {/* Client Type Toggle */}
          <div className="mb-6">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-2">
              Кто ваши клиенты?
            </label>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Тип клиента">
              <button
                type="button"
                onClick={() => setClientType('physical')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  clientType === 'physical'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                <div className="font-bold text-xs md:text-sm mb-0.5">Физлица</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  Вычет 1% · ставка 3%
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  вместо базовых 4%
                </div>
              </button>

              <button
                type="button"
                onClick={() => setClientType('legal')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  clientType === 'legal'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                <div className="font-bold text-xs md:text-sm mb-0.5">Юрлица и ИП</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  Вычет 2% · ставка 4%
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  вместо базовых 6%
                </div>
              </button>
            </div>
          </div>

          {/* Quick info note */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Статья 12 Федерального закона № 422-ФЗ
            </div>
            <p>
              Вычет начисляется автоматически при первой регистрации самозанятости. Подавать заявления и декларации не нужно.
            </p>
          </div>
        </div>
      </div>

      {/* ---------- RESULTS (3 cols) ---------- */}
      <div className="lg:col-span-3 space-y-5">
        {/* Main Result Card */}
        <div className="rounded-2xl p-6 md:p-8 text-white shadow-lg overflow-hidden relative bg-gradient-to-br from-emerald-600 to-teal-800">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />

          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-100 bg-white/10 px-2.5 py-1 rounded-full">
                Стартовый бонус 10 000 ₽
              </span>
              <span className="text-xs text-emerald-100/90 font-semibold">
                Льготная ставка {reducedRate}%
              </span>
            </div>

            <div className="my-2">
              <p className="text-xs text-white/80 uppercase tracking-wider font-semibold mb-1">
                Налог с учётом вычета в месяц
              </p>
              <div className="text-4xl md:text-5xl font-black tracking-tight flex items-baseline gap-2">
                {fmt(animatedTaxWithBonus)} <span className="text-2xl font-bold">₽</span>
                <span className="text-sm font-semibold text-emerald-200 line-through">
                  {fmt(animatedTaxStandard)} ₽
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/20">
              <div>
                <span className="text-xs text-emerald-100 block">Ежемесячная экономия ({bonusRate}%):</span>
                <span className="text-xl font-black text-white">
                  {fmt(animatedMonthlySaving)} ₽/мес
                </span>
              </div>
              <div>
                <span className="text-xs text-emerald-100 block">Бонуса 10 000 ₽ хватит на:</span>
                <span className="text-xl font-black text-white">
                  ~{monthsUntilExhausted < 1 ? '< 1' : animatedMonths.toFixed(1)} мес.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Depletion Bar Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-heading font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Шкала расходования бонуса 10 000 ₽
            </h4>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {monthlyDepletionPct.toFixed(1)}% в месяц
            </span>
          </div>

          {/* Depletion speed bar */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Расход бонуса в месяц: <strong>{fmt(monthlySaving)} ₽</strong></span>
              <span>Полный объём: <strong>10 000 ₽</strong></span>
            </div>
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 border border-gray-200 dark:border-gray-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(3, monthlyDepletionPct))}%` }}
                title={`Расход ${fmt(monthlySaving)} ₽/мес`}
              />
            </div>
          </div>

          {/* Rate comparison during vs after */}
          <div className="grid sm:grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                <Check className="w-3.5 h-3.5" /> В период вычета (~{monthsUntilExhausted < 1 ? '1' : monthsCeil} мес)
              </div>
              <div className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
                {fmt(monthlyTaxWithBonus)} ₽
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                Ставка <strong>{reducedRate}%</strong> (скидка {bonusRate}%)
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                <Clock className="w-3.5 h-3.5" /> После исчерпания бонуса
              </div>
              <div className="text-2xl font-black text-gray-900 dark:text-white">
                {fmt(monthlyTaxStandard)} ₽
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Стандартная ставка <strong>{baseRate}%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Depletion Preview Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider">
              Помесячный график списания вычета
            </h4>
            <span className="text-xs text-gray-400">
              {monthsCeil > 12 ? 'первые 12 месяцев' : `все ${monthsCeil} мес.`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400">
                  <th className="text-left py-2 px-2 font-bold">Месяц</th>
                  <th className="text-right py-2 px-2 font-bold">Остаток бонуса</th>
                  <th className="text-right py-2 px-2 font-bold text-emerald-600 dark:text-emerald-400">Скидка (-{bonusRate}%)</th>
                  <th className="text-right py-2 px-2 font-bold">К уплате</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {schedule.map((row) => (
                  <tr key={row.month} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-2.5 px-2 font-bold text-gray-900 dark:text-white">
                      {row.month}-й месяц
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium text-gray-600 dark:text-gray-300">
                      {fmt(row.remainingBefore)} ₽
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      -{fmt(row.deductionUsed)} ₽
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-gray-900 dark:text-white">
                      {fmt(row.taxPaid)} ₽
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {monthsCeil > 12 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
              ...и ещё {monthsCeil - 12} мес. до полного исчерпания бонуса
            </p>
          )}
        </div>

        {/* Action Buttons */}
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
            {shareInProgress ? 'Генерация...' : 'Поделиться'}
          </button>
        </div>
      </div>

      {/* Hidden Share Card for html-to-image */}
      <div ref={shareCardRef}>
        <ShareCard
          income={income}
          clientType={clientType}
          monthlySaving={monthlySaving}
          taxWithBonus={monthlyTaxWithBonus}
          taxStandard={monthlyTaxStandard}
          monthsLeft={monthsUntilExhausted}
        />
      </div>
    </div>
  );
}
