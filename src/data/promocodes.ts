/**
 * Каталог промокодов и акций.
 * Источник данных: партнёрские feed'ы + ручное добавление.
 * Скрипт парсинга: scripts/parse-promocodes.mjs (запускается по cron).
 *
 * Схема максимально простая и расширяемая:
 * - partner: бренд/магазин
 * - category: "bank" | "shop" | "service" | "education" | "health" | "auto" | "tech"
 * - discount: тип и размер скидки
 * - code: код купона (опц.) — для акций без кода поле пустое
 * - endDate: ISO, по истечении автоматически скрывается
 * - affiliateUrl: партнёрская ссылка (через нашу обвязку)
 * - priority: 1..10, для сортировки (выше = приоритетнее)
 */

export type PromoCategory =
  | "bank"
  | "shop"
  | "service"
  | "education"
  | "health"
  | "auto"
  | "tech"
  | "food"
  | "travel";

export type DiscountType = "percent" | "fixed" | "cashback" | "gift" | "freebie";

export interface PromoCode {
  id: string;
  partner: string;
  partnerLogo?: string; // опц., иконка/SVG
  category: PromoCategory;
  title: string;
  description: string;
  /** Размер скидки, отображается в карточке */
  discount: {
    type: DiscountType;
    value: string; // "15%", "500 ₽", "x2 кешбэк", "Подарок"
  };
  /** Код купона, если требуется ввод. Если пусто — акция автоматическая. */
  code?: string;
  /** Дата окончания акции (ISO 8601). */
  endDate: string;
  /** Партнёрская ссылка (может быть как внутренний /promocodes/:id, так и внешняя). */
  affiliateUrl: string;
  /** Прямая ссылка на сайт партнёра (без нашего utm). */
  partnerUrl?: string;
  /** Слаг условий: "first_loan", "new_card", "all_users" и т.п. */
  conditions?: string[];
  /** Приоритет сортировки, 1..10 */
  priority: number;
  /** Регион: null = вся РФ, иначе массив регионов */
  regions?: string[] | null;
  /** Для аффилиат-трекинга */
  partnerId: string;
  productType: string;
  /** Слаг для SEO-страницы /promocodes/:slug */
  slug: string;
  /** Тэги для поиска/фильтра */
  tags?: string[];
  /** Помечен как top (выводить в featured) */
  isFeatured?: boolean;
  /** Когда создан (для сортировки "новые") */
  createdAt: string;
}

// ────────────────────────── Стартовый набор ──────────────────────────
// В проде заменяется на результат работы parse-promocodes.mjs

