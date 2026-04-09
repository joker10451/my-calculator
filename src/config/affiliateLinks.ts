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
  updatedAt?: string; // дата последней актуализации условий
  eligibility?: string[]; // ключевые требования/кому подходит
  restrictions?: string[]; // важные ограничения
  payoutTerms?: string; // краткие условия/срок выплаты
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
    updatedAt: '2026-04-08',
    eligibility: ['Подходит для подбора ипотечных программ', 'Онлайн-оформление'],
    payoutTerms: 'Условия зависят от выбранного партнёра',
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
    updatedAt: '2026-04-08',
    eligibility: ['Для клиентов 18+', 'Требуется подтверждение банком'],
    payoutTerms: 'Решение и выдача по правилам банка-партнёра',
    priority: 95,
  },
  
  // ПСБ - Дебетовая карта "Зарплатные привилегии"
  'psb-debit-cashback': {
    url: 'https://trk.ppdu.ru/click/dvGuYeFM?erid=2SDnje44eET&siteId=15645',
    bankId: 'psb',
    productType: 'debit',
    erid: '2SDnje44eET',
    commission: 1633,
    description: 'ПСБ «Твой кешбэк»: бесплатная дебетовая карта + сертификат Пятёрочка 1 000 ₽ по условиям акции',
    title: 'ПСБ — дебетовая карта «Твой кешбэк»',
    category: 'debit',
    badges: ['25% кешбэк', 'Сертификат 1 000 ₽', 'Бесплатно'],
    updatedAt: '2026-04-08',
    eligibility: ['18+', 'Резиденты РФ', 'Новые клиенты ПСБ по условиям акции'],
    restrictions: ['Сертификат при выполнении условий акции', 'Ограничения по MCC и СБП'],
    payoutTerms: 'ЦД: выдача карты + транзакция по условиям оффера',
    priority: 94,
  },
  'psb-debit-cashback-legacy': {
    url: 'https://trk.ppdu.ru/click/4wXDM0Um?erid=2SDnjehD1C8',
    bankId: 'psb',
    productType: 'debit',
    erid: '2SDnjehD1C8',
    commission: 1633,
    description: 'ПСБ: дебетовая карта с кешбэком (предыдущий оффер)',
    title: 'ПСБ — дебетовая карта (архивный оффер)',
    category: 'debit',
    badges: ['Кешбэк', 'Legacy'],
    updatedAt: '2026-04-08',
    eligibility: ['18+', 'Резиденты РФ'],
    payoutTerms: 'Архивный оффер, условия уточняются в карточке партнёра',
    priority: 83,
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
    updatedAt: '2026-04-08',
    eligibility: ['18+', 'Онлайн-заявка'],
    payoutTerms: 'Условия начисления бонусов по правилам партнёра',
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
    updatedAt: '2026-04-08',
    eligibility: ['Подходит для долгосрочных накоплений', 'Взнос от 100 000 ₽'],
    restrictions: ['Срок программы от 5 лет'],
    payoutTerms: 'Выплата в конце срока договора',
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
    updatedAt: '2026-04-08',
    eligibility: ['Возраст и условия зависят от города', 'Android/iOS с актуальной версией'],
    restrictions: ['Оплачиваются только целевые действия по правилам оффера'],
    payoutTerms: 'ЦД: трудоустройство + активность по условиям партнёра',
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
    updatedAt: '2026-04-08',
    eligibility: ['Паспорт РФ', 'Совершеннолетние клиенты'],
    restrictions: ['Условия одобрения определяются партнером'],
    payoutTerms: 'Срок и сумма зависят от анкеты клиента',
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
