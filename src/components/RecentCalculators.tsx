import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Calculator } from 'lucide-react';
import { useCalculatorHistory } from '@/hooks/useCalculatorHistory';
import { categories } from '@/lib/data';


const CALCULATOR_MAP = new Map<string, { name: string; href: string; icon: React.ElementType }>();
categories.forEach(cat => {
  cat.calculators.forEach(calc => {
    const slug = calc.href.replace('/calculator/', '').replace('/insurance/', '').replace('/courier-', '').replace('/joy-', '').replace('/calculator/', '');
    CALCULATOR_MAP.set(slug, { name: calc.name, href: calc.href, icon: cat.icon });
  });
  CALCULATOR_MAP.set(cat.id, { name: cat.calculators[0]?.name ?? cat.name, href: cat.calculators[0]?.href ?? cat.href, icon: cat.icon });
});

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} дн назад`;
  return new Date(timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

const POPULAR_FALLBACK = [
  { name: 'Ипотечный калькулятор', href: '/calculator/mortgage' },
  { name: 'Зарплата на руки', href: '/calculator/salary' },
  { name: 'Кредитный калькулятор', href: '/calculator/credit' },
];

export default function RecentCalculators() {
  const { history } = useCalculatorHistory();
  const recent = history.slice(0, 6);

  if (recent.length === 0) {
    return (
      <section className="py-12 md:py-16 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-slate-400" />
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100">Недавние расчёты</h2>
          </div>
          <p className="text-slate-400 mb-6">Тут появятся твои последние расчёты. Начни с чего-нибудь:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {POPULAR_FALLBACK.map(calc => (
              <Link
                key={calc.href}
                to={calc.href}
                className="group surface-card surface-card-hover p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calculator className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-sm font-semibold text-slate-200 group-hover:text-primary transition-colors">
                  {calc.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const uniqueByType = recent.filter(
    (item, idx, arr) => arr.findIndex(i => i.calculatorType === item.calculatorType) === idx
  ).slice(0, 6);

  return (
    <section className="py-12 md:py-16 bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100">Недавние расчёты</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {uniqueByType.map((item, idx) => {
            const meta = CALCULATOR_MAP.get(item.calculatorType);
            const Icon = meta?.icon ?? Calculator;
            const href = meta?.href ?? `/calculator/${item.calculatorType}`;
            const name = meta?.name ?? item.calculatorName;

            return (
              <div
                key={item.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <Link
                  to={href}
                  className="group surface-card surface-card-hover p-4 flex items-center gap-4"
                >
                  <div className="w-11 h-11 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-primary transition-colors truncate">
                      {name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatRelativeTime(item.timestamp)}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors flex-shrink-0" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
