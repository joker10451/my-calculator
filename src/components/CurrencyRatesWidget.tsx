import { useState, useEffect } from 'react';
import { fetchCBRRates, type CBRData } from '@/services/cbrRates';
import { TrendingUp, TrendingDown, Banknote, Percent, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const FLAGS: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  CNY: '🇨🇳',
  GBP: '🇬🇧',
  KZT: '🇰🇿',
  BYN: '🇧🇾',
  TRY: '🇹🇷',
  JPY: '🇯🇵',
};

export default function CurrencyRatesWidget() {
  const [data, setData] = useState<CBRData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchCBRRates().then(setData);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    localStorage.removeItem('cbr_rates');
    const fresh = await fetchCBRRates();
    setData(fresh);
    setIsRefreshing(false);
  };

  if (!data) return null;

  const formattedDate = new Date(data.date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <section className="py-6 md:py-8 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-y border-slate-800/50">
      <div className="container mx-auto px-4">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Banknote className="w-4.5 h-4.5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Финансы сегодня</h3>
              <p className="text-[11px] text-slate-500">{formattedDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
              aria-label="Обновить курсы"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/calculator/currency"
              className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Конвертер →
            </Link>
          </div>
        </div>

        {/* Курсы + ставка */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
          {data.rates.slice(0, 4).map((rate, idx) => (
            <div
              key={rate.charCode}
              className="relative overflow-hidden rounded-xl bg-slate-800/40 border border-slate-700/50 p-3 hover:border-slate-600/50 transition-all group"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">{FLAGS[rate.charCode] ?? '💱'}</span>
                <span className="text-[11px] font-bold text-slate-400">{rate.charCode}/RUB</span>
              </div>
              <div className="text-lg font-black text-slate-100 tabular-nums">
                {rate.value.toFixed(2)} ₽
              </div>
              <div className={`flex items-center gap-0.5 mt-1 text-[11px] font-bold ${rate.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {rate.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{rate.change >= 0 ? '+' : ''}{rate.change.toFixed(2)}</span>
                <span className="text-slate-500 ml-1">({rate.changePercent >= 0 ? '+' : ''}{rate.changePercent.toFixed(2)}%)</span>
              </div>
              {/* Подсветка при изменении */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${rate.change >= 0 ? 'bg-green-500/[0.03]' : 'bg-red-500/[0.03]'}`} />
            </div>
          ))}

          {/* Ключевая ставка */}
          <div className="relative overflow-hidden rounded-xl bg-amber-500/[0.06] border border-amber-500/20 p-3 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-1.5">
              <Percent className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-bold text-amber-400/80 uppercase tracking-wider">Ключевая</span>
            </div>
            <div className="text-2xl font-black text-amber-400 tabular-nums">
              {data.keyRate}%
            </div>
            <div className="text-[11px] text-amber-400/60 mt-1">
              ЦБ РФ
            </div>
          </div>
        </div>

        {/* Быстрые ссылки */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Link to="/calculator/mortgage" className="text-[11px] px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors">
            Ипотека при {data.keyRate}%
          </Link>
          <Link to="/calculator/deposit" className="text-[11px] px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors">
            Вклады до {(data.keyRate + 3).toFixed(0)}%
          </Link>
          <Link to="/key-rate" className="text-[11px] px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors">
            История ставки ЦБ
          </Link>
          <Link to="/calculator/currency" className="text-[11px] px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors">
            Конвертер валют
          </Link>
        </div>
      </div>
    </section>
  );
}
