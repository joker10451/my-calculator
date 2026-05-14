import { useState, useEffect, useRef } from 'react';
import { DollarSign, Play, Pause, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'earnings_counter_salary';

function formatRub(value: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

/**
 * Виджет "Сколько вы зарабатываете прямо сейчас"
 * Тикающий счётчик на основе зарплаты пользователя
 */
export function EarningsCounter() {
  const [monthlySalary, setMonthlySalary] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? Number(saved) : 0;
    } catch { return 0; }
  });
  const [isRunning, setIsRunning] = useState(true);
  const [earned, setEarned] = useState(0);
  const [showSettings, setShowSettings] = useState(monthlySalary === 0);
  const [inputValue, setInputValue] = useState(monthlySalary > 0 ? String(monthlySalary) : '');
  const startTimeRef = useRef(Date.now());
  const frameRef = useRef<number>(0);

  // Зарплата в секунду (22 рабочих дня × 8 часов)
  const perSecond = monthlySalary / (22 * 8 * 3600);

  useEffect(() => {
    if (!isRunning || monthlySalary === 0) return;

    const tick = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setEarned(elapsed * perSecond);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isRunning, monthlySalary, perSecond]);

  const handleSave = () => {
    const val = Number(inputValue);
    if (val > 0) {
      setMonthlySalary(val);
      localStorage.setItem(STORAGE_KEY, String(val));
      setShowSettings(false);
      startTimeRef.current = Date.now();
      setEarned(0);
      setIsRunning(true);
    }
  };

  const togglePause = () => {
    if (!isRunning) {
      startTimeRef.current = Date.now() - (earned / perSecond) * 1000;
    }
    setIsRunning(!isRunning);
  };

  if (showSettings || monthlySalary === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-green-400" />
          <span className="text-sm font-bold text-foreground">Сколько вы зарабатываете прямо сейчас?</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Введите зарплату на руки — увидите тикающий счётчик заработка в реальном времени</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Зарплата/мес, ₽"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 outline-none"
          />
          <Button size="sm" onClick={handleSave}>Запустить</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.03] p-5 relative overflow-hidden">
      {/* Фоновая анимация */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/[0.02] to-transparent animate-pulse pointer-events-none" />
      
      <div className="relative flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Заработано сейчас</span>
          </div>
          <p className="text-3xl md:text-4xl font-black text-green-400 tabular-nums">
            {formatRub(earned)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {formatRub(perSecond * 3600)}/час · {formatRub(monthlySalary)}/мес
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={togglePause}
            className="p-2 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors"
            aria-label={isRunning ? 'Пауза' : 'Продолжить'}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Настройки"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
