import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { storage } from '@/shared/utils/storage';
import { supabase } from '@/lib/database/supabase';
import { toast } from 'sonner';

interface CalculatorFeedbackProps {
  calculatorId: string;
}

export function CalculatorFeedback({ calculatorId }: CalculatorFeedbackProps) {
  const [voted, setVoted] = useState<'positive' | 'negative' | null>(() => {
    return storage.get<'positive' | 'negative' | null>(`calc_feedback_${calculatorId}`, null);
  });
  const [submitted, setSubmitted] = useState(voted !== null);

  const handleVote = async (type: 'positive' | 'negative') => {
    if (submitted) return;

    setVoted(type);
    setSubmitted(true);
    storage.set(`calc_feedback_${calculatorId}`, type);

    try {
      await supabase.from('calculator_feedback').insert({
        calculator_id: calculatorId,
        feedback_type: type,
      });
    } catch {
      // Graceful degradation — localStorage-only if Supabase unavailable
    }

    toast.success('Спасибо за отзыв!', {
      description: type === 'positive' ? 'Рады, что калькулятор полезен!' : 'Спасибо, учтём ваши замечания',
    });
  };

  if (submitted && voted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500 dark:text-slate-400"
      >
        <Check className="w-4 h-4 text-green-500" />
        <span>Спасибо за отзыв!</span>
        {voted === 'positive' && <ThumbsUp className="w-4 h-4 text-blue-500" />}
        {voted === 'negative' && <ThumbsDown className="w-4 h-4 text-slate-400" />}
      </motion.div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <span className="text-sm text-slate-500 dark:text-slate-400">Был ли полезен калькулятор?</span>
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleVote('positive')}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          title="Да, полезен"
        >
          <ThumbsUp className="w-5 h-5 text-slate-400 hover:text-green-600 dark:hover:text-green-400" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleVote('negative')}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-400 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Нет, не полезен"
        >
          <ThumbsDown className="w-5 h-5 text-slate-400 hover:text-red-600 dark:hover:text-red-400" />
        </motion.button>
      </div>
    </div>
  );
}
