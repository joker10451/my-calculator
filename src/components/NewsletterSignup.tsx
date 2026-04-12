import { useState } from 'react';
import { Mail, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/database/supabase';
import { storage } from '@/shared/utils/storage';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface NewsletterSignupProps {
  source?: 'footer' | 'blog';
  className?: string;
}

export function NewsletterSignup({ source = 'footer', className = '' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(() =>
    storage.get<boolean>('newsletter_subscribed', false)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error('Введите корректный email');
      return;
    }

    setLoading(true);
    try {
      await supabase.from('newsletter_subscribers').insert({
        email: trimmed,
        source,
      });
    } catch {
      // Graceful degradation
    }

    storage.set('newsletter_subscribed', true);
    setSubscribed(true);
    setEmail('');
    toast.success('Вы подписаны на обновления!', {
      description: 'Новые статьи и калькуляторы — прямо в почту',
    });
    setLoading(false);
  };

  if (subscribed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex items-center gap-2 text-sm text-green-600 dark:text-green-400 ${className}`}
      >
        <Check className="w-4 h-4" />
        <span>Вы подписаны на обновления</span>
      </motion.div>
    );
  }

  if (source === 'blog') {
    return (
      <div className={`p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 ${className}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Подписывайтесь на обновления</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Новые статьи и калькуляторы — прямо в почту</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
          <input
            type="email"
            placeholder="Ваш email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-11 px-5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Подписаться'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={className}>
      <h4 className="font-semibold mb-3 text-slate-200">Подписка</h4>
      <p className="text-sm text-slate-400 mb-3">Новые статьи и калькуляторы — прямо в почту</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          placeholder="Ваш email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 min-w-0 h-9 px-3 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm outline-none focus:ring-1 focus:ring-blue-500/50"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-9 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Mail className="w-3.5 h-3.5" /> OK</>}
        </button>
      </form>
    </div>
  );
}
