import { useState, useMemo } from 'react';
import CalculatorLayout from '@/components/CalculatorLayout';
import { getCPIData, calculateInflationImpact } from '@/services/rosstatCPI';
import { TrendingDown, TrendingUp, AlertTriangle, Info } from 'lucide-react';

export default function InflationCalculatorPage() {
  const cpi = getCPIData();
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(cpi.currentYoY);
  const [years, setYears] = useState(5);

  const result = useMemo(
    () => calculateInflationImpact(amount, rate, years),
    [amount, rate, years]
  );

  const fmt = (v: number) => v.toLocaleString('ru-RU', { maximumFractionDigits: 0 });

  return (
    <CalculatorLayout
      title="Калькулятор инфляции — сколько будут стоить ваши деньги"
      description="Узнайте, как инфляция обесценивает сбережения. Расчёт покупательной способности на основе данных Росстата"
    >
      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="surface-card p-6 space-y-6">
              <div>
                <label className="text-sm font-bold text-slate-300 mb-2 block">Сумма, ₽</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value) || 0)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-slate-300">Инфляция, % годовых</label>
                  <span className="text-xs text-slate-500">Росстат: {cpi.currentYoY}% ({cpi.lastUpdate})</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={25}
                  step={0.1}
                  value={rate}
                  onChange={e => setRate(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1%</span>
                  <span className="font-bold text-primary">{rate}%</span>
                  <span>25%</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-slate-300">Срок, лет</label>
                  <span className="text-sm font-bold text-primary">{years}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={years}
                  onChange={e => setYears(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1</span>
                  <span>30</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(cpi.yearlyAvg).slice(-5).map(([year, avg]) => (
                  <button
                    key={year}
                    onClick={() => setRate(avg)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      Math.abs(rate - avg) < 0.1
                        ? 'border-primary bg-primary/10 text-primary font-bold'
                        : 'border-slate-700 text-slate-400 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {year}: {avg}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="surface-card p-6 border-l-4 border-l-red-500">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-5 h-5 text-red-400" />
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Потеряете из-за инфляции</span>
              </div>
              <div className="text-3xl font-black text-red-400">{fmt(result.loss)} ₽</div>
              <div className="text-sm text-slate-500 mt-1">Это {result.lossPercent.toFixed(1)}% покупательной способности</div>
            </div>

            <div className="surface-card p-6">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Разбор</div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Сегодня</span>
                  <span className="text-sm font-bold text-slate-200">{fmt(amount)} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Через {years} лет (номинал)</span>
                  <span className="text-sm font-bold text-slate-200">{fmt(result.futureValue)} ₽</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-3">
                  <span className="text-sm text-slate-400">Реальная стоимость</span>
                  <span className="text-sm font-black text-red-400">{fmt(result.realValue)} ₽</span>
                </div>
              </div>
            </div>

            <div className="surface-card p-5 bg-amber-500/5 border border-amber-500/10">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-400 mb-1">Что это значит?</p>
                  <p className="text-xs text-slate-400">
                    Через {years} лет на {fmt(amount)} ₽ вы сможете купить товаров столько же,
                    сколько сейчас на {fmt(result.realValue)} ₽. Остальное «съест» инфляция.
                  </p>
                </div>
              </div>
            </div>

            <div className="surface-card p-5 bg-emerald-500/5 border border-emerald-500/10">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-emerald-400 mb-1">Как защититься?</p>
                  <p className="text-xs text-slate-400">
                    Вклад под {rate + 2}% годовых перекроет инфляцию {rate}% и принесёт реальный доход ~2% годовых.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 surface-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-200">Данные Росстата за последние 12 месяцев</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase">
                  <th className="text-left py-2 pr-4">Месяц</th>
                  <th className="text-right py-2 px-4">ИПЦ</th>
                  <th className="text-right py-2 px-4">За месяц</th>
                  <th className="text-right py-2 pl-4">За год</th>
                </tr>
              </thead>
              <tbody>
                {cpi.monthly.map((entry, i) => (
                  <tr key={i} className="border-t border-slate-800">
                    <td className="py-2 pr-4 text-slate-300">{entry.month} {entry.year}</td>
                    <td className="py-2 px-4 text-right text-slate-400">{entry.index.toFixed(2)}</td>
                    <td className="py-2 px-4 text-right">
                      <span className={entry.rate >= 0.5 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                        +{entry.rate.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-2 pl-4 text-right">
                      <span className={entry.rateYoY >= 8 ? 'text-red-400 font-bold' : 'text-amber-400'}>
                        {entry.rateYoY.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
