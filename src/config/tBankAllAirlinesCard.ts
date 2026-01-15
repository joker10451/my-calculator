/**
 * Конфигурация дебетовой карты Т-Банк ALL Airlines
 * Партнерская интеграция с соблюдением требований рекламного законодательства
 */

/**
 * Интерфейс данных дебетовой карты Т-Банк ALL Airlines
 */
export interface TBankAllAirlinesCardData {
  id: string;
  name: string;
  bankName: string;
  bankShortName: string;
  
  // Основные преимущества
  miles: {
    description: string;
    validity: string; // срок хранения миль
    conversion: string; // 1 Миля = 1 рубль
    minRedemption: number; // минимальная сумма для возврата
  };
  
  // Бонусы за покупки
  bonuses: {
    hotels: string;
    flights: string;
    airlines: string;
    everyday: string;
    special: string;
  };
  
  // Страховой полис
  insurance: {
    price: string;
    medicalCoverage: string;
    baggageCoverage: string;
    activities: string[];
    tariffLink: string;
  };
  
  // Условия обслуживания
  fees: {
    annual: number;
    cardTopUp: string;
    transfers: string;
    cashWithdrawal: string;
  };
  
  // Основные преимущества
  features: string[];
  
  // Партнерская информация (публичная)
  affiliate: {
    link?: string;
    erid?: string;
    promoCode?: string;
    cookieTTL: number; // дней
    holdPeriod: number; // дней
    maxProcessingTime: number; // дней
    conversionRate: number; // CR %
    approvalRate: number; // AR %
    epc: number; // EPC в рублях
    epl: number; // EPL в рублях
  };
  
  // Целевое действие
  targetAction: {
    description: string;
    minTransaction: number; // минимальная сумма транзакции
    funnel: string[];
  };
  
  // Целевая аудитория
  targetAudience: {
    description: string;
    gender: string;
    averageAge: number;
    ageGroup: string;
  };
  
  // География
  geo: {
    country: string;
    topRegions: string[];
  };
  
  // Акция
  promotion?: {
    name: string;
    description: string;
    duration: string;
    validUntil: string;
  };
  
  // Ограничения (для соблюдения правил)
  restrictions: {
    prohibitedPlatforms: string[];
    prohibitedTopics: string[];
    minusWords: string[];
    lostLeadsSearch: string;
  };
}

/**
 * Внутренняя конфигурация с комиссией
 * НЕ ЭКСПОРТИРУЕТСЯ - только для внутреннего использования
 */
interface TBankAllAirlinesCardInternalConfig extends TBankAllAirlinesCardData {
  affiliate: TBankAllAirlinesCardData['affiliate'] & {
    commissionIndividual: number; // комиссия для физ.лиц
    commissionBusiness: number; // комиссия для ЮЛ, СЗ, ИП
  };
}

/**
 * Внутренние данные карты с комиссией
 * Используется только внутри модуля
 */
