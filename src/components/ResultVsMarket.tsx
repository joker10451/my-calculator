import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ResultVsMarketProps {
  userValue: number;
  marketAverage: number;
  label: string;
  unit?: string;
  lowerIsBetter?: boolean;
  formatValue?: (v: number) => string;
}

/**
 * Компонент "Ваш результат vs рынок"
 * Показывает как результат пользователя соотносится со средним по рынку
 */
export function ResultVsMarket({
  userValue,
  marketAverage,
  label,
  unit = '',
  lowerIsBetter = true,
  formatValue,
}: ResultVsMarketProps) {
  const diff = userValue - marketAverage;
  const diffPercent = marketAverage > 0 ? Math.abs(diff / marketAverage) * 100 : 0;
  
  const format = formatValue || ((v: number) => v.toLocaleString('ru-RU') + (unit ? ` ${unit}` : ''));

  const isGood = lowerIsBetter ? diff <= 0 : diff >= 0;
  const isNeutral = diffPercent < 3;

  let statusColor: string;
  let StatusIcon: typeof TrendingUp;
  let statusText: string;

  if (isNeutral) {
    statusColor = 'text-slate-400';
    StatusIcon = Minus;
    statusText = 'На уровне рынка';
  } else if (isGood) {
    statusColor = 'text-green-400';
    StatusIcon = lowerIsBetter ? TrendingDown : TrendingUp;
    statusText = lowerIsBetter ? `На ${diffPercent.toFixed(0)}% ниже рынка` : `На ${diffPercent.toFixed(0)}% выше рынка`;
  } else {
    statusColor = 'text-red-400';
    StatusIcon = lowerIsBetter ? TrendingUp : TrendingDown;
    statusText = lowerIsBetter ? `На ${diffPercent.toFixed(0)}% выше рынка` : `На ${diffPercent.toFixed(0)}% ниже рынка`;
  }

  // Позиция маркера на шкале (0-100%)
  const scaleMin = Math.min(userValue, marketAverage) * 0.7;
  const scaleMax = Math.max(userValue, marketAverage) * 1.3;
  const userPos = ((userValue - scaleMin) / (scaleMax - scaleMin)) * 100;
  const marketPos = ((marketAverage - scaleMin) / (scaleMax - scaleMin)) * 100;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className={`flex items-center gap-1 text-xs font-bold ${statusColor}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{statusText}</span>
        </div>
      </div>

      {/* Шкала */}
      <div className="relative h-3 rounded-full bg-muted mb-3">
        {/* Маркер рынка */}
        <div
          className="absolute top-0 h-full w-0.5 bg-slate-500"
          style={{ left: `${Math.min(Math.max(marketPos, 2), 98)}%` }}
        />
        {/* Маркер пользователя */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-background shadow-md ${isNeutral ? 'bg-slate-400' : isGood ? 'bg-green-400' : 'bg-red-400'}`}
          style={{ left: `calc(${Math.min(Math.max(userPos, 2), 98)}% - 8px)` }}
        />
      </div>

      {/* Значения */}
      <div className="flex items-center justify-between text-xs">
        <div>
          <span className="text-muted-foreground">Ваш: </span>
          <span className="font-bold text-foreground">{format(userValue)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Средний: </span>
          <span className="font-bold text-muted-foreground">{format(marketAverage)}</span>
        </div>
      </div>
    </div>
  );
}
