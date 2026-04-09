/**
 * Программные SEO-страницы
 * Генерирует страницы для long-tail запросов
 */

export interface BankOffer {
  bankName: string;
  bankSlug: string;
  logoUrl: string;
  mortgageRate: number;
  depositRate: number;
  creditRate: number;
  maxMortgage: number;
  minDownPayment: number;
  features: string[];
  description: string;
  rating: number;
  referralLink: string;
}

export interface SEOTemplate {
  title: string;
  description: string;
  keywords: string;
  h1: string;
  intro: string;
  faq: Array<{ question: string; answer: string }>;
}

const BANKS: BankOffer[] = [
  {
    bankName: 'Сбербанк',
    bankSlug: 'sberbank',
    logoUrl: '/logos/sberbank.svg',
    mortgageRate: 22.5,
    depositRate: 19.5,
    creditRate: 22.9,
    maxMortgage: 30000000,
    minDownPayment: 15,
    features: ['Онлайн-заявка', 'Досрочное погашение', 'Материнский капитал', 'Военная ипотека'],
    description: 'Крупнейший банк России с разветвлённой сетью отделений и онлайн-сервисами.',
    rating: 4.2,
    referralLink: '',
  },
  {
    bankName: 'ВТБ',
    bankSlug: 'vtb',
    logoUrl: '/logos/vtb.svg',
    mortgageRate: 22.9,
    depositRate: 20.0,
    creditRate: 23.5,
    maxMortgage: 25000000,
    minDownPayment: 15,
    features: ['Ипотека без первоначального взноса', 'Семейная ипотека', 'Онлайн-заявка'],
    description: 'Второй по величине банк России с выгодными программами ипотеки.',
    rating: 4.0,
    referralLink: '',
  },
  {
    bankName: 'Альфа-Банк',
    bankSlug: 'alfa-bank',
    logoUrl: '/logos/alfa-bank.svg',
    mortgageRate: 23.5,
    depositRate: 21.0,
    creditRate: 24.5,
    maxMortgage: 20000000,
    minDownPayment: 10,
    features: ['Быстрое одобрение', 'Онлайн-заявка', 'Без справок о доходах'],
    description: 'Крупнейший частный банк России с быстрым одобрением заявок.',
    rating: 4.3,
    referralLink: '',
  },
  {
    bankName: 'Т-Банк',
    bankSlug: 't-bank',
    logoUrl: '/logos/t-bank.svg',
    mortgageRate: 24.1,
    depositRate: 20.5,
    creditRate: 25.0,
    maxMortgage: 15000000,
    minDownPayment: 10,
    features: ['Полностью онлайн', 'Без визита в офис', 'Кэшбэк на покупки'],
    description: 'Цифровой банк без отделений — всё оформляется онлайн.',
    rating: 4.5,
    referralLink: '',
  },
  {
    bankName: 'Газпромбанк',
    bankSlug: 'gazprombank',
    logoUrl: '/logos/gazprombank.svg',
    mortgageRate: 22.7,
    depositRate: 19.0,
    creditRate: 23.0,
    maxMortgage: 25000000,
    minDownPayment: 10,
    features: ['Семейная ипотека', 'IT-ипотека', 'Военная ипотека'],
    description: 'Универсальный банк с льготными программами ипотеки.',
    rating: 4.1,
    referralLink: '',
  },
];

const MFO_OFFERS = [
  {
    name: 'JoyMoney',
    slug: 'joymoney',
    maxAmount: 30000,
    rate: 0.8,
    firstFree: true,
    approvalTime: '5 минут',
    features: ['Первый займ 0%', 'Без отказа', 'На карту за 5 минут'],
    description: 'Сервис онлайн займов с первым займом под 0%.',
    rating: 4.1,
    referralLink: 'https://trk.ppdu.ru/click/ZaiOEayY?erid=Kra23k98b',
  },
];

/**
 * Генерирует SEO-шаблон для страницы банка
 */