const TBANK_ALL_AIRLINES_CARD_INTERNAL: TBankAllAirlinesCardInternalConfig = {
  id: 'tbank-all-airlines-debit',
  name: 'ALL Airlines',
  bankName: 'Акционерное общество «ТБанк»',
  bankShortName: 'Т-Банк',
  
  miles: {
    description: 'Авиабилеты любых авиакомпаний в обмен на мили',
    validity: '5 лет',
    conversion: '1 Миля = 1 рубль',
    minRedemption: 6000
  },
  
  bonuses: {
    hotels: 'До 10% Милями за бронирование отелей на tinkoff.ru/travel',
    flights: 'До 5% Милями за покупку авиабилетов на tinkoff.ru/travel',
    airlines: 'До 1,5% Милями за покупку авиабилетов на сайтах «Аэрофлот», S7, «Победа», Utair и «Уральские авиалинии»',
    everyday: 'До 1,5% Милями за повседневные покупки (супермаркеты, кафе и интернет-магазины)',
    special: 'До 30% Милями за покупки по спецпредложениям Банка'
  },
  
  insurance: {
    price: '0 ₽ ежегодно',
    medicalCoverage: 'До 50 000$ на лечение, медикаменты, транспортировку, звонки ассистансу',
    baggageCoverage: 'До 1 000$ при утрате багажа или его задержке на срок более 6 часов',
    activities: ['горные лыжи', 'сноуборд', 'футбол'],
    tariffLink: 'https://www.tinkoff.ru/cards/debit-cards/all-airlines/tariffs/'
  },
  
  fees: {
    annual: 0,
    cardTopUp: 'Бесплатное пополнение в банкоматах Т-Банка и партнеров',
    transfers: 'Бесплатные переводы на карты других банков через СБП',
    cashWithdrawal: 'Бесплатное снятие наличных в банкоматах Т-Банка'
  },
  
  features: [
    'Авиабилеты любых авиакомпаний в обмен на мили',
    'Страховка для визы и поездок по миру в подарок',
    'Бесплатное обслуживание в течение 12 месяцев',
    'До 10% милями за бронирование отелей',
    'До 5% милями за покупку авиабилетов',
    'Срок хранения миль - 5 лет',
    'Бесплатная доставка представителем банка'
  ],
  
  affiliate: {
    link: 'https://trk.ppdu.ru/click/AxwkY87N?erid=2SDnjeBaaR6',
    erid: '2SDnjeBaaR6',
    promoCode: 'LETIM2025',
    cookieTTL: 90,
    holdPeriod: 30,
    maxProcessingTime: 145,
    conversionRate: 5.44,
    approvalRate: 5.00,
    epc: 3.35,
    epl: 61.53,
    commissionIndividual: 1173, // для физ.лиц
    commissionBusiness: 1274 // для ЮЛ, СЗ, ИП
  },
  
  targetAction: {
    description: 'Активация карты и оплата покупки от 100₽ новым клиентом банка после встречи с представителем',
    minTransaction: 100,
    funnel: [
      'Заявка на сайте',
      'Предодобрение',
      'Одобрение',
      'Активация карты (после встречи с представителем)',
      'Утилизация (совершение первой транзакции)'
    ]
  },
  
  targetAudience: {
    description: 'Активные путешественники',
    gender: '48% мужчины, 52% женщины',
    averageAge: 33,
    ageGroup: '23-40 лет'
  },
  
  geo: {
    country: 'Россия, в том числе Республика Крым',
    topRegions: [
      'Москва и МО',
      'Санкт-Петербург',
      'Краснодарский край',
      'Свердловская область',
      'Республика Башкортостан',
      'Новосибирская область',
      'Республика Татарстан',
      'Иркутская область',
      'Республика Бурятия'
    ]
  },
  
  promotion: {
    name: 'Бесплатное обслуживание',
    description: 'Бесплатное обслуживание по карте в течение 12 месяцев после активации карты',
    duration: '12 месяцев',
    validUntil: '31.12.2026'
  },
  
  restrictions: {
    prohibitedPlatforms: [
      'Meta Platforms Inc. (запрещена на территории РФ)'
    ],
    prohibitedTopics: [
      'адалт тематики',
      'военные',
      'политика',
      'оружие',
      'насилие',
      'наркотики',
      'религия',
      'скаммерские каналы'
    ],
    minusWords: [
      'Тинькофф', 'тинькофф платинум', 'банг тенкофф', 'банк теньков', 'банк тенькоф',
      'банк тенькофф', 'банк тиньков', 'банк тинькова официальный', 'банк тинькоф',
      'банк тинькофф', 'банки тиньков', 'банки тинькофф'
    ],
    lostLeadsSearch: 'Поиск потерянных выдач осуществляется по заявкам, у которых с момента совершения целевого действия прошло не более 3 месяцев. Если были нарушены правила оффера или вид трафика не был согласован, то поиск потерянной выдачи не производится.'
  }
};

/**
 * Публичные данные карты Т-Банк ALL Airlines (без комиссии)
 * Экспортируется для использования в компонентах
 */
