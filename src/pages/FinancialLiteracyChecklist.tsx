import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Trophy, ArrowRight, Sparkles, Target, TrendingUp, Shield, Wallet, PiggyBank, BookOpen, Star } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { SITE_URL } from '@/shared/constants';

interface ChecklistItem {
  id: string;
  text: string;
  detail: string;
  link?: string;
  linkText?: string;
}

interface Category {
  id: string;
  name: string;
  emoji: string;
  icon: typeof Wallet;
  color: string;
  items: ChecklistItem[];
}

const CATEGORIES: Category[] = [
  {
    id: 'basics',
    name: 'Базовые привычки',
    emoji: '🏠',
    icon: Wallet,
    color: 'text-blue-400',
    items: [
      { id: 'budget', text: 'Веди учёт доходов и расходов', detail: 'Без этого всё остальное не работает. Даже эксель сойдёт.', link: '/calculator/salary', linkText: 'Зарплата на руки' },
      { id: 'pillow', text: 'Собери подушку безопасности на 3–6 месяцев', detail: 'Это твои «не трогать» деньги. Без них любой кризис = кредитка.', link: '/calculator/deposit', linkText: 'Куда положить' },
      { id: 'rule503020', text: 'Попробуй правило 50/30/20', detail: '50% — нужды, 30% — хотелки, 20% — сбережения и долги.' },
      { id: 'subscriptions', text: 'Аудит подписок — отмени то, чем не пользуешься', detail: 'Стриминг, который не смотришь. Приложение, которое открыл раз.' },
      { id: 'cashback', text: 'Настрой кэшбэк и проценты на остаток', detail: 'Бесплатные деньги, если платить картой вместо наличных.' },
    ],
  },
  {
    id: 'taxes',
    name: 'Налоги и вычеты',
    emoji: '📋',
    icon: Shield,
    color: 'text-emerald-400',
    items: [
      { id: 'ndfl', text: 'Узнай свою ставку НДФЛ', detail: '13% — для большинства. 15% — с доходов свыше 5 млн ₽/год. 35% — с выигрышей.', link: '/how-much-you-lose', linkText: 'Сколько ты теряешь' },
      { id: 'property_deduction', text: 'Оформи вычет за покупку жилья', detail: 'До 260 000 ₽ можно вернуть. Это твои деньги, не подарок государства.', link: '/calculator/tax-deduction', linkText: 'Калькулятор вычета' },
      { id: 'medical_deduction', text: 'Верни НДФЛ за лечение и лекарства', detail: 'До 120 000 ₽ в год за себя + за родственников. Страховка тоже считается.', link: '/calculator/tax-deduction', linkText: 'Рассчитать' },
      { id: 'education_deduction', text: 'Оформи вычет за обучение', detail: 'За себя, детей и братьев/сёстер — до 120 000 ₽ в год.' },
      { id: 'invest_deduction', text: 'Используй ИИС для налогового вычета', detail: 'Вычет типа А: 13% от взноса до 400 000 ₽ = до 52 000 ₽/год назад.' },
    ],
  },
  {
    id: 'credit',
    name: 'Кредиты и ипотека',
    emoji: '🏦',
    icon: TrendingUp,
    color: 'text-amber-400',
    items: [
      { id: 'credit_rate', text: 'Сравни ставку по своему кредиту с рыночной', detail: 'Если у тебя 25%+ — пора рефинансировать.', link: '/calculator/refinancing', linkText: 'Калькулятор рефинансирования' },
      { id: 'overpayment', text: 'Узнай свою переплату по кредиту', detail: 'Спойлер: она больше, чем ты думаешь. Иногда в 2-3 раза больше суммы кредита.', link: '/calculator/overpayment', linkText: 'Калькулятор переплаты' },
      { id: 'early_payment', text: 'Планируй досрочное погашение', detail: 'Уменьшай срок, а не платёж — экономишь больше.' },
      { id: 'mortgage_subsidy', text: 'Проверь льготную ипотеку', detail: 'IT, семейная, дальневосточная — ставки от 5%. Может, ты подходишь.', link: '/calculator/mortgage', linkText: 'Ипотечный калькулятор' },
      { id: 'no_microloans', text: 'Никогда не бери микрозаймы', detail: 'Ставки до 365% годовых. Один заём = ловушка на месяцы.' },
    ],
  },
  {
    id: 'savings',
    name: 'Сбережения и инвестиции',
    emoji: '📈',
    icon: PiggyBank,
    color: 'text-violet-400',
    items: [
      { id: 'deposit', text: 'Положи свободные деньги на вклад', detail: 'При ставке 20%+ даже 100 000 ₽ принесут 20 000 ₽ за год.', link: '/calculator/deposit', linkText: 'Калькулятор вкладов' },
      { id: 'inflation', text: 'Пойми, как инфляция ест твои сбережения', detail: '100 000 ₽ под матрасом через год = 79 000 ₽ покупательной способности.', link: '/calculator/inflation', linkText: 'Калькулятор инфляции' },
      { id: 'bonds', text: 'Разбери ОФЗ и корпоративные облигации', detail: 'Надёжнее акций, доходнее вклада. Порог входа — от 1000 ₽.' },
      { id: 'diversify', text: 'Не храни все яйца в одной корзине', detail: 'Вклад + ОФЗ + немного акций = баланс риска и доходности.' },
      { id: 'compound', text: 'Познай магию сложного процента', detail: '10% годовых на 10 лет = не 100%, а 159%. Время — твой главный союзник.', link: '/calculator/investment', linkText: 'Инвестиционный калькулятор' },
    ],
  },
  {
    id: 'protection',
    name: 'Защита и страховки',
    emoji: '🛡️',
    icon: Shield,
    color: 'text-red-400',
    items: [
      { id: 'osago', text: 'Проверь стоимость ОСАГО', detail: 'Цены растут каждый год. Перепроверь — может, есть скидка за безаварийность.', link: '/calculator/osago', linkText: 'Калькулятор ОСАГО' },
      { id: 'life_insurance', text: 'Оцени необходимость страховки жизни', detail: 'Если есть иждивенцы и кредиты — нужна. Если нет — не обязательно.' },
      { id: 'property_insurance', text: 'Застрахуй крупное имущество', detail: 'Квартира, машина — то, что ты не сможешь заменить из текущих доходов.' },
      { id: 'digital_security', text: 'Защити деньги от мошенников', detail: 'Не называй CVV. Не переходи по ссылкам из СМС. Банки не просят коды.' },
    ],
  },
  {
    id: 'career',
    name: 'Карьера и доход',
    emoji: '💼',
    icon: Target,
    color: 'text-pink-400',
    items: [
      { id: 'market_value', text: 'Узнай свою рыночную стоимость', detail: 'Сравни зарплату с вакансиями. Если ты недоплачиваешь себе — пора обсуждать повышение.' },
      { id: 'side_income', text: 'Найди источник дополнительного дохода', detail: 'Фриланс, подработка, монетизация хобби. Даже 10 000 ₽/мес = 120 000 ₽/год.', link: '/courier-yandex', linkText: 'Курьер Яндекс' },
      { id: 'self_employed_tax', text: 'Разбери налоги самозанятого', detail: '4% с физлиц, 6% с юрлиц. Без отчётности, без деклараций.', link: '/calculator/self-employed', linkText: 'Калькулятор самозанятости' },
      { id: 'vacation_pay', text: 'Проверь расчёт отпускных', detail: 'Отпускные ≠ зарплата / 12 × месяц. Формула сложнее, и иногда ты получаешь меньше.', link: '/calculator/vacation', linkText: 'Калькулятор отпускных' },
    ],
  },
];