export const PROMOCODES: PromoCode[] = [
  {
    id: "psb-cashback-5",
    slug: "psb-cashback-5-percent",
    partner: "PSB",
    partnerLogo: "/partners/psb.svg",
    category: "bank",
    title: "Кешбэк 5% по карте PSB",
    description:
      "Повышенный кешбэк 5% на все покупки первые 3 месяца. Бесплатное обслуживание при обороте от 15 000 ₽.",
    discount: { type: "cashback", value: "5%" },
    code: "SCHITAY5",
    endDate: "2026-03-31T23:59:59+03:00",
    affiliateUrl: "/promocodes/psb-cashback-5-percent",
    partnerUrl: "https://psbank.ru",
    conditions: ["new_card", "first_3_months"],
    priority: 9,
    regions: null,
    partnerId: "psb",
    productType: "cashback_card",
    tags: ["карта", "кешбэк", "PSB"],
    isFeatured: true,
    createdAt: "2026-01-15",
  },
  {
    id: "joymoney-zero",
    slug: "joymoney-pervyy-zaym-0-procentov",
    partner: "JoyMoney",
    partnerLogo: "/partners/joymoney.svg",
    category: "bank",
    title: "Первый займ 0% в JoyMoney",
    description:
      "Без процентов и переплат на первый займ до 10 000 ₽. Решение за 1 минуту, деньги на карту.",
    discount: { type: "percent", value: "0%" },
    code: "SCHITAY0",
    endDate: "2026-02-28T23:59:59+03:00",
    affiliateUrl: "/joy-money",
    partnerUrl: "https://joymoney.ru",
    conditions: ["first_loan", "new_client"],
    priority: 10,
    regions: null,
    partnerId: "joymoney",
    productType: "microloan",
    tags: ["займ", "МФО", "без процентов"],
    isFeatured: true,
    createdAt: "2026-01-12",
  },
  {
    id: "zetta-osago",
    slug: "zetta-osago-economy",
    partner: "Zetta",
    partnerLogo: "/partners/zetta.svg",
    category: "auto",
    title: "ОСАГО от 4 200 ₽ — скидка до 35%",
    description:
      "Сравните 14 страховых и оформите полис онлайн за 5 минут. Электронный полис сразу на email.",
    discount: { type: "percent", value: "−35%" },
    endDate: "2026-03-15T23:59:59+03:00",
    affiliateUrl: "/insurance/osgop-taxi",
    partnerUrl: "https://zetta.ru",
    conditions: ["all_users"],
    priority: 8,
    regions: null,
    partnerId: "zetta",
    productType: "osago",
    tags: ["ОСАГО", "страхование", "авто"],
    isFeatured: true,
    createdAt: "2026-01-18",
  },
  {
    id: "goldapple-gift",
    slug: "goldapple-podarki",
    partner: "Goldapple",
    partnerLogo: "/partners/goldapple.svg",
    category: "shop",
    title: "Промокод на 500 ₽ в Goldapple",
    description:
      "Скидка 500 ₽ при заказе от 2 500 ₽ на парфюмерию и косметику. Бесплатная доставка от 3 000 ₽.",
    discount: { type: "fixed", value: "500 ₽" },
    code: "SCHITAY500",
    endDate: "2026-02-20T23:59:59+03:00",
    affiliateUrl: "/goldapple",
    partnerUrl: "https://goldapple.ru",
    conditions: ["min_order_2500"],
    priority: 7,
    regions: null,
    partnerId: "goldapple",
    productType: "shop_promo",
    tags: ["косметика", "парфюмерия", "промокод"],
    isFeatured: false,
    createdAt: "2026-01-20",
  },
  {
    id: "tinkoff-invest",
    slug: "tinkoff-invest-0-commission",
    partner: "Tinkoff",
    partnerLogo: "/partners/tinkoff.svg",
    category: "bank",
    title: "Брокерский счёт без комиссий 30 дней",
    description:
      "Торгуйте на бирже без комиссий первые 30 дней. Плюс акция в подарок при открытии счёта.",
    discount: { type: "gift", value: "+ акция" },
    endDate: "2026-04-30T23:59:59+03:00",
    affiliateUrl: "/promocodes/tinkoff-invest-0-commission",
    partnerUrl: "https://tinkoff.ru",
    conditions: ["new_account"],
    priority: 6,
    regions: null,
    partnerId: "tinkoff",
    productType: "brokerage",
    tags: ["инвестиции", "брокер", "без комиссии"],
    isFeatured: false,
    createdAt: "2026-01-10",
  },
];

// ────────────────────────── Helpers ──────────────────────────

/** Возвращает только активные (не истёкшие) промокоды. */
export function getActivePromos(promos: PromoCode[] = PROMOCODES, now: Date = new Date()): PromoCode[] {
  return promos.filter((p) => new Date(p.endDate).getTime() > now.getTime());
}

/** Возвращает featured промокоды. */
export function getFeaturedPromos(promos: PromoCode[] = PROMOCODES): PromoCode[] {
  return getActivePromos(promos)
    .filter((p) => p.isFeatured)
    .sort((a, b) => b.priority - a.priority);
}

/** Сортировка по приоритету + свежести. */
export function sortPromos(promos: PromoCode[]): PromoCode[] {
  return [...promos].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/** Уникальные категории для фильтра. */
export function getPromoCategories(promos: PromoCode[] = PROMOCODES): PromoCategory[] {
  return [...new Set(promos.map((p) => p.category))] as PromoCategory[];
}

export const CATEGORY_LABELS: Record<PromoCategory, string> = {
  bank: "Банки и карты",
  shop: "Магазины",
  service: "Услуги",
  education: "Образование",
  health: "Здоровье",
  auto: "Авто",
  tech: "Техника",
  food: "Еда и доставка",
  travel: "Путешествия",
};
