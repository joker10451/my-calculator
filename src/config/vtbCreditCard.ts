/**
 * Конфигурация кредитной карты ВТБ
 * Партнерская интеграция с соблюдением требований рекламного законодательства
 */

/**
 * Интерфейс данных кредитной карты ВТБ
 */
export interface VTBCreditCardData {
  id: string;
  name: string;
  bankName: string;
  bankShortName: string;
  
  // Основные условия
  creditLimit: {
    max: number;
    maxWithoutIncome: number;
  };
  
  // Льготный период
  gracePeriod: {
    refinancing: number; // дней для рефинансирования
    purchases: number; // дней для покупок
  };
  
  // Процентные ставки
  rates: {
    purchases: string;
    cashWithdrawal: string;
    refinancing: string;
    psk: string; // Полная стоимость кредита
  };
  
  // Кешбэк
  cashback: {
    max: string;
    categories: number;
    categoriesForSalary: number;
    maxMonthly: number;
  };
  
  // Комиссии
  fees: {
    annual: number;
    cashWithdrawal: string;
    cashWithdrawalFirst30Days: string;
    minPayment: string;
  };
  
  // Основные преимущества
  features: string[];
  
  // Партнерская информация (публичная)
  affiliate: {
    link?: string; // будет добавлена позже
    erid?: string; // будет добавлен позже
    cookieTTL: number; // дней
    holdPeriod: number; // дней
    conversionRate: number; // CR %
    approvalRate: number; // AR %
    epc: number; // EPC в рублях
    epl: number; // EPL в рублях
  };
  
  // Целевое действие
  targetAction: {
    description: string;
    attribution: {
      cardReceiving: number; // дней на получение карты
      posActivation: number; // дней на POS-активацию
    };
  };
  
  // Требования к заемщику
  requirements: {
    citizenship: string;
    registration: string;
    minIncome: number;
    documents: {
      upTo300k: string[];
      from300k: string[];
    };
  };
  
  // Обязательные дисклеймеры
  disclaimers: {
    main: string;
    fullConditions: string;
    advertising: string;
  };
  
  // Ограничения (для соблюдения правил)
  restrictions: {
    geo: string;
    lostLeadsSearch: string;
  };
}

/**
 * Внутренняя конфигурация с комиссией
 * НЕ ЭКСПОРТИРУЕТСЯ - только для внутреннего использования
 */
interface VTBCreditCardInternalConfig extends VTBCreditCardData {
  affiliate: VTBCreditCardData['affiliate'] & {
    commissionIndividual: number; // комиссия для физ.лиц
    commissionBusiness: number; // комиссия для ЮЛ, СЗ, ИП
  };
}

/**
 * Внутренние данные карты с комиссией
 * Используется только внутри модуля
 */