const STORAGE_KEY = 'finlit-checklist';

function loadChecked(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveChecked(data: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const TOTAL = CATEGORIES.reduce((s, c) => s + c.items.length, 0);

function getLevel(pct: number): { label: string; emoji: string; color: string } {
  if (pct === 100) return { label: 'Финансовый ниндзя', emoji: '🥷', color: 'text-yellow-400' };
  if (pct >= 75) return { label: 'Финансовый эксперт', emoji: '🏆', color: 'text-amber-400' };
  if (pct >= 50) return { label: 'Финансово грамотный', emoji: '💪', color: 'text-emerald-400' };
  if (pct >= 25) return { label: 'На верном пути', emoji: '🚶', color: 'text-blue-400' };
  return { label: 'Начинающий', emoji: '🌱', color: 'text-slate-400' };
}

export default function FinancialLiteracyChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>(loadChecked);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((checkedCount / TOTAL) * 100);
  const level = getLevel(pct);

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      saveChecked(next);
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Helmet>
        <title>Чек-лист финансовой грамотности 2026 — Пошаговый план | Считай.RU</title>
        <meta name="description" content="Интерактивный чек-лист финансовой грамотности: 28 пунктов по налогам, кредитам, сбережениям и защите. Отмечай прогресс и становись финансовым ниндзя." />
        <link rel="canonical" href={`${SITE_URL}/checklist`} />
        <meta property="og:title" content="Чек-лист финансовой грамотности 2026" />
        <meta property="og:description" content="28 шагов к финансовой свободе. Отмечай прогресс!" />
      </Helmet>

      <Header />

      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <BookOpen className="w-4 h-4" />
              Пошаговый план
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-100 mb-4 tracking-tight">
              Чек-лист финансовой <span className="text-violet-400">грамотности</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto">
              28 конкретных шагов, которые реально помогут тебе управлять деньгами. Отмечай, что уже делаешь.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-12">
            <div className="surface-card p-6 bg-gradient-to-br from-violet-500/5 to-blue-500/5 border border-violet-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{level.emoji}</span>
                  <div>
                    <div className={`text-lg font-black ${level.color}`}>{level.label}</div>
                    <div className="text-sm text-slate-500">{checkedCount} из {TOTAL} пунктов</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-slate-200">{pct}%</div>
                </div>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                  initial={false}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                />
              </div>
              {pct === 100 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center"
                >
                  <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-full text-sm font-bold">
                    <Trophy className="w-4 h-4" />
                    Ты прошёл все пункты! Мастер финансов! 🎉
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="max-w-2xl mx-auto space-y-8">
            {CATEGORIES.map(cat => {
              const catChecked = cat.items.filter(i => checked[i.id]).length;
              const catPct = Math.round((catChecked / cat.items.length) * 100);
              const Icon = cat.icon;

              return (
                <div key={cat.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl">{cat.emoji}</span>
                    <Icon className={`w-5 h-5 ${cat.color}`} />
                    <h2 className="text-lg font-bold text-slate-200">{cat.name}</h2>
                    <span className="ml-auto text-xs text-slate-500">{catChecked}/{cat.items.length}</span>
                    <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${catPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {cat.items.map(item => {
                      const isExpanded = expandedItem === item.id;

                      return (
                        <div
                          key={item.id}
                          className={`surface-card p-4 cursor-pointer transition-colors ${checked[item.id] ? 'bg-emerald-500/5 border-emerald-500/20' : 'hover:bg-slate-800/50'}`}
                          onClick={() => {
                            setExpandedItem(isExpanded ? null : item.id);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                toggle(item.id);
                              }}
                              className="mt-0.5 flex-shrink-0"
                              aria-label={checked[item.id] ? 'Снять отметку' : 'Отметить'}
                            >
                              {checked[item.id]
                                ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                : <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                              }
                            </button>
                            <div className="flex-1 min-w-0">
                              <span className={`text-sm font-bold ${checked[item.id] ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                                {item.text}
                              </span>
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <p className="text-sm text-slate-400 mt-2">{item.detail}</p>
                                    {item.link && (
                                      <Link
                                        to={item.link}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline mt-2"
                                      >
                                        {item.linkText}
                                        <ArrowRight className="w-3 h-3" />
                                      </Link>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="max-w-xl mx-auto mt-16 text-center">
            <div className="surface-card p-8 bg-gradient-to-br from-violet-500/5 to-blue-500/5 border border-violet-500/10">
              <Sparkles className="w-8 h-8 text-violet-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-200 mb-2">Пройди квиз</h3>
              <p className="text-sm text-slate-400 mb-4">Проверь свои знания в викторине по финансовой грамотности</p>
              <Link
                to="/quiz/financial-literacy"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors text-sm"
              >
                Начать квиз
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
