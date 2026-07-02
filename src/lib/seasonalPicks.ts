/**
 * Сезонный подбор популярных калькуляторов.
 * Идея: в каждом сезоне свои «горячие» темы:
 *  - Январь–февраль: зарплата, налоговый вычет, бюджет
 *  - Март–май: ОСАГО/КАСКО (сезон), дача, шины
 *  - Июнь–август: отпускные, топливо, расходы на отдых
 *  - Сентябрь–октябрь: ипотека (новый сезон), школьные расходы
 *  - Ноябрь–декабрь: кредит (праздники), бюджет, подарки
 *
 * Региональные предпочтения (опционально):
 *  - Москва/СПб: чаще интересуются ипотекой, инвестициями
 *  - Регионы: чаще — зарплата, кредит, ЖКХ
 */

import { categories, type Category } from "./data";

export interface PopularPick {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name (динамически)
  color: string;
  bgColor: string;
  href: string;
  statsCount: string;
  /** Региональный вес: число, чем больше — тем выше приоритет в регионе */
  regionWeight?: Partial<Record<string, number>>;
  /** Месяцы, когда калькулятор актуален. Если пусто — актуален всегда. */
  months?: number[]; // 1-12
}

export const ALL_PICKS: PopularPick[] = [
  {
    id: "mortgage",
    name: "Калькулятор ипотеки",
    description: "Рассчитай ежемесячный платёж, переплату и график погашения",
    icon: "Home",
    color: "text-finance",
    bgColor: "bg-finance/10",
    href: "/calculator/mortgage",
    statsCount: "12 500",
    regionWeight: { Moscow: 1.4, "Saint Petersburg": 1.3, "Moscow Oblast": 1.3 },
    months: [1, 2, 3, 9, 10, 11],
  },
  {
    id: "salary",
    name: "Зарплата на руки",
    description: "НДФЛ 13%, пенсионные и страховые взносы",
    icon: "TrendingUp",
    color: "text-finance",
    bgColor: "bg-finance/10",
    href: "/calculator/salary",
    statsCount: "8 200",
  },
  {
    id: "court-fee",
    name: "Госпошлина в суд",
    description: "Расчёт госпошлины для судов общей юрисдикции и арбитража",
    icon: "Scale",
    color: "text-legal",
    bgColor: "bg-legal/10",
    href: "/calculator/court-fee",
    statsCount: "2 100",
  },
  {
    id: "utilities",
    name: "Расчёт ЖКХ",
    description: "Сколько платить за воду, свет и отопление",
    icon: "Droplets",
    color: "text-housing",
    bgColor: "bg-housing/10",
    href: "/calculator/utilities",
    statsCount: "4 300",
  },
  {
    id: "fuel",
    name: "Расход топлива",
    description: "Сколько стоит поездка на машине",
    icon: "Car",
    color: "text-auto",
    bgColor: "bg-auto/10",
    href: "/calculator/fuel",
    statsCount: "3 900",
    months: [4, 5, 6, 7, 8],
  },
  {
    id: "credit",
    name: "Кредитный калькулятор",
    description: "Потребительский кредит с досрочным погашением",
    icon: "Calculator",
    color: "text-finance",
    bgColor: "bg-finance/10",
    href: "/calculator/credit",
    statsCount: "6 100",
    months: [10, 11, 12, 1],
  },
  {
    id: "vacation",
    name: "Калькулятор отпускных",
    description: "Сколько вам должны на работе перед отпуском",
    icon: "Calendar",
    color: "text-finance",
    bgColor: "bg-finance/10",
    href: "/calculator/vacation",
    statsCount: "5 400",
    months: [5, 6, 7, 8, 12],
  },
  {
    id: "tax-deduction",
    name: "Налоговый вычет",
    description: "Верните до 15 600 ₽ за лечение, обучение, ипотеку",
    icon: "Receipt",
    color: "text-finance",
    bgColor: "bg-finance/10",
    href: "/calculator/tax-deduction",
    statsCount: "3 200",
    months: [1, 2, 3, 4],
  },
  {
    id: "osago",
    name: "Калькулятор ОСАГО",
    description: "Сравните тарифы 14 страховых за 1 минуту",
    icon: "Shield",
    color: "text-auto",
    bgColor: "bg-auto/10",
    href: "/calculator/osago",
    statsCount: "2 800",
    months: [3, 4, 9, 10],
  },
  {
    id: "deposit",
    name: "Калькулятор вкладов",
    description: "Сравните доходность по 14 банкам с учётом налога 2026",
    icon: "PiggyBank",
    color: "text-finance",
    bgColor: "bg-finance/10",
    href: "/calculator/deposit",
    statsCount: "4 100",
  },
  {
    id: "budget",
    name: "Бюджет 50/30/20",
    description: "Узнай, сколько тратить и откладывать",
    icon: "Wallet",
    color: "text-finance",
    bgColor: "bg-finance/10",
    href: "/calculator/budget",
    statsCount: "3 600",
    months: [9, 10, 1],
  },
  {
    id: "alimony",
    name: "Алименты",
    description: "Расчёт алиментов на ребёнка по новым правилам 2025",
    icon: "Users",
    color: "text-family",
    bgColor: "bg-family/10",
    href: "/calculator/alimony",
    statsCount: "1 800",
  },
];

/** Текущий месяц (1-12), тестируемо подменить через env. */
export function getCurrentMonth(): number {
  if (typeof window !== "undefined" && (window as unknown as { __forceMonth?: number }).__forceMonth) {
    return (window as unknown as { __forceMonth?: number }).__forceMonth as number;
  }
  return new Date().getMonth() + 1;
}

export interface GetPicksOptions {
  month?: number;
  region?: string;
  count?: number;
}

/**
 * Возвращает топ-N калькуляторов с учётом сезона и региона.
 * Базовый скоринг:
 *  +5 если месяц явно указан в months
 *  +regionWeight[region] если регион известен
 *  +стат. вес по логарифму statsCount
 */
export function getSeasonalPicks({
  month = getCurrentMonth(),
  region,
  count = 6,
}: GetPicksOptions = {}): PopularPick[] {
  const scored = ALL_PICKS.map((pick) => {
    let score = 0;

    // Сезонный бонус
    if (pick.months && pick.months.includes(month)) score += 5;
    // Иначе мягкий бонус, чтобы универсальные калькуляторы не пропадали
    if (!pick.months || pick.months.length === 0) score += 2;

    // Региональный бонус
    if (region && pick.regionWeight && pick.regionWeight[region]) {
      score += pick.regionWeight[region] as number;
    }

    // Бонус от "популярности" (логарифм, чтобы не задавить сезонность)
    const numStats = parseInt(pick.statsCount.replace(/\s/g, ""), 10) || 1000;
    score += Math.log10(numStats) * 0.5;

    return { pick, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((x) => x.pick);
}

export const SEASON_NAMES: Record<number, string> = {
  1: "Зима",
  2: "Зима",
  3: "Весна",
  4: "Весна",
  5: "Весна",
  6: "Лето",
  7: "Лето",
  8: "Лето",
  9: "Осень",
  10: "Осень",
  11: "Осень",
  12: "Зима",
};

// Гарантируем совместимость со старым импортом categories
export type { Category };
