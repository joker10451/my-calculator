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
    commission: 0, // Укажите вашу комиссию в рублях
    description: 'Партнерская ссылка #1'
  },
  
  // Пример: Сбербанк
  'sberbank': {
    url: 'https://www.sberbank.ru',
    bankId: 'sberbank',
    description: 'Общая ссылка на Сбербанк'
  },
  'sberbank-mortgage': {
    url: 'https://www.sberbank.ru/ru/person/credits/home/buying_complete_house?utm_source=schitay&utm_medium=referral&utm_campaign=mortgage',
    bankId: 'sberbank',
    productType: 'mortgage',
    commission: 3000,
    description: 'Ипотека Сбербанк'
  },
  'sberbank-deposit': {
    url: 'https://www.sberbank.ru/ru/person/contributions?utm_source=schitay&utm_medium=referral&utm_campaign=deposit',
    bankId: 'sberbank',
    productType: 'deposit',
    commission: 500,
    description: 'Вклады Сбербанк'
  },
  
  // Пример: ВТБ
  'vtb': {
    url: 'https://www.vtb.ru',
    bankId: 'vtb',
    description: 'Общая ссылка на ВТБ'
  },
  'vtb-mortgage': {
    url: 'https://www.vtb.ru/personal/ipoteka/?utm_source=schitay&utm_medium=referral&utm_campaign=mortgage',
    bankId: 'vtb',
    productType: 'mortgage',
    commission: 2500,
    description: 'Ипотека ВТБ'
  },
  'vtb-credit-card': {
    url: 'https://trk.ppdu.ru/click/q3zhF1ow?erid=2SDnjeGCc2T',
    bankId: 'vtb',
    productType: 'credit',
    erid: '2SDnjeGCc2T',
    description: 'Кредитная карта ВТБ'
  },
  
  // ПСБ - Дебетовая карта "Зарплатные привилегии"
  'psb-debit-cashback': {
    url: 'https://trk.ppdu.ru/click/4wXDM0Um?erid=2SDnjehD1C8',
    bankId: 'psb',
    productType: 'debit',
    commission: 1633,
    description: 'Дебетовая карта "Зарплатные привилегии" ПСБ'
  },
  
  // Т-Банк - Дебетовая карта ALL Airlines
  'tbank-all-airlines-debit': {
    url: 'https://trk.ppdu.ru/click/AxwkY87N?erid=2SDnjeBaaR6',
    bankId: 'tbank',
    productType: 'debit',
    erid: '2SDnjeBaaR6',
    description: 'Дебетовая карта ALL Airlines Т-Банк с промокодом LETIM2025'
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
