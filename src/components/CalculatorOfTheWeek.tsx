import { Link } from 'react-router-dom';
import { Flame, ArrowRight, Trophy, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface WeeklyChallenge {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  challenge: string;
  calculatorName: string;
  calculatorHref: string;
  icon: React.ElementType;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  badge: string;
  fact: string;
}

const CHALLENGES: WeeklyChallenge[] = [
  {
    id: 'overpayment',
    weekNumber: 0,
    title: 'Сколько вы переплачиваете за кредит?',
    description: 'Большинство заёмщиков не знают реальную сумму переплаты. Узнайте, сколько вы отдадите банку сверх суммы кредита.',
    challenge: 'Введите сумму и срок вашего кредита — результат вас удивит',
    calculatorName: 'Калькулятор переплаты',
    calculatorHref: '/calculator/overpayment',
    icon: Flame,
    accentColor: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    badge: 'Финансовая грамотность',
    fact: 'Средняя переплата по кредиту в РФ составляет 40-60% от суммы',
  },
  {
    id: 'salary',
    weekNumber: 1,
    title: 'Сколько вы получаете на руки?',
    description: 'Зарплата «в конверте» и зарплата на руки — разные вещи. Узнайте свою реальную зарплату после всех вычетов.',
    challenge: 'Введите оклад — калькулятор покажет НДФЛ, пенсионные и сумму на руки',
    calculatorName: 'Калькулятор зарплаты',
    calculatorHref: '/calculator/salary',
    icon: Sparkles,
    accentColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    badge: 'Точный расчёт',
    fact: 'НДФЛ 13% + страховые взносы 30% — работодатель платит больше, чем вы думаете',
  },
  {
    id: 'mortgage-save',
    weekNumber: 2,
    title: 'Как сэкономить на ипотеке миллион?',
    description: 'Разница в 1% ставки — это сотни тысяч рублей переплаты. Узнайте, сколько можно сэкономить.',
    challenge: 'Сравните свою ставку с актуальными предложениями банков',
    calculatorName: 'Ипотечный калькулятор',
    calculatorHref: '/calculator/mortgage',
    icon: Trophy,
    accentColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    badge: 'Выгода',
    fact: 'Снижение ставки на 2% при ипотеке 5 млн экономит до 1.5 млн ₽',
  },
  {
    id: 'deposit-tax',
    weekNumber: 3,
    title: 'Налог на вклады — сколько заплатите?',
    description: 'С 2025 года доход по вкладам облагается НДФЛ. Узнайте, сколько налога вам начислят.',
    challenge: 'Введите сумму вклада и ставку — калькулятор покажет налог',
    calculatorName: 'Налог на вклады',
    calculatorHref: '/calculator/deposit-tax',
    icon: Flame,
    accentColor: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    badge: 'Новое в 2026',
    fact: 'Необлагаемый лимит зависит от максимальной ключевой ставки ЦБ за год',
  },
  {
    id: 'court-fee',
    weekNumber: 4,
    title: 'Сколько стоит подать в суд?',
    description: 'Госпошлина может оказаться больше, чем вы ожидаете. Рассчитайте точную сумму перед подачей иска.',
    challenge: 'Укажите тип иска и сумму — калькулятор покажет пошлину',
    calculatorName: 'Калькулятор госпошлины',
    calculatorHref: '/calculator/court-fee',
    icon: Sparkles,
    accentColor: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    badge: 'Юридический',
    fact: 'При цене иска до 100 000 ₽ госпошлина — 3% от суммы, но не менее 1 500 ₽',
  },
  {
    id: 'vacation',
    weekNumber: 5,
    title: 'Сколько вы получите за отпуск?',
    description: 'Отпускные считаются не по зарплате, а по среднему заработку. Проверьте, сколько вам начислят.',
    challenge: 'Введите зарплату и период — узнаете точную сумму отпускных',
    calculatorName: 'Калькулятор отпускных',
    calculatorHref: '/calculator/vacation',
    icon: Trophy,
    accentColor: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    badge: 'Сезонное',
    fact: 'Отпускные могут быть меньше обычной зарплаты из-за расчёта по среднему',
  },
  {
    id: 'bmi',
    weekNumber: 6,
    title: 'В норме ли ваш вес?',
    description: 'Индекс массы тела — простой способ оценить соотношение роста и веса. Проверьте за 10 секунд.',
    challenge: 'Введите рост и вес — получите ИМТ и рекомендацию',
    calculatorName: 'Калькулятор ИМТ',
    calculatorHref: '/calculator/bmi',
    icon: Flame,
    accentColor: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
    badge: 'Здоровье',
    fact: 'ИМТ 18.5–24.9 считается нормой по классификации ВОЗ',
  },
];

function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return Math.floor((days + start.getDay() + 1) / 7);
}

export default function CalculatorOfTheWeek() {
  const weekNum = getWeekNumber();
  const challenge = CHALLENGES[weekNum % CHALLENGES.length];
  const Icon = challenge.icon;

  return (
    <section className="py-12 md:py-16 bg-slate-950">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className={`relative overflow-hidden rounded-3xl border ${challenge.borderColor} bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8`}>
            <div className="absolute top-0 right-0 w-48 h-48 opacity-5">
              <Icon className="w-full h-full" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className={`px-3 py-1.5 rounded-full ${challenge.bgColor} ${challenge.accentColor} text-xs font-bold flex items-center gap-1.5`}>
                  <Flame className="w-3 h-3" />
                  Калькулятор недели
                </div>
                <span className={`px-3 py-1.5 rounded-full ${challenge.bgColor} ${challenge.accentColor} text-xs font-bold`}>
                  {challenge.badge}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-slate-100 mb-3">
                {challenge.title}
              </h2>

              <p className="text-slate-400 text-sm md:text-base mb-5 max-w-2xl">
                {challenge.description}
              </p>

              <div className={`p-4 rounded-2xl ${challenge.bgColor} border ${challenge.borderColor} mb-6`}>
                <p className={`font-semibold ${challenge.accentColor} text-sm mb-1`}>Челлендж</p>
                <p className="text-slate-200 text-sm md:text-base">{challenge.challenge}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link
                  to={challenge.calculatorHref}
                  className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all ${challenge.bgColor} ${challenge.accentColor} border ${challenge.borderColor} hover:scale-105`}
                >
                  <Icon className="w-5 h-5" />
                  {challenge.calculatorName}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-xs text-slate-500 max-w-xs">
                  Факт: {challenge.fact}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
