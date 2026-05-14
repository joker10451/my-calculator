import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

interface DailyCalc {
  title: string;
  question: string;
  href: string;
  emoji: string;
  color: string;
}

const DAILY_CALCULATORS: DailyCalc[] = [
  { title: 'Ипотечный калькулятор', question: 'Сколько вы переплатите банку за 20 лет?', href: '/calculator/mortgage', emoji: '🏠', color: 'from-blue-500/10 to-blue-600/5' },
  { title: 'Калькулятор зарплаты', question: 'Знаете свою реальную зарплату после всех налогов?', href: '/calculator/salary', emoji: '💰', color: 'from-green-500/10 to-green-600/5' },
  { title: 'Калькулятор ЖКХ', question: 'Не переплачиваете ли вы за коммуналку?', href: '/calculator/utilities', emoji: '🏘️', color: 'from-amber-500/10 to-amber-600/5' },
  { title: 'Калькулятор вкладов', question: 'Сколько заработаете на депозите за год?', href: '/calculator/deposit', emoji: '🏦', color: 'from-purple-500/10 to-purple-600/5' },
  { title: 'Калькулятор ОСАГО', question: 'Проверьте — не переплачиваете ли за страховку?', href: '/calculator/osago', emoji: '🚗', color: 'from-red-500/10 to-red-600/5' },
  { title: 'Калькулятор алиментов', question: 'Знаете точную сумму по закону?', href: '/calculator/alimony', emoji: '👨‍👩‍👧', color: 'from-pink-500/10 to-pink-600/5' },
  { title: 'Калькулятор налогового вычета', question: 'Государство должно вам деньги — проверьте сколько', href: '/calculator/tax-deduction', emoji: '💸', color: 'from-emerald-500/10 to-emerald-600/5' },
  { title: 'Калькулятор рефинансирования', question: 'Можно ли снизить платёж по кредиту?', href: '/calculator/refinancing', emoji: '🔄', color: 'from-cyan-500/10 to-cyan-600/5' },
  { title: 'Калькулятор ИМТ', question: 'В норме ли ваш вес?', href: '/calculator/bmi', emoji: '⚖️', color: 'from-teal-500/10 to-teal-600/5' },
  { title: 'Калькулятор госпошлины', question: 'Сколько стоит подать в суд?', href: '/calculator/court-fee', emoji: '⚖️', color: 'from-indigo-500/10 to-indigo-600/5' },
  { title: 'Калькулятор топлива', question: 'Сколько реально стоит ваша поездка?', href: '/calculator/fuel', emoji: '⛽', color: 'from-orange-500/10 to-orange-600/5' },
  { title: 'Калькулятор самозанятого', question: 'ИП или самозанятость — где больше на руки?', href: '/calculator/self-employed', emoji: '🧾', color: 'from-violet-500/10 to-violet-600/5' },
  { title: 'Калькулятор инвестиций', question: 'Сколько накопите за 10 лет со сложным процентом?', href: '/calculator/investment', emoji: '📈', color: 'from-sky-500/10 to-sky-600/5' },
  { title: 'Материнский капитал', question: 'Знаете актуальный размер маткапитала?', href: '/calculator/maternity-capital', emoji: '👶', color: 'from-rose-500/10 to-rose-600/5' },
];

function getDailyCalc(): DailyCalc {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_CALCULATORS[dayOfYear % DAILY_CALCULATORS.length]!;
}

export function CalculatorOfTheDay() {
  const calc = getDailyCalc();

  return (
    <section className="py-8 md:py-10">
      <div className="container mx-auto px-4">
        <Link
          to={calc.href}
          className={`block max-w-3xl mx-auto rounded-2xl border border-border bg-gradient-to-r ${calc.color} p-6 md:p-8 hover:border-primary/30 transition-all group`}
        >
          <div className="flex items-start gap-4">
            <span className="text-4xl">{calc.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Калькулятор дня</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">{calc.question}</h3>
              <p className="text-sm text-muted-foreground">{calc.title} — бесплатный расчёт за 10 секунд</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
          </div>
        </Link>
      </div>
    </section>
  );
}
