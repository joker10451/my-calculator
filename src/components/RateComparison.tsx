import { useState, useMemo } from 'react';
import { Percent, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface RateComparisonProps {
  currentRate: number;
  newRate: number;
  loanAmount: number;
  termMonths: number;
  formatCurrency: (v: number) => string;
}

function calcAnnuityPayment(principal: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
}

function calcTotalInterest(principal: number, annualRate: number, months: number): number {
  const monthly = calcAnnuityPayment(principal, annualRate, months);
  return monthly * months - principal;
}

export function RateComparison({ currentRate, newRate, loanAmount, termMonths, formatCurrency }: RateComparisonProps) {
  const [show, setShow] = useState(false);

  const savings = useMemo(() => {
    if (currentRate <= newRate || currentRate <= 0) return null;
    const oldPayment = calcAnnuityPayment(loanAmount, currentRate, termMonths);
    const newPayment = calcAnnuityPayment(loanAmount, newRate, termMonths);
    const oldInterest = calcTotalInterest(loanAmount, currentRate, termMonths);
    const newInterest = calcTotalInterest(loanAmount, newRate, termMonths);

    return {
      monthlySavings: oldPayment - newPayment,
      totalSavings: oldInterest - newInterest,
      oldPayment,
      newPayment,
    };
  }, [currentRate, newRate, loanAmount, termMonths]);

  if (!savings) {
    return null;
  }

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 animate-fade-in">
      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold mb-3">
        <Percent className="w-5 h-5" />
        Сравнение с вашей ставкой ({currentRate}%)
      </div>

      {!show ? (
        <button
          onClick={() => setShow(true)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors"
        >
          Показать экономию →
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold">Экономия в месяц</p>
              <p className="text-xl font-black text-blue-700 dark:text-blue-300">{formatCurrency(savings.monthlySavings)}</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold">Экономия за весь срок</p>
              <p className="text-xl font-black text-blue-700 dark:text-blue-300">{formatCurrency(savings.totalSavings)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs text-blue-600 dark:text-blue-400 pt-2 border-t border-blue-200 dark:border-blue-700">
            <div>
              <span className="text-slate-500">Платёж при {currentRate}%: </span>
              <span className="font-semibold">{formatCurrency(savings.oldPayment)}</span>
            </div>
            <div>
              <span className="text-slate-500">Платёж при {newRate}%: </span>
              <span className="font-semibold">{formatCurrency(savings.newPayment)}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

interface RateComparisonInputProps {
  onCompare: (rate: number) => void;
}

export function RateComparisonInput({ onCompare }: RateComparisonInputProps) {
  const [value, setValue] = useState('');
  const [active, setActive] = useState(false);

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="w-full text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors flex items-center justify-center gap-1 py-2"
      >
        <TrendingDown className="w-4 h-4" />
        Сравнить с моей текущей ставкой
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        step="0.1"
        min="0.1"
        max="50"
        placeholder="Ваша ставка %"
        value={value}
        onChange={e => setValue(e.target.value)}
        className="flex-1 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-1 focus:ring-blue-500/50 text-slate-900 dark:text-slate-100"
      />
      <button
        onClick={() => {
          const rate = parseFloat(value);
          if (rate > 0 && rate <= 50) onCompare(rate);
        }}
        className="h-9 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
      >
        Сравнить
      </button>
    </div>
  );
}
