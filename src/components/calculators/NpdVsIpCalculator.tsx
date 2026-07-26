import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Copy, Share2, Check } from 'lucide-react';
import { toPng } from 'html-to-image';
import { compareNpdVsUsn, fmt, FIXED_CONTRIBUTIONS_2026, NPD_LIMIT } from '../../lib/tax';

const PRESETS = [80000, 150000, 300000];

function useAnimatedValue(target: number, duration = 400): number {
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

function SegmentedBar({
  label,
  taxAmount,
  insuranceAmount,
  maxTotal,
  taxColor,
  insuranceColor,
  isWinner,
}: {
  label: string;
  taxAmount: number;
  insuranceAmount: number;
  maxTotal: number;
  taxColor: string;
  insuranceColor: string;
  isWinner: boolean;
}) {
  const total = taxAmount + insuranceAmount;
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const taxPct = total > 0 ? (taxAmount / total) * 100 : 0;
  const insPct = total > 0 ? (insuranceAmount / total) * 100 : 0;

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-bold ${isWinner ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {label}
          {isWinner && <span className="ml-1.5 text-emerald-500">✓</span>}
        </span>
        <span className="text-xs font-black text-gray-900 dark:text-white">{fmt(total)} ₽</span>
      </div>
      <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
        {taxAmount > 0 && (
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${taxPct}%`,
              background: taxColor,
            }}
            title={`Налог: ${fmt(taxAmount)} ₽`}
          />
        )}
        {insuranceAmount > 0 && (
          <div
            className="h-full transition-all duration-500 opacity-60"
            style={{
              width: `${insPct}%`,
              background: insuranceColor,
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.15) 4px, rgba(255,255,255,0.15) 8px)`,
            }}
            title={`Взносы: ${fmt(insuranceAmount)} ₽`}
          />
        )}
      </div>
      <div className="flex gap-3 mt-0.5 text-[10px] text-gray-400">
        {taxAmount > 0 && <span>налог {fmt(taxAmount)} ₽</span>}
        {insuranceAmount > 0 && <span>взносы {fmt(insuranceAmount)} ₽</span>}
      </div>
    </div>
  );
}

