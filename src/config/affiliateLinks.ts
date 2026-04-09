/**
 * Конфигурация партнерских ссылок
 * Здесь хранятся все реферальные ссылки для банковских продуктов
 */

export interface AffiliateLink {
  url: string;
  bankId: string;
  productType?: string;
  commission?: number; // потенциальная комиссия в рублях
  description?: string;
  erid?: string; // идентификатор рекламы для соответствия требованиям
  title?: string; // заголовок для витрины
  category?: 'mortgage' | 'credit' | 'debit' | 'deposit' | 'loan' | 'insurance' | 'vacancies' | 'other';
  badges?: string[];
  priority?: number; // ручная сортировка: больше = выше
}

/**
 * Партнерские ссылки по банкам
 * Формат: 'bankId-productType' или 'bankId' для общей ссылки банка
 */
export const AFFILIATE_LINKS: Record<string, AffiliateLink> = {
  // Реальная партнерская ссылка (первая)
  'partner-promo-1': {
    url: 'https://trk.ppdu.ru/click/4wXDM0Um?erid=2SDnjehD1C8',
    bankId: 'partner', // Укажите ID банка
    productType: 'mortgage', // Укажите тип продукта: 'mortgage', 'deposit', 'credit'
    erid: '2SDnjehD1C8',
    commission: 0, // Укажите вашу комиссию в рублях
    description: 'Подбор ипотечных предложений от партнёров в одном месте',
    title: 'Подобрать ипотеку онлайн',
    category: 'mortgage',
    badges: ['Онлайн', 'Подбор предложений'],
    priority: 80,
  },
  
  'vtb-credit-card': {
    url: 'https://trk.ppdu.ru/click/q3zhF1ow?erid=2SDnjeGCc2T',
    bankId: 'vtb',
    productType: 'credit',
    erid: '2SDnjeGCc2T',
    description: 'Кредитная карта ВТБ',
    title: 'Кредитная карта ВТБ',
    category: 'credit',
    badges: ['Онлайн', 'Льготный период'],
    priority: 95,
  },
  
  // ПСБ - Дебетовая карта "Зарплатные привилегии"
  'psb-debit-cashback': {
    url: 'https://trk.ppdu.ru/click/4wXDM0Um?erid=2SDnjehD1C8',
    bankId: 'psb',
    productType: 'debit',
    commission: 1633,
    description: 'Дебетовая карта "Зарплатные привилегии" ПСБ',
    title: 'Дебетовая карта ПСБ с кэшбэком',
    category: 'debit',
    badges: ['Кэшбэк'],
    priority: 75,
  },
  
  // Т-Банк - Дебетовая карта ALL Airlines
  'tbank-all-airlines-debit': {
    url: 'https://trk.ppdu.ru/click/AxwkY87N?erid=2SDnjeBaaR6',
    bankId: 'tbank',
    productType: 'debit',
    erid: '2SDnjeBaaR6',
    description: 'Дебетовая карта ALL Airlines Т-Банк с промокодом LETIM2026',
    title: 'Т‑Банк ALL Airlines (дебетовая)',
    category: 'debit',
    badges: ['Мили', 'Промокод'],
    priority: 70,
  },

  // Ренессанс Жизнь (НСЖ)
  'renlife-guaranteed-income': {
    url: 'https://trk.ppdu.ru/click/Np9sj7AZ?erid=2SDnjcfxx7T',
    bankId: 'renlife',
    productType: 'insurance',
    erid: '2SDnjcfxx7T',
    description: 'НСЖ «Гарантированный доход» — от 19% в первый год, подходит для налоговых вычетов',
    title: 'Ренессанс Жизнь — Гарантированный доход (НСЖ)',
    category: 'insurance',
    badges: ['НСЖ', 'Налоговый вычет', 'От 100 000 ₽'],
    priority: 93,
  },

  // Pampadu offer (из кабинета)
  'pampadu-offer-31ba9c13': {
    url: 'https://trk.ppdu.ru/click/o6eCET0k?erid=CQH36pWzJqVGXC5oLP8WVVNCNqJmbhiUPijGiu4zpwPd7G',
    bankId: 'pampadu',
    productType: 'vacancies',
    erid: 'CQH36pWzJqVGXC5oLP8WVVNCNqJmbhiUPijGiu4zpwPd7G',
    description: 'Курьер в Яндекс.Еда/Яндекс.Лавка (РФ/РБ) — трудоустройство + активность',
    title: 'Курьер Яндекс.Еда/Яндекс.Лавка — оффер Pampadu',
    category: 'vacancies',
    badges: ['Вакансии', 'РФ/РБ', 'До 9 750 ₽'],
    priority: 92,
  },

  // JoyMoney
  'joymoney-loan': {
    url: 'https://trk.ppdu.ru/click/ZaiOEayY?erid=Kra23k98b',
    bankId: 'joymoney',
    productType: 'loan',
    erid: 'Kra23k98b',
    description: 'Займ JoyMoney: первый займ 0% до 30 000 ₽',
    title: 'JoyMoney — онлайн займ',
    category: 'loan',
    badges: ['Первый займ 0%', 'Онлайн'],
    priority: 89,
  },
  
  // Добавьте свои партнерские ссылки здесь
};

/**
 * Получить партнерскую ссылку для продукта
 */
export function getAffiliateLink(
  bankId: string,
  productType?: string,
  productId?: string
): string | null {
  // Пробуем найти специфичную ссылку для продукта
  if (productId && AFFILIATE_LINKS[productId]) {
    return AFFILIATE_LINKS[productId].url;
  }
  
  // Пробуем найти ссылку для типа продукта
  if (productType) {
    const key = `${bankId}-${productType}`;
    if (AFFILIATE_LINKS[key]) {
      return AFFILIATE_LINKS[key].url;
    }
  }
  
  // Возвращаем общую ссылку банка
  if (AFFILIATE_LINKS[bankId]) {
    return AFFILIATE_LINKS[bankId].url;
  }
  
  return null;
}

/**
 * Получить информацию о комиссии
 */
export function getCommissionInfo(
  bankId: string,
  productType?: string
): number | null {
  if (productType) {
    const key = `${bankId}-${productType}`;
    if (AFFILIATE_LINKS[key]) {
      return AFFILIATE_LINKS[key].commission || null;
    }
  }
  
  if (AFFILIATE_LINKS[bankId]) {
    return AFFILIATE_LINKS[bankId].commission || null;
  }
  
  return null;
}
