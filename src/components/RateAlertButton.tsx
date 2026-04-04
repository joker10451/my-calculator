import { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle } from 'lucide-react';
import { subscribeToPush, unsubscribeFromPush, getPushStatus, showRateChangeNotification } from '@/utils/pushNotifications';

export function RateAlertButton() {
  const [status, setStatus] = useState<'unsupported' | 'denied' | 'subscribed' | 'prompt'>('prompt');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPushStatus().then(({ supported, permission, subscribed }) => {
      if (!supported) setStatus('unsupported');
      else if (permission === 'denied') setStatus('denied');
      else if (subscribed) setStatus('subscribed');
      else setStatus('prompt');
    });
  }, []);

  const handleClick = async () => {
    if (status === 'subscribed') {
      setLoading(true);
      const success = await unsubscribeFromPush();
      if (success) setStatus('prompt');
      setLoading(false);
      return;
    }

    setLoading(true);
    const subscription = await subscribeToPush();
    if (subscription) {
      setStatus('subscribed');
      // Show demo notification
      showRateChangeNotification('Сбербанк', 22.5, 20.0);
    }
    setLoading(false);
  };

  if (status === 'unsupported') return null;

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
        status === 'subscribed'
          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
          : status === 'denied'
          ? 'bg-red-100 text-red-700'
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      }`}
    >
      {status === 'subscribed' ? (
        <>
          <CheckCircle className="w-4 h-4" />
          Уведомления вкл.
        </>
      ) : loading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Подписка...
        </>
      ) : status === 'denied' ? (
        <>
          <BellOff className="w-4 h-4" />
          Уведомления заблокированы
        </>
      ) : (
        <>
          <Bell className="w-4 h-4" />
          Подписаться на ставки
        </>
      )}
    </button>
  );
}