const VTB_CREDIT_CARD_INTERNAL: VTBCreditCardInternalConfig = {
  id: 'vtb-credit-card',
  name: 'Кредитная карта',
  bankName: 'Банк ВТБ (ПАО)',
  bankShortName: 'ВТБ',
  
  creditLimit: {
    max: 1000000,
    maxWithoutIncome: 300000
  },
  
  gracePeriod: {
    refinancing: 200,
    purchases: 100
  },
  
  rates: {
    purchases: 'от 49.9%',
    cashWithdrawal: 'от 49.9%',
    refinancing: '69.9%',
    psk: '47.000%-49.900%'
  },
  
  cashback: {
    max: 'до 15%',
    categories: 3,
    categoriesForSalary: 4,
    maxMonthly: 3000
  },
  
  fees: {
    annual: 0,
    cashWithdrawal: '5.9% + 590 ₽',
    cashWithdrawalFirst30Days: '0 ₽ до 50 000 ₽',
    minPayment: '3% от задолженности, округляется до 100 ₽'
  },
  
  features: [
    'До 200 дней без процентов',
    '0 ₽ обслуживание и доставка карты',
    'До 15% кешбэк рублями в выбранных категориях',
    'Максимальный кредитный лимит – 1 000 000 ₽',
    'Снятие наличных до 50 000 ₽ без комиссии в первые 30 дней',
    'Бесплатная доставка карты курьером'
  ],
  
  affiliate: {
    link: 'https://trk.ppdu.ru/click/q3zhF1ow?erid=2SDnjeGCc2T',
    erid: '2SDnjeGCc2T',
    cookieTTL: 30,
    holdPeriod: 30,
    conversionRate: 7.92,
    approvalRate: 0.94,
    epc: 2.32,
    epl: 29.30,
    commissionIndividual: 2260, // для физ.лиц
    commissionBusiness: 3105 // для ЮЛ, СЗ, ИП
  },
  
  targetAction: {
    description: 'Кредитная карта – выдача + POS-транзакция на любую сумму. При одновременном открытии двух карт оплате подлежит только одна из них.',
    attribution: {
      cardReceiving: 30,
      posActivation: 30
    }
  },
  
  requirements: {
    citizenship: 'Гражданство РФ',
    registration: 'Постоянная регистрация в регионе присутствия банка',
    minIncome: 5000,
    documents: {
      upTo300k: ['Паспорт РФ'],
      from300k: ['Паспорт РФ', 'Справка по форме 2-НДФЛ или справка по форме банка']
    }
  },
  
  disclaimers: {
    main: 'Оценивайте свои финансовые возможности и риски.',
    fullConditions: 'Изучите все условия кредита на сайте vtb.ru/personal/karty/kreditnye/vozmozhnosti',
    advertising: 'Обслуживание 0 руб. в год. Бесплатная доставка доступна в определенных городах России. ' +
      'Льготный период до 200 дней распространяется на рефинансирование кредитных карт других банков при совершении операции в течение 30 дней с даты договора и закрытия кредитных карт в других банках в течение 60 дней. ' +
      'Льготный период до 110 дней действует на покупки при своевременном внесении мин. платежей и погашения всей суммы задолженности до его окончания. ' +
      'Комиссия за снятие наличных и переводы для суммы до 50 000 ₽ в первые 30 дней – 0 ₽, в остальных случаях 5,9%+590 руб. ' +
      'Полная стоимость кредита 47,000% - 49,900%, процентная ставка от 49,9% - 69,9% годовых. ' +
      '«Кешбэк рублями» − частичный возврат стоимости покупки в процентах от суммы операции, ежемесячно автоматически конвертируемых Банком по курсу 1 Бонусный рубль = 1 рубль в порядке, установленном Правилами Программы Банк ВТБ (ПАО). ' +
      'Генеральная лицензия Банка России №1000. Реклама 0+.'
  },
  
  restrictions: {
    geo: 'Россия',
    lostLeadsSearch: 'Поиск потерянных выдач осуществляется по заявкам, у которых с момента совершения целевого действия прошло не более 3 месяцев. Если были нарушены правила оффера или вид трафика не был согласован, то поиск потерянной выдачи не производится.'
  }
};

/**
 * Публичные данные кредитной карты ВТБ (без комиссии)
 * Экспортируется для использования в компонентах
 */
export const VTB_CREDIT_CARD_DATA: VTBCreditCardData = {
  id: VTB_CREDIT_CARD_INTERNAL.id,
  name: VTB_CREDIT_CARD_INTERNAL.name,
  bankName: VTB_CREDIT_CARD_INTERNAL.bankName,
  bankShortName: VTB_CREDIT_CARD_INTERNAL.bankShortName,
  creditLimit: VTB_CREDIT_CARD_INTERNAL.creditLimit,
  gracePeriod: VTB_CREDIT_CARD_INTERNAL.gracePeriod,
  rates: VTB_CREDIT_CARD_INTERNAL.rates,
  cashback: VTB_CREDIT_CARD_INTERNAL.cashback,
  fees: VTB_CREDIT_CARD_INTERNAL.fees,
  features: VTB_CREDIT_CARD_INTERNAL.features,
  affiliate: {
    link: VTB_CREDIT_CARD_INTERNAL.affiliate.link,
    erid: VTB_CREDIT_CARD_INTERNAL.affiliate.erid,
    cookieTTL: VTB_CREDIT_CARD_INTERNAL.affiliate.cookieTTL,
    holdPeriod: VTB_CREDIT_CARD_INTERNAL.affiliate.holdPeriod,
    conversionRate: VTB_CREDIT_CARD_INTERNAL.affiliate.conversionRate,
    approvalRate: VTB_CREDIT_CARD_INTERNAL.affiliate.approvalRate,
    epc: VTB_CREDIT_CARD_INTERNAL.affiliate.epc,
    epl: VTB_CREDIT_CARD_INTERNAL.affiliate.epl
    // commission намеренно не включена
  },
  targetAction: VTB_CREDIT_CARD_INTERNAL.targetAction,
  requirements: VTB_CREDIT_CARD_INTERNAL.requirements,
  disclaimers: VTB_CREDIT_CARD_INTERNAL.disclaimers,
  restrictions: VTB_CREDIT_CARD_INTERNAL.restrictions
};

