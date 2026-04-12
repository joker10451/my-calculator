import { useState, useEffect } from 'react';
import { fetchCBRRates, type CBRData } from '@/services/cbrRates';
import { TrendingUp, TrendingDown, Banknote, Percent } from 'lucide-react';
import { motion } from 'framer-motion';

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

  useEffect(() => {
    fetchCBRRates().then(setData);
  }, []);

  if (!data) return null;

  return (
    <section className="py-8 md:py-10 bg-slate-950 border-t border-slate-800/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center gap-6"
        >
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">Курсы валют ЦБ РФ</h3>
              <p className="text-xs text-slate-500">
                {new Date(data.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 flex-1">
            {data.rates.slice(0, 4).map(rate => (
              <div key={rate.charCode} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/50">
                <span className="text-lg">{FLAGS[rate.charCode] ?? '💱'}</span>
                <span className="text-xs font-bold text-slate-400">{rate.charCode}</span>
                <span className="text-sm font-black text-slate-200">{rate.value.toFixed(2)}</span>
                <span className={`text-[10px] font-bold flex items-center gap-0.5 ${rate.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {rate.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {rate.change >= 0 ? '+' : ''}{rate.change.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10 flex-shrink-0">
            <Percent className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Ключевая ставка</div>
              <div className="text-lg font-black text-amber-400">{data.keyRate}%</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
