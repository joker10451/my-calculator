import { Link } from 'react-router-dom';
import { getRelatedCalculators } from '@/config/calculatorRelations';

interface RelatedCalculatorsProps {
  currentSlug: string;
}

export function RelatedCalculators({ currentSlug }: RelatedCalculatorsProps) {
  const related = getRelatedCalculators(currentSlug);

  if (related.length === 0) return null;

  return (
    <nav aria-label="Связанные калькуляторы" className="mt-10 md:mt-12">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
        Связанные калькуляторы
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {related.map((calc) => (
          <Link
            key={calc.slug}
            to={calc.href}
            className="flex flex-col gap-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 hover:border-primary/50 hover:bg-primary/5 group"
          >
            <span className="text-2xl">{calc.icon}</span>
            <span className="text-sm font-medium text-slate-800 dark:text-slate-100 group-hover:text-primary leading-tight">
              {calc.name}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
              {calc.description}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
