import { useState } from 'react';
import { Bell, CheckCircle2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'rate_alert_email';

/**
 * Компонент захвата email — "Получить уведомление при снижении ставки"
 * Показывается после расчёта ипотеки/кредита/вклада
 */
export function RateAlertSignup({ calculatorType = 'mortgage' }: { calculatorType?: string }) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(() => {
    try { return !!localStorage.getItem(STORAGE_KEY); } catch { return false; }
  });
  const [isLoading, setIsLoading] = useState(false);

  const messages: Record<string, { title: string; subtitle: string }> = {
    mortgage: {
      title: 'Ставки по ипотеке снижаются',
      subtitle: 'Получите уведомление когда ставка упадёт ниже 14% — это может сэкономить сотни тысяч',
    },
    credit: {
      title: 'Следите за ставками по кредитам',
      subtitle: 'Узнайте первым когда банки снизят ставки — рефинансируйте выгодно',
    },
    deposit: {
      title: 'Не пропустите лучшую ставку по вкладам',
      subtitle: 'Получите уведомление когда ставки вырастут — положите деньги на максимум',
    },
  };

  const msg = messages[calculatorType] || messages.mortgage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsLoading(true);

    // Сохраняем локально (в будущем — отправка на бэкенд)
    try {
      localStorage.setItem(STORAGE_KEY, email);
      localStorage.setItem('rate_alert_type', calculatorType);
    } catch { /* localStorage unavailable */ }

    // Имитация отправки
    await new Promise(resolve => setTimeout(resolve, 800));

    setIsSubmitted(true);
    setIsLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.04] p-5">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-400">Подписка оформлена</p>
            <p className="text-xs text-muted-foreground mt-0.5">Мы сообщим когда ставки изменятся в вашу пользу</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Bell className="w-4.5 h-4.5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{msg.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{msg.subtitle}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="email"
            placeholder="Ваш email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full h-10 pl-10 pr-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 outline-none"
          />
        </div>
        <Button type="submit" size="sm" className="h-10 px-4 rounded-xl" disabled={isLoading}>
          {isLoading ? '...' : 'Подписаться'}
        </Button>
      </form>
      <p className="text-[10px] text-muted-foreground mt-2">Без спама. Только изменения ставок. Отписка в один клик.</p>
    </div>
  );
}
