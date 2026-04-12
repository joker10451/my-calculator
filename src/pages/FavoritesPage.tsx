import { Link } from 'react-router-dom';
import { Heart, Trash2, Calculator } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { categories } from '@/lib/data';
import CalculatorLayout from '@/components/CalculatorLayout';
import { SEO } from '@/components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

function buildCalculatorLookup(): Map<string, { name: string; href: string; icon: React.ElementType; categoryId: string; categoryName: string }> {
  const map = new Map<string, { name: string; href: string; icon: React.ElementType; categoryId: string; categoryName: string }>();
  categories.forEach(cat => {
    cat.calculators.forEach(calc => {
      const slug = calc.href.split('/').filter(Boolean).pop() ?? calc.href;
      map.set(slug, { name: calc.name, href: calc.href, icon: cat.icon, categoryId: cat.id, categoryName: cat.name });
    });
  });
  return map;
}

const CALCULATOR_LOOKUP = buildCalculatorLookup();

export default function FavoritesPage() {
  const { favorites, removeFavorite, clearFavorites } = useFavorites();
  const [confirmClear, setConfirmClear] = useState(false);

  const favoriteItems = favorites
    .map(id => ({ id, ...CALCULATOR_LOOKUP.get(id) }))
    .filter((item): item is typeof item & { name: string } => item.name !== undefined);

  return (
    <CalculatorLayout
      title="Избранное"
      description="Ваши сохранённые калькуляторы для быстрого доступа"
    >
      <SEO title="Избранное" description="Ваши сохранённые калькуляторы" noindex />
      <h1 className="sr-only">Избранные калькуляторы — Считай.RU</h1>

      <div className="max-w-4xl mx-auto">
        {favoriteItems.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {favoriteItems.length} {favoriteItems.length === 1 ? 'калькулятор' : favoriteItems.length < 5 ? 'калькулятора' : 'калькуляторов'}
            </p>
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600">Удалить все?</span>
                <button
                  onClick={() => { clearFavorites(); setConfirmClear(false); }}
                  className="text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  Да
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-700"
                >
                  Нет
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="text-sm text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Очистить
              </button>
            )}
          </div>
        )}

        {favoriteItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Тут пока пусто</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Жми <Heart className="w-4 h-4 inline text-red-500" /> на калькуляторе — он появится здесь
            </p>
            <Link
              to="/all"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Calculator className="w-5 h-5" />
              Смотреть все калькуляторы
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {favoriteItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group surface-card surface-card-hover p-4 flex items-center gap-4"
                  >
                    <Link to={item.href} className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-11 h-11 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-200 group-hover:text-primary transition-colors truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">{item.categoryName}</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => removeFavorite(item.id)}
                      className="p-2 text-slate-500 hover:text-red-500 transition-colors flex-shrink-0"
                      title="Удалить из избранного"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </CalculatorLayout>
  );
}