export function generateBankSEOTemplate(bank: BankOffer, year: number = 2026): SEOTemplate {
  return {
    title: `Ипотека ${bank.bankName} ${year} — ставки, условия, калькулятор`,
    description: `Ипотека в ${bank.bankName} от ${bank.mortgageRate}% в ${year} году. Максимальная сумма ${formatMoney(bank.maxMortgage)} ₽. Первоначальный взнос от ${bank.minDownPayment}%. Рассчитайте платёж онлайн.`,
    keywords: `ипотека ${bank.bankName.toLowerCase()} ${year}, ипотека ${bank.bankName.toLowerCase()} ставки, ${bank.bankName.toLowerCase()} ипотечный калькулятор, ипотека ${bank.bankName.toLowerCase()} условия`,
    h1: `Ипотека ${bank.bankName} в ${year} году`,
    intro: `${bank.bankName} предлагает ипотечные программы со ставкой от ${bank.mortgageRate}% годовых. Максимальная сумма кредита — ${formatMoney(bank.maxMortgage)} ₽, первоначальный взнос от ${bank.minDownPayment}%. ${bank.description}`,
    faq: [
      {
        question: `Какая ставка по ипотеке в ${bank.bankName} в ${year} году?`,
        answer: `Ставка по ипотеке в ${bank.bankName} начинается от ${bank.mortgageRate}% годовых. Финальная ставка зависит от суммы первоначального взноса, срока кредита и наличия льготной программы.`,
      },
      {
        question: `Какой минимальный первоначальный взнос в ${bank.bankName}?`,
        answer: `Минимальный первоначальный взнос в ${bank.bankName} составляет ${bank.minDownPayment}% от стоимости жилья. При большем взносе ставка может быть снижена.`,
      },
      {
        question: `Какая максимальная сумма ипотеки в ${bank.bankName}?`,
        answer: `Максимальная сумма ипотечного кредита в ${bank.bankName} — ${formatMoney(bank.maxMortgage)} ₽. Для регионов Москвы и Санкт-Петербурга лимит может быть выше.`,
      },
      {
        question: `Можно ли оформить ипотеку ${bank.bankName} онлайн?`,
        answer: bank.features.includes('Онлайн-заявка')
          ? `Да, ${bank.bankName} позволяет подать заявку на ипотеку онлайн через сайт или мобильное приложение.`
          : `Для оформления ипотеки в ${bank.bankName} необходимо посетить отделение банка. Предварительную заявку можно подать онлайн.`,
      },
      {
        question: `Есть ли в ${bank.bankName} семейная ипотека?`,
        answer: bank.features.includes('Семейная ипотека')
          ? `Да, ${bank.bankName} предлагает семейную ипотеку со сниженной ставкой для семей с детьми.`
          : `Уточните наличие семейной ипотеки в ${bank.bankName} — условия могут меняться.`,
      },
    ],
  };
}

/**
 * Генерирует SEO-шаблон для страницы МФО
 */
export function generateMFOSEOTemplate(mfo: typeof MFO_OFFERS[0], year: number = 2026): SEOTemplate {
  return {
    title: `Займ ${mfo.name} ${year} — онлайн займ без отказа до ${formatMoney(mfo.maxAmount)} ₽`,
    description: `${mfo.name} — займ онлайн за ${mfo.approvalTime}. ${mfo.firstFree ? 'Первый займ 0%!' : ''} До ${formatMoney(mfo.maxAmount)} ₽ на карту. Без отказа, без справок.`,
    keywords: `займ ${mfo.name.toLowerCase()} ${year}, ${mfo.name.toLowerCase()} займ онлайн, займ без отказа ${mfo.name.toLowerCase()}, ${mfo.name.toLowerCase()} первый займ 0%`,
    h1: `Займ в ${mfo.name} в ${year} году — до ${formatMoney(mfo.maxAmount)} ₽ на карту`,
    intro: `${mfo.name} — ${mfo.description} ${mfo.firstFree ? 'Первый займ выдаётся под 0% — вы не платите проценты при своевременном погашении.' : ''} Максимальная сумма — ${formatMoney(mfo.maxAmount)} ₽, одобрение за ${mfo.approvalTime}.`,
    faq: [
      {
        question: `Как получить займ в ${mfo.name}?`,
        answer: `Заполните заявку на сайте ${mfo.name}, укажите паспортные данные и номер карты. Решение принимается автоматически за ${mfo.approvalTime}.`,
      },
      {
        question: `Какие требования к заёмщику в ${mfo.name}?`,
        answer: `Гражданство РФ, возраст от 18 лет, паспорт РФ и банковская карта. Справки о доходах не требуются.`,
      },
      {
        question: `Можно ли получить займ в ${mfo.name} с плохой кредитной историей?`,
        answer: `Да, ${mfo.name} одобряет займы даже при наличии просрочек в других МФО. Решение принимается автоматически.`,
      },
    ],
  };
}

function formatMoney(amount: number): string {
  return amount.toLocaleString('ru-RU');
}

export { BANKS, MFO_OFFERS };
