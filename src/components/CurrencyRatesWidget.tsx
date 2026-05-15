import { useState, useEffect } from 'react';
import { fetchCBRRates, type CBRData } from '@/services/cbrRates';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const FLAGS: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  CNY: '🇨🇳',
  GBP: '🇬🇧',
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

  return (
    <section className="border-y border-border/50 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3 overflow-x-auto gap-4 text-sm">
          {/* Курсы */}
          <div className="flex items-center gap-5 flex-shrink-0">
            {data.rates.slice(0, 4).map(rate => (
              <div key={rate.charCode} className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-xs">{FLAGS[rate.charCode] ?? '💱'}</span>
                <span className="font-medium text-foreground">{rate.charCode}</span>
                <span className="font-bold text-foreground tabular-nums">{rate.value.toFixed(2)}</span>
                <span className={`text-xs font-medium ${rate.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {rate.change >= 0 ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
                </span>
              </div>
            ))}
          </div>

          {/* Ключевая ставка + действия */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-xs text-muted-foreground">Ставка ЦБ</span>
              <span className="font-bold text-amber-500">{data.keyRate}%</span>
            </div>
            <button
              onClick={handleRefresh}
              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Обновить курсы"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link to="/calculator/currency" className="text-xs text-primary hover:underline whitespace-nowrap">
              Конвертер
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
