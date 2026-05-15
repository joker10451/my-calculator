import { useState, useEffect } from 'react';
import { TrendingDown, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'rate_notification_dismissed';
const CURRENT_KEY_RATE = 15;
const PREVIOUS_KEY_RATE = 16;

/**
 * In-app уведомление о снижении ключевой ставки
 * Показывается один раз при заходе, если ставка изменилась
 */
export function RateChangeNotification() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Показываем только если ставка изменилась и пользователь ещё не видел
    if (CURRENT_KEY_RATE === PREVIOUS_KEY_RATE) return;

    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (dismissed === `${CURRENT_KEY_RATE}`) return;
      
      // Показываем через 3 секунды после загрузки
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    } catch { /* ignore */ }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    try { localStorage.setItem(STORAGE_KEY, `${CURRENT_KEY_RATE}`); } catch { /* ignore */ }
  };

  if (!visible) return null;

  const direction = CURRENT_KEY_RATE < PREVIOUS_KEY_RATE ? 'снизилась' : 'выросла';

  return (
    <div className="fixed top-20 right-4 z-40 max-w-sm animate-fade-in">
      <div className="rounded-2xl border border-green-500/20 bg-background shadow-2xl shadow-green-500/10 p-4 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3 pr-6">
          <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-4.5 h-4.5 text-green-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              Ключевая ставка {direction}!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ЦБ: {PREVIOUS_KEY_RATE}% → {CURRENT_KEY_RATE}%. Проверьте — может быть выгодно рефинансировать кредит.
            </p>
            <Link
              to="/calculator/refinancing"
              onClick={handleDismiss}
              className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-green-400 hover:text-green-300 transition-colors"
            >
              Проверить выгоду
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
