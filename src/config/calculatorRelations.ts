/**
 * Карта связей между калькуляторами для внутренней перелинковки
 * Ключ — slug калькулятора, значение — массив связанных slug'ов
 */
export interface CalculatorInfo {
  slug: string;
  name: string;
  href: string;
  icon: string;
  description: string;
}

export const CALCULATOR_INFO: Record<string, CalculatorInfo> = {
  mortgage: {
    slug: 'mortgage',
    name: 'Ипотечный калькулятор',
    href: '/calculator/mortgage/',
    icon: '🏠',
    description: 'Ежемесячный платёж, переплата, график погашения'
  },
  credit: {
    slug: 'credit',
    name: 'Кредитный калькулятор',
    href: '/calculator/credit/',
    icon: '💳',
    description: 'Потребительский кредит с досрочным погашением'
  },
  refinancing: {
    slug: 'refinancing',
    name: 'Рефинансирование',
    href: '/calculator/refinancing/',
    icon: '🔄',
    description: 'Выгода от рефинансирования кредита'
  },
  'maternity-capital': {
    slug: 'maternity-capital',
    name: 'Материнский капитал',
    href: '/calculator/maternity-capital/',
    icon: '👶',
    description: 'Использование маткапитала для погашения ипотеки'
  },
  overpayment: {
    slug: 'overpayment',
    name: 'Калькулятор переплаты',
    href: '/calculator/overpayment/',
    icon: '📊',
    description: 'Полная стоимость кредита и переплата'
  },
  'tax-deduction': {
    slug: 'tax-deduction',
    name: 'Налоговый вычет',
    href: '/calculator/tax-deduction/',
    icon: '💰',
    description: 'Возврат НДФЛ при покупке жилья'
  },
  salary: {
    slug: 'salary',
    name: 'Зарплата на руки',
    href: '/calculator/salary/',
    icon: '💼',
    description: 'НДФЛ и страховые взносы'
  },
  'self-employed': {
    slug: 'self-employed',
    name: 'Самозанятый',
    href: '/calculator/self-employed/',
    icon: '🧑‍💻',
    description: 'Налог для самозанятых (НПД)'
  },
  'sick-leave': {
    slug: 'sick-leave',
    name: 'Больничный лист',
    href: '/calculator/sick-leave/',
    icon: '🏥',
    description: 'Расчёт пособия по временной нетрудоспособности'
  },
  vacation: {
    slug: 'vacation',
    name: 'Отпускные',
    href: '/calculator/vacation/',
    icon: '🏖️',
    description: 'Расчёт отпускных выплат'
  },
  pension: {
    slug: 'pension',
    name: 'Пенсионный',
    href: '/calculator/pension/',
    icon: '👴',
    description: 'Накопительная пенсия и ИПК'
  },
  'court-fee': {
    slug: 'court-fee',
    name: 'Госпошлина в суд',
    href: '/calculator/court-fee/',
    icon: '⚖️',
    description: 'Судебная госпошлина: СОЮ и арбитраж'
  },
  alimony: {
    slug: 'alimony',
    name: 'Алименты',
    href: '/calculator/alimony/',
    icon: '👨‍👧',
    description: 'Расчёт алиментов по соглашению и решению суда'
  },
  deposit: {
    slug: 'deposit',
    name: 'Депозит',
    href: '/calculator/deposit/',
    icon: '🏦',
    description: 'Доходность банковского вклада'
  },
  'deposit-tax': {
    slug: 'deposit-tax',
    name: 'Налог на вклады',
    href: '/calculator/deposit-tax/',
    icon: '📋',
    description: 'НДФЛ с процентов по вкладам'
  },
  investment: {
    slug: 'investment',
    name: 'Инвестиции',
    href: '/calculator/investment/',
    icon: '📈',
    description: 'Доходность инвестиционного портфеля'
  },
  osago: {
    slug: 'osago',
    name: 'ОСАГО',
    href: '/calculator/osago/',
    icon: '📜',
    description: 'Стоимость полиса ОСАГО'
  },
  kasko: {
    slug: 'kasko',
    name: 'КАСКО',
    href: '/calculator/kasko/',
    icon: '🛡️',
    description: 'Расчёт стоимости КАСКО'
  },
  utilities: {
    slug: 'utilities',
    name: 'ЖКХ',
    href: '/calculator/utilities/',
    icon: '🏘️',
    description: 'Коммунальные платежи: вода, свет, отопление'
  },
  fuel: {
    slug: 'fuel',
    name: 'Расход топлива',
    href: '/calculator/fuel/',
    icon: '⛽',
    description: 'Стоимость поездки на автомобиле'
  },
  water: {
    slug: 'water',
    name: 'Расход воды',
    href: '/calculator/water/',
    icon: '💧',
    description: 'Потребление воды по счётчику'
  },
  bmi: {
    slug: 'bmi',
    name: 'ИМТ',
    href: '/calculator/bmi/',
    icon: '⚖️',
    description: 'Индекс массы тела'
  },
};

// Карта связей: slug → список связанных slug'ов
export const CALCULATOR_RELATIONS: Record<string, string[]> = {
  mortgage: ['credit', 'refinancing', 'maternity-capital', 'overpayment', 'tax-deduction'],
  credit: ['mortgage', 'refinancing', 'overpayment', 'salary'],
  refinancing: ['credit', 'mortgage', 'overpayment'],
  'maternity-capital': ['mortgage', 'tax-deduction'],
  overpayment: ['credit', 'mortgage', 'refinancing'],
  'tax-deduction': ['mortgage', 'salary', 'maternity-capital'],
  salary: ['self-employed', 'sick-leave', 'vacation', 'pension', 'tax-deduction'],
  'self-employed': ['salary', 'pension', 'deposit-tax'],
  'sick-leave': ['salary', 'vacation'],
  vacation: ['salary', 'sick-leave'],
  pension: ['salary', 'self-employed', 'investment'],
  'court-fee': ['alimony'],
  alimony: ['court-fee', 'salary'],
  deposit: ['deposit-tax', 'investment', 'credit'],
  'deposit-tax': ['deposit', 'salary'],
  investment: ['deposit', 'pension'],
  osago: ['kasko', 'fuel'],
  kasko: ['osago', 'fuel'],
  utilities: ['water'],
  fuel: ['osago', 'kasko'],
  water: ['utilities'],
  bmi: [],
};

/**
 * Возвращает список связанных калькуляторов (максимум 4)
 */
export function getRelatedCalculators(slug: string): CalculatorInfo[] {
  const related = CALCULATOR_RELATIONS[slug] || [];
  return related
    .slice(0, 4)
    .map(s => CALCULATOR_INFO[s])
    .filter(Boolean);
}