/**
 * Получить комиссию для внутреннего трекинга
 * Используется только системой аналитики
 * @internal
 */
export function getInternalCommission(clientType: 'individual' | 'business' = 'individual'): number {
  return clientType === 'individual' 
    ? VTB_CREDIT_CARD_INTERNAL.affiliate.commissionIndividual
    : VTB_CREDIT_CARD_INTERNAL.affiliate.commissionBusiness;
}

/**
 * Валидация данных карты
 * Проверяет наличие всех обязательных полей
 */
export function validateVTBCreditCardData(data: VTBCreditCardData): boolean {
  if (!data.id || !data.name || !data.bankName || !data.bankShortName) {
    throw new Error('Missing required card identification fields');
  }
  
  if (!data.creditLimit || !data.gracePeriod || !data.rates) {
    throw new Error('Missing required credit card terms');
  }
  
  if (!data.features || data.features.length === 0) {
    throw new Error('Card must have at least one feature');
  }
  
  if (!data.disclaimers || !data.disclaimers.main || !data.disclaimers.fullConditions) {
    throw new Error('Missing required disclaimers for compliance');
  }
  
  // Проверка партнерской ссылки (если указана)
  if (data.affiliate.link) {
    if (!data.affiliate.link.startsWith('https://')) {
      throw new Error('Affiliate link must use HTTPS protocol');
    }
    
    // Проверка наличия erid (если указан)
    if (data.affiliate.erid && !data.affiliate.link.includes('erid=')) {
      throw new Error('Affiliate link must include erid parameter for compliance');
    }
  }
  
  return true;
}

// Валидация при загрузке модуля
validateVTBCreditCardData(VTB_CREDIT_CARD_DATA);

/**
 * Получить полный текст дисклеймера для рекламных материалов
 * Формирует текст согласно требованиям ФЗ "О рекламе"
 */
export function getAdvertisingDisclaimer(includePSK: boolean = true): string {
  const parts = [
    VTB_CREDIT_CARD_DATA.disclaimers.main,
    VTB_CREDIT_CARD_DATA.disclaimers.fullConditions
  ];
  
  if (includePSK) {
    parts.push(`ПСК ${VTB_CREDIT_CARD_DATA.rates.psk}`);
  }
  
  return parts.join(' ');
}

/**
 * Проверка соответствия рекламного материала требованиям
 * Возвращает список нарушений, если они есть
 */
export function validateAdvertisingMaterial(material: {
  text: string;
  hasRatesMention: boolean;
  disclaimerSize: number; // процент от рекламного пространства
}): string[] {
  const violations: string[] = [];
  
  // Проверка наличия обязательной фразы о рисках
  if (!material.text.includes('Оценивайте свои финансовые возможности и риски')) {
    violations.push('Отсутствует обязательная фраза о рисках (должна занимать не менее 5% пространства)');
  }
  
  // Проверка наличия ссылки на условия
  if (!material.text.includes('vtb.ru/personal/karty/kreditnye/vozmozhnosti')) {
    violations.push('Отсутствует ссылка на полные условия кредита (должна занимать не менее 5% пространства)');
  }
  
  // Проверка размера дисклеймера
  if (material.disclaimerSize < 10) {
    violations.push('Дисклеймер должен занимать не менее 10% рекламного пространства');
  }
  
  // Проверка ПСК при упоминании ставки
  if (material.hasRatesMention && !material.text.includes('ПСК')) {
    violations.push('При упоминании процентной ставки обязательно указание ПСК');
  }
  
  return violations;
}