export const TBANK_ALL_AIRLINES_CARD_DATA: TBankAllAirlinesCardData = {
  id: TBANK_ALL_AIRLINES_CARD_INTERNAL.id,
  name: TBANK_ALL_AIRLINES_CARD_INTERNAL.name,
  bankName: TBANK_ALL_AIRLINES_CARD_INTERNAL.bankName,
  bankShortName: TBANK_ALL_AIRLINES_CARD_INTERNAL.bankShortName,
  miles: TBANK_ALL_AIRLINES_CARD_INTERNAL.miles,
  bonuses: TBANK_ALL_AIRLINES_CARD_INTERNAL.bonuses,
  insurance: TBANK_ALL_AIRLINES_CARD_INTERNAL.insurance,
  fees: TBANK_ALL_AIRLINES_CARD_INTERNAL.fees,
  features: TBANK_ALL_AIRLINES_CARD_INTERNAL.features,
  affiliate: {
    link: TBANK_ALL_AIRLINES_CARD_INTERNAL.affiliate.link,
    erid: TBANK_ALL_AIRLINES_CARD_INTERNAL.affiliate.erid,
    promoCode: TBANK_ALL_AIRLINES_CARD_INTERNAL.affiliate.promoCode,
    cookieTTL: TBANK_ALL_AIRLINES_CARD_INTERNAL.affiliate.cookieTTL,
    holdPeriod: TBANK_ALL_AIRLINES_CARD_INTERNAL.affiliate.holdPeriod,
    maxProcessingTime: TBANK_ALL_AIRLINES_CARD_INTERNAL.affiliate.maxProcessingTime,
    conversionRate: TBANK_ALL_AIRLINES_CARD_INTERNAL.affiliate.conversionRate,
    approvalRate: TBANK_ALL_AIRLINES_CARD_INTERNAL.affiliate.approvalRate,
    epc: TBANK_ALL_AIRLINES_CARD_INTERNAL.affiliate.epc,
    epl: TBANK_ALL_AIRLINES_CARD_INTERNAL.affiliate.epl
    // commission намеренно не включена
  },
  targetAction: TBANK_ALL_AIRLINES_CARD_INTERNAL.targetAction,
  targetAudience: TBANK_ALL_AIRLINES_CARD_INTERNAL.targetAudience,
  geo: TBANK_ALL_AIRLINES_CARD_INTERNAL.geo,
  promotion: TBANK_ALL_AIRLINES_CARD_INTERNAL.promotion,
  restrictions: TBANK_ALL_AIRLINES_CARD_INTERNAL.restrictions
};

/**
 * Получить комиссию для внутреннего трекинга
 * Используется только системой аналитики
 * @internal
 */
export function getInternalCommission(clientType: 'individual' | 'business' = 'individual'): number {
  return clientType === 'individual' 
    ? TBANK_ALL_AIRLINES_CARD_INTERNAL.affiliate.commissionIndividual
    : TBANK_ALL_AIRLINES_CARD_INTERNAL.affiliate.commissionBusiness;
}

/**
 * Валидация данных карты
 * Проверяет наличие всех обязательных полей
 */
export function validateTBankAllAirlinesCardData(data: TBankAllAirlinesCardData): boolean {
  if (!data.id || !data.name || !data.bankName || !data.bankShortName) {
    throw new Error('Missing required card identification fields');
  }
  
  if (!data.miles || !data.bonuses || !data.insurance) {
    throw new Error('Missing required card benefits information');
  }
  
  if (!data.features || data.features.length === 0) {
    throw new Error('Card must have at least one feature');
  }
  
  if (!data.affiliate || !data.affiliate.link || !data.affiliate.erid) {
    throw new Error('Missing required affiliate information or erid for compliance');
  }
  
  // Проверка формата партнерской ссылки
  if (!data.affiliate.link.startsWith('https://')) {
    throw new Error('Affiliate link must use HTTPS protocol');
  }
  
  // Проверка наличия erid в ссылке
  if (!data.affiliate.link.includes('erid=')) {
    throw new Error('Affiliate link must include erid parameter for compliance');
  }
  
  // Проверка промокода
  if (data.affiliate.promoCode && data.affiliate.promoCode.length === 0) {
    throw new Error('Promo code cannot be empty if provided');
  }
  
  return true;
}

// Валидация при загрузке модуля
validateTBankAllAirlinesCardData(TBANK_ALL_AIRLINES_CARD_DATA);

/**
 * Получить ссылку с промокодом
 * Формирует полную ссылку с промокодом для отслеживания
 */
export function getAffiliateUrlWithPromo(): string {
  const baseUrl = TBANK_ALL_AIRLINES_CARD_DATA.affiliate.link!;
  const promoCode = TBANK_ALL_AIRLINES_CARD_DATA.affiliate.promoCode;
  
  if (!promoCode) {
    return baseUrl;
  }
  
  // Если в URL уже есть параметры, добавляем через &, иначе через ?
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}promo=${promoCode}`;
}
