import { useMemo } from 'react';
import { useCalculatorHistory } from '@/hooks/useCalculatorHistory';
import { Shield, TrendingUp, Target, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Финансовый скор — геймификация на основе использования калькуляторов
 * Мотивирует пользователя проверить все аспекты финансов
 */

interface ScoreCategory {
  id: string;
  name: string;
  icon: typeof Shield;
  calculators: string[];
  maxPoints: number;
}

const CATEGORIES: ScoreCategory[] = [
  { id: 'housing', name: 'Жильё', icon: Shield, calculators: ['mortgage', 'refinancing', 'overpayment', 'utilities'], maxPoints: 25 },
  { id: 'income', name: 'Доход', icon: TrendingUp, calculators: ['salary', 'self-employed', 'pension', 'vacation', 'sick-leave'], maxPoints: 25 },
  { id: 'savings', name: 'Сбережения', icon: Target, calculators: ['deposit', 'investment', 'compound-interest', 'inflation'], maxPoints: 25 },
  { id: 'protection', name: 'Защита', icon: Shield, calculators: ['osago', 'kasko', 'alimony', 'court-fee', 'tax-deduction'], maxPoints: 25 },
];

export function FinancialHealthScore() {
  const { history } = useCalculatorHistory();

  const score = useMemo(() => {
    const usedTypes = new Set(history.map(h => h.calculatorType));
    let total = 0;

    const categoryScores = CATEGORIES.map(cat => {
      const used = cat.calculators.filter(c => usedTypes.has(c)).length;
      const points = Math.round((used / cat.calculators.length) * cat.maxPoints);
      total += points;
      return { ...cat, points, used, total: cat.calculators.length };
    });

    return { total, max: 100, categories: categoryScores };
  }, [history]);

  if (history.length === 0) return null;

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-400';
    if (s >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Отлично';
    if (s >= 60) return 'Хорошо';
    if (s >= 40) return 'Средне';
    return 'Начало';
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">Финансовое здоровье</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-2xl font-black ${getScoreColor(score.total)}`}>{score.total}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>

      {/* Прогресс-бар */}
      <div className="h-2.5 rounded-full bg-muted mb-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${score.total >= 80 ? 'bg-green-400' : score.total >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
          style={{ width: `${score.total}%` }}
        />
      </div>
      <p className={`text-xs font-medium mb-4 ${getScoreColor(score.total)}`}>{getScoreLabel(score.total)}</p>

      {/* Категории */}
      <div className="grid grid-cols-2 gap-2">
        {score.categories.map(cat => (
          <div key={cat.id} className="rounded-xl bg-muted/50 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <cat.icon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px] font-semibold text-foreground">{cat.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${(cat.points / cat.maxPoints) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground">{cat.used}/{cat.total}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Рекомендация */}
      {score.total < 80 && (
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Повысьте скор — проверьте:</p>
          <div className="flex flex-wrap gap-1.5">
            {score.categories
              .filter(c => c.points < c.maxPoints)
              .slice(0, 2)
              .flatMap(c => c.calculators.filter(calc => !history.some(h => h.calculatorType === calc)).slice(0, 1))
              .map(calc => (
                <Link
                  key={calc}
                  to={`/calculator/${calc}`}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                >
                  {calc}
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
