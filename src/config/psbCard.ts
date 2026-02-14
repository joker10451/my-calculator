/**
 * Конфигурация дебетовой карты "Твой Кешбэк" от банка ПСБ
 * Партнерская интеграция с соблюдением требований рекламного законодательства
 */

/**
 * Интерфейс данных карты ПСБ
 */
export interface PSBCardData {
  id: string;
  name: string;
  bankName: string;
  bankShortName: string;
  
  // Основные преимущества
  cashback: {
    welcome: string; // приветственный кешбэк
    regular: string; // постоянный кешбэк
    maxMonthly: number; // максимальный кешбэк в месяц
  };
  
  // Условия и особенности
  features: string[];
  
  // Партнерская информация (публичная)
  affiliate: {
    link: string;
    erid: string;
  };
  
  // Официальные баннеры от партнерки
  banners: {
    compact: string;  // для компактного варианта (370x200)
    full: string;     // для полного варианта (600x600)
    mobile: string;   // для мобильных устройств (370x200)
    desktop: string;  // для десктопа (800x525)
  };
  
  // Ограничения (для соблюдения правил)
  restrictions: {
    excludedRegions: string[];
    targetAudience: string;
  };
}

/**
 * Внутренняя конфигурация с комиссией
 * НЕ ЭКСПОРТИРУЕТСЯ - только для внутреннего использования
 */
interface PSBCardInternalConfig extends PSBCardData {
  affiliate: PSBCardData['affiliate'] & {
    commission: number; // внутренняя информация о комиссии
  };
}

/**
 * Внутренние данные карты с комиссией
 * Используется только внутри модуля
 */
const PSB_CARD_INTERNAL: PSBCardInternalConfig = {
  id: 'psb-debit-salary',
  name: 'Зарплатные привилегии',
  bankName: 'Банк ПСБ',
  bankShortName: 'ПСБ',
  
  cashback: {
    welcome: 'Переведи зарплату и получай лучшие условия',
    regular: '+1% к повышенным категориям лояльности',
    maxMonthly: 5000
  },
  
  features: [
    'Бесплатное снятие в любых банкоматах (до 150 тыс.руб.)',
    '+0,5% надбавка ко вкладам при зачислении зарплаты',
    '+1% к повышенным категориям лояльности',
    'Увеличение максимальной суммы баллов до 5000 в месяц',
    'Повышенные лимиты на снятие наличных (до 500 000 ₽ в день, до 1 000 000 ₽ в месяц)'
  ],
  
  affiliate: {
    link: 'https://trk.ppdu.ru/click/4wXDM0Um?erid=2SDnjehD1C8',
    erid: '2SDnjehD1C8',
    commission: 1633 // внутренняя информация, не экспортируется
  },
  
  // Официальные баннеры от партнерской программы ПСБ
  banners: {
    compact: '/blog/Creative/_370x200.gif',   // компактный горизонтальный
    full: '/blog/Creative/_600x600.gif',      // квадратный для полного варианта
    mobile: '/blog/Creative/_370x200.gif',    // для мобильных устройств
    desktop: '/blog/Creative/_800x525.gif'    // широкий для десктопа
  },
  
  restrictions: {
    excludedRegions: ['ДНР', 'ЛНР', 'Херсонская область', 'Запорожская область'],
    targetAudience: 'Клиенты с зарплатным проектом'
  }
};

/**
 * Публичные данные карты ПСБ (без комиссии)
 * Экспортируется для использования в компонентах
 */
export const PSB_CARD_DATA: PSBCardData = {
  id: PSB_CARD_INTERNAL.id,
  name: PSB_CARD_INTERNAL.name,
  bankName: PSB_CARD_INTERNAL.bankName,
  bankShortName: PSB_CARD_INTERNAL.bankShortName,
  cashback: PSB_CARD_INTERNAL.cashback,
  features: PSB_CARD_INTERNAL.features,
  affiliate: {
    link: PSB_CARD_INTERNAL.affiliate.link,
    erid: PSB_CARD_INTERNAL.affiliate.erid
    // commission намеренно не включена
  },
  banners: PSB_CARD_INTERNAL.banners,
  restrictions: PSB_CARD_INTERNAL.restrictions
};

/**
 * Получить комиссию для внутреннего трекинга
 * Используется только системой аналитики
 * @internal
 */
export function getInternalCommission(): number {
  return PSB_CARD_INTERNAL.affiliate.commission;
}

/**
 * Валидация данных карты
 * Проверяет наличие всех обязательных полей
 */
export function validatePSBCardData(data: PSBCardData): boolean {
  if (!data.id || !data.name || !data.bankName || !data.bankShortName) {
    throw new Error('Missing required card identification fields');
  }
  
  if (!data.cashback || !data.cashback.welcome || !data.cashback.regular) {
    throw new Error('Missing required cashback information');
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
  
  // Проверка наличия erid в ссылке (для соответствия требованиям)
  if (!data.affiliate.link.includes('erid=')) {
    throw new Error('Affiliate link must include erid parameter for compliance');
  }
  
  return true;
}

// Валидация при загрузке модуля
validatePSBCardData(PSB_CARD_DATA);
