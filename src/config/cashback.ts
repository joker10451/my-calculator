/**
 * Конфигурация интеграции Яндекс Кешбэка
 */

import { CashbackConfig } from '../types/cashback';

/**
 * Основная конфигурация кешбэка
 */
export const cashbackConfig: CashbackConfig = {
  partnerUrl: 'https://ya.cc/8WF6y8',
  isEnabled: true,
  sources: {
    footer: {
      enabled: true,
      message: 'Экономьте на покупках с Яндекс Кешбэком',
      utmSource: 'cashback_footer',
    },
    calculators: {
      credit: {
        enabled: true,
        message: 'Совет: используйте кешбэк для досрочного погашения кредита',
        utmSource: 'cashback_credit',
        displayConditions: {
          minAmount: 10000, // Показывать только для кредитов от 10к рублей
        },
      },
      mortgage: {
        enabled: true,
        message: 'Накапливайте на досрочные платежи с помощью кешбэка',
        utmSource: 'cashback_mortgage',
        displayConditions: {
          minAmount: 100000, // Показывать только для ипотеки от 100к рублей
        },
      },
      salary: {
        enabled: true,
        message: 'Увеличьте доходы с кешбэком с покупок',
        utmSource: 'cashback_salary',
        displayConditions: {
          minAmount: 20000, // Показывать только для зарплат от 20к рублей
        },
      },
    },
  },
};

/**
 * Сообщения для локализации
 */
export const cashbackMessages = {
  ru: {
    footer: 'Экономьте на покупках с Яндекс Кешбэком',
    credit: 'Совет: используйте кешбэк для досрочного погашения кредита',
    mortgage: 'Накапливайте на досрочные платежи с помощью кешбэка',
    salary: 'Увеличьте доходы с кешбэком с покупок',
    partnerLabel: 'Партнерская ссылка',
    advertisementLabel: 'Реклама',
  },
};

/**
 * Настройки аналитики
 */
export const analyticsConfig = {
  yandexMetricaGoals: {
    cashbackClick: 'cashback_click',
    cashbackView: 'cashback_view',
  },
  sessionStorageKey: 'cashback_session_id',
};