export function NpdVsIpCalculator() {
  const [income, setIncome] = useState(100000);
  const [legalShare, setLegalShare] = useState(0);
  const [hasEmployees, setHasEmployees] = useState(false);
  const [useDeduction, setUseDeduction] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareInProgress, setShareInProgress] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const comparison = useMemo(
    () => compareNpdVsUsn(income, legalShare, hasEmployees, useDeduction),
    [income, legalShare, hasEmployees, useDeduction]
  );

  const winnerBurden = comparison.winner === 'npd' ? comparison.npdBurden : comparison.usnBurden;
  const loserBurden = comparison.winner === 'npd' ? comparison.usnBurden : comparison.npdBurden;
  const maxBurden = Math.max(comparison.npdBurden, comparison.usnBurden);

  const animatedWinner = useAnimatedValue(comparison.winner === 'npd' ? comparison.npdBurden : comparison.usnBurden);
  const animatedLoser = useAnimatedValue(comparison.winner === 'npd' ? comparison.usnBurden : comparison.npdBurden);
  const animatedMonths = useAnimatedValue(comparison.npdDeductionMonthsLeft ?? 0);
  const animatedDedSaving = useAnimatedValue(
    useDeduction && comparison.winner === 'npd'
      ? comparison.usnBurden - comparison.npdMonthlyWithDeduction
      : 0
  );

  const handleCopy = useCallback(async () => {
    const lines = [
      `Сравнение НПД vs ИП УСН при доходе ${fmt(income)} ₽/мес`,
      `НПД: ${fmt(comparison.npdBurden)} ₽/мес (ставка ${comparison.npd.rate.toFixed(1)}%)`,
      `ИП УСН: ${fmt(comparison.usnBurden)} ₽/мес (ставка ${comparison.usn.effectiveRate.toFixed(1)}%)`,
      comparison.winner !== 'tie'
        ? `${comparison.winner === 'npd' ? 'НПД' : 'ИП УСН'} выгоднее на ${fmt(comparison.monthlySavings)} ₽/мес`
        : 'Режимы примерно равны по нагрузке',
      'Рассчитано на schitay-online.ru',
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
    } catch { return; }
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  }, [income, comparison]);

  const handleShare = useCallback(async () => {
    setShareInProgress(true);
    try {
      const el = containerRef.current;
      if (!el) return;
      const dataUrl = await toPng(el, { width: 800, height: 800, backgroundColor: '#0F172A' });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'npd-vs-ip-sravnenie.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Сравнение НПД и ИП УСН' });
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'npd-vs-ip-sravnenie.png';
        a.click();
      }
    } catch { /* silent */ } finally {
      setShareInProgress(false);
    }
  }, []);

  useEffect(() => {
    return () => { if (copyTimer.current) clearTimeout(copyTimer.current); };
  }, []);

  return (
    <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
      {/* ---------- INPUTS ---------- */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 md:p-8 sticky top-24">
          <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white mb-5 uppercase tracking-wider">
            Параметры
          </h3>

          {/* Income */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Доход в месяц
              </label>
              <span className="text-lg font-black text-accent-600 dark:text-accent-400">
                {fmt(income)} ₽
              </span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <input
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
                className="w-24 px-3 py-2 text-sm font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-accent-500"
                aria-label="Введите доход"
              />
            </div>
            <div className="flex gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setIncome(p)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    income === p
                      ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {fmt(p)} ₽
                </button>
              ))}
            </div>
          </div>

          {/* Legal entity share */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Доля от юрлиц
              </label>
              <span className="text-sm font-black text-accent-600 dark:text-accent-400">{legalShare}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={legalShare}
              onChange={(e) => setLegalShare(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-accent-600"
              aria-label="Доля платежей от юрлиц"
            />
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>0% (только физлица)</span>
              <span>100% (только юрлица)</span>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasEmployees}
                onChange={(e) => setHasEmployees(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-accent-600 focus:ring-accent-500"
              />
              <div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Наёмные сотрудники</span>
                <p className="text-xs text-gray-400">У ИП вычет по взносам ограничен 50%</p>
              </div>
            </label>

            {/* Deduction block */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDeduction}
                  onChange={(e) => setUseDeduction(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-accent-600 focus:ring-accent-500"
                />
                <div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Учесть стартовый вычет 10 000 ₽</span>
                  <p className="text-xs text-gray-400">даётся один раз новым самозанятым, снижает ставку до 3%/4%, пока не исчерпан</p>
                </div>
              </label>

              {useDeduction && comparison.npdDeductionMonthsLeft !== null && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 transition-opacity">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Вычет хватит на</span>
                    <span className="font-heading font-black text-sm text-accent-600 dark:text-accent-400 tabular-nums">
                      ~{Math.round(animatedMonths)} мес
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-500 to-accent-600 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (Math.round(animatedMonths) / 24) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">при этом доходе · чем выше доход, тем быстрее тает</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>Взносы ИП (2026): {fmt(FIXED_CONTRIBUTIONS_2026)} ₽/год + 1% с дохода &gt; 300к</p>
              <p>Лимит НПД: {fmt(NPD_LIMIT)} ₽/год</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- RESULTS ---------- */}
      <div className="lg:col-span-3 space-y-5" ref={containerRef}>
        {/* Verdict banner */}
        <div className={`rounded-2xl p-6 md:p-8 text-white shadow-lg overflow-hidden relative ${
          !comparison.npdAvailable
            ? 'bg-gradient-to-br from-red-600 to-red-800'
            : comparison.winner === 'npd'
            ? 'bg-gradient-to-br from-emerald-600 to-emerald-800'
            : comparison.winner === 'usn'
            ? 'bg-gradient-to-br from-warm-500 to-warm-700'
            : 'bg-gradient-to-br from-accent-600 to-blue-800'
        }`}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
          <div className="relative">
            {!comparison.npdAvailable ? (
              <>
                <p className="text-sm font-bold uppercase tracking-widest text-white/70 mb-1">НПД недоступен</p>
                <p className="text-2xl md:text-3xl font-black tracking-tight mb-1">
                  Годовой доход превышает лимит 2,4 млн ₽
                </p>
                <p className="text-white/80 text-sm mt-2">
                  Единственный вариант — ИП на УСН: <strong>{fmt(comparison.usnBurden)} ₽/мес</strong> полной нагрузки
                </p>
              </>
            ) : comparison.winner === 'tie' ? (
              useDeduction ? (
                <>
                  <p className="text-sm font-bold uppercase tracking-widest text-white/70 mb-1">Режимы равны (устойчиво)</p>
                  <p className="text-2xl md:text-3xl font-black tracking-tight mb-1">
                    Вычет склоняет чашу в пользу НПД
                  </p>
                  <p className="text-white/80 text-sm mt-2">
                    С вычетом НПД: {fmt(comparison.npdMonthlyWithDeduction)} ₽/мес · УСН: {fmt(comparison.usnBurden)} ₽/мес · экономия ~{fmt(comparison.usnBurden - comparison.npdMonthlyWithDeduction)} ₽/мес первые ~{comparison.npdDeductionMonthsLeft} мес
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold uppercase tracking-widest text-white/70 mb-1">Режимы равны</p>
                  <p className="text-2xl md:text-3xl font-black tracking-tight mb-1">
                    Нагрузка одинаковая
                  </p>
                  <p className="text-white/80 text-sm mt-2">
                    НПД: {fmt(comparison.npdBurden)} ₽/мес · УСН: {fmt(comparison.usnBurden)} ₽/мес
                  </p>
                </>
              )
            ) : comparison.winner === 'npd' && useDeduction ? (
              <>
                <p className="text-sm font-bold uppercase tracking-widest text-white/70 mb-1">С вычетом НПД выгоднее</p>
                <p className="text-3xl md:text-5xl font-black tracking-tight mb-1">
                  {fmt(comparison.usnBurden - comparison.npdMonthlyWithDeduction)} <span className="text-xl md:text-2xl">₽/мес</span>
                </p>
                <p className="text-white/80 text-sm mt-2">
                  первые ~{comparison.npdDeductionMonthsLeft} мес, затем <strong>{fmt(comparison.monthlySavings)} ₽/мес</strong>
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold uppercase tracking-widest text-white/70 mb-1">
                  {comparison.winner === 'npd' ? 'НПД выгоднее' : 'ИП УСН выгоднее'}
                </p>
                <p className="text-3xl md:text-5xl font-black tracking-tight mb-1">
                  {fmt(comparison.monthlySavings)} <span className="text-xl md:text-2xl">₽/мес</span>
                </p>
                <p className="text-white/80 text-sm mt-2">
                  {comparison.winner === 'usn' && useDeduction
                    ? 'вычет 10 000 ₽ немного снизит НПД на старте, но режим всё равно выгоднее ИП'
                    : <>Экономия в год: <strong>{fmt(comparison.annualSavings)} ₽</strong></>
                  }
                </p>
              </>
            )}
          </div>
        </div>

        {/* Asymmetric panels */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* NPD panel */}
          <div className={`rounded-2xl border-2 p-5 transition-all ${
            comparison.winner === 'npd'
              ? 'flex-[2] border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-gray-900'
              : 'flex-1 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className={`font-heading font-black text-lg ${
                comparison.winner === 'npd' ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-white'
              }`}>НПД</h4>
              {comparison.winner === 'npd' && (
                <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">
                  Выгоднее
                </span>
              )}
            </div>

            {!comparison.npdAvailable ? (
              <div className="py-4 text-center">
                <div className="font-heading text-lg font-black text-red-500 mb-1">
                  Недоступен
                </div>
                <div className="text-xs text-red-400">
                  превышен лимит 2,4 млн ₽/год
                </div>
              </div>
            ) : useDeduction ? (
              <>
                <div className="font-heading text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
                  {fmt(comparison.npdMonthlyWithDeduction)} ₽
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  с вычетом, первые ~{comparison.npdDeductionMonthsLeft} мес
                </div>
                <div className="font-heading text-xl font-bold text-gray-400 dark:text-gray-500">
                  {fmt(comparison.npdBurden)} ₽
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  после исчерпания вычета · ставка {comparison.npd.effectiveRate.toFixed(1)}%
                </div>
              </>
            ) : (
              <>
                <div className="font-heading text-3xl font-black text-gray-900 dark:text-white mb-1">
                  {comparison.winner === 'npd' ? fmt(Math.round(animatedWinner)) : fmt(comparison.npdBurden)} ₽
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  в месяц · ставка {comparison.npd.effectiveRate.toFixed(1)}%
                </div>
              </>
            )}
          </div>

          {/* USN panel */}
          <div className={`rounded-2xl border-2 p-5 transition-all ${
            comparison.winner === 'usn'
              ? 'flex-[2] border-warm-300 dark:border-warm-700 bg-gradient-to-br from-warm-50 to-white dark:from-warm-950/30 dark:to-gray-900'
              : 'flex-1 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className={`font-heading font-black text-lg ${
                comparison.winner === 'usn' ? 'text-warm-700 dark:text-warm-400' : 'text-gray-900 dark:text-white'
              }`}>ИП УСН 6%</h4>
              {comparison.winner === 'usn' && (
                <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-warm-100 dark:bg-warm-900/50 text-warm-700 dark:text-warm-400">
                  Выгоднее
                </span>
              )}
            </div>
            <div className="font-heading text-3xl font-black text-gray-900 dark:text-white mb-1">
              {comparison.winner === 'usn' ? fmt(Math.round(animatedWinner)) : fmt(comparison.usnBurden)} ₽
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              в месяц · эффективная ставка {comparison.usn.effectiveRate.toFixed(1)}%
            </div>
            {comparison.usn.insurance > 0 && (
              <div className="mt-2 text-xs text-warm-600 dark:text-warm-400">
                Включая взносы {fmt(comparison.usn.insurance)} ₽/мес
              </div>
            )}
          </div>
        </div>

        {/* Segmented burden bars */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-5 md:p-6">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
            Структура нагрузки
          </h3>
          <SegmentedBar
            label="НПД"
            taxAmount={comparison.npdBurden}
            insuranceAmount={0}
            maxTotal={maxBurden}
            taxColor="#10B981"
            insuranceColor="#10B981"
            isWinner={comparison.winner === 'npd'}
          />
          <SegmentedBar
            label="ИП УСН 6%"
            taxAmount={comparison.usn.tax}
            insuranceAmount={comparison.usn.insurance}
            maxTotal={maxBurden}
            taxColor="#F59E0B"
            insuranceColor="#F59E0B"
            isWinner={comparison.winner === 'usn'}
          />
          <div className="flex gap-3 mt-2 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-2 rounded-sm inline-block" style={{ background: '#10B981' }} />
              налог
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-2 rounded-sm inline-block" style={{ background: '#F59E0B' }} />
              налог
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-2 rounded-sm inline-block opacity-60" style={{ background: '#F59E0B', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.2) 2px, rgba(255,255,255,0.2) 4px)' }} />
              взносы
            </span>
          </div>
        </div>

        {/* Intersection point */}
        {comparison.intersectionIncome !== null && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-5 md:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Точка пересечения режимов
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  При доходе <strong className="text-gray-900 dark:text-white">{fmt(comparison.intersectionIncome)} ₽/мес</strong> нагрузка НПД и УСН сравнивается
                </p>
                {useDeduction && (
                  <p className="text-xs text-accent-500 dark:text-accent-400 mt-1">
                    после вычета; на старте порог сдвигается выше
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

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
    </div>
  );
}
