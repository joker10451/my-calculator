/**
 * Примеры конфигураций банковских API
 * Используются для настройки автоматической синхронизации с банками
 */

import type { BankApiConfig } from './dataSync';
import { BankApiType } from './dataSync';

/**
 * Пример конфигурации для Сбербанка
 * ВАЖНО: Это пример, реальные API endpoints и ключи нужно получить у банка
 */
export const sberbankApiConfig: BankApiConfig = {
  bank_id: 'sberbank',
  bank_name: 'Сбербанк',
  api_url: 'https://api.sberbank.ru/v1',
  api_type: BankApiType.REST,
  endpoints: {
    products: '/products',
    rates: '/rates',
    terms: '/terms'
  },
  auth: {
    type: 'api_key',
    key: process.env.VITE_SBERBANK_API_KEY || ''
  },
  mapping: {
    name: 'product_name',
    product_type: 'type',
    interest_rate: 'rate',
    min_amount: 'min_sum',
    max_amount: 'max_sum',
    min_term: 'min_period',
    max_term: 'max_period',
    fees: {
      application: 'fees.application_fee',
      monthly: 'fees.monthly_fee'
    },
    requirements: {
      min_income: 'requirements.income',
      min_age: 'requirements.age_from',
      max_age: 'requirements.age_to'
    },
    features: {
      early_repayment: 'features.early_payment',
      online_application: 'features.online'
    },
    promotional_rate: 'promo.rate',
    promo_valid_until: 'promo.valid_until'
  }
};

/**
 * Пример конфигурации для ВТБ
 */
export const vtbApiConfig: BankApiConfig = {
  bank_id: 'vtb',
  bank_name: 'ВТБ',
  api_url: 'https://api.vtb.ru/public/v2',
  api_type: BankApiType.REST,
  endpoints: {
    products: '/banking-products',
    rates: '/interest-rates'
  },
  auth: {
    type: 'bearer',
    token: process.env.VITE_VTB_API_TOKEN || ''
  },
  mapping: {
    name: 'title',
    product_type: 'category',
    interest_rate: 'interestRate.value',
    min_amount: 'amount.min',
    max_amount: 'amount.max',
    min_term: 'term.minMonths',
    max_term: 'term.maxMonths',
    fees: {
      application: 'fees.processing',
      monthly: 'fees.service'
    },
    requirements: {
      min_income: 'eligibility.minIncome',
      min_age: 'eligibility.minAge'
    },
    features: {
      early_repayment: 'options.earlyRepayment',
      grace_period: 'options.gracePeriod'
    }
  }
};

/**
 * Пример конфигурации для Альфа-Банка
 */
export const alfabankApiConfig: BankApiConfig = {
  bank_id: 'alfabank',
  bank_name: 'Альфа-Банк',
  api_url: 'https://api.alfabank.ru/api/v1',
  api_type: BankApiType.REST,
  endpoints: {
    products: '/products/list',
    rates: '/rates/current'
  },
  auth: {
    type: 'api_key',
    key: process.env.VITE_ALFABANK_API_KEY || ''
  },
  mapping: {
    name: 'productName',
    product_type: 'productType',
    interest_rate: 'rate',
    min_amount: 'limits.minAmount',
    max_amount: 'limits.maxAmount',
    min_term: 'limits.minTerm',
    max_term: 'limits.maxTerm',
    fees: {
      application: 'commissions.application',
      monthly: 'commissions.monthly'
    },
    requirements: {
      min_income: 'conditions.minIncome',
      min_age: 'conditions.minAge',
      max_age: 'conditions.maxAge'
    },
    features: {
      early_repayment: 'features.earlyRepayment',
      online_application: 'features.onlineApplication'
    },
    promotional_rate: 'promotion.rate',
    promo_valid_until: 'promotion.endDate'
  }
};

/**
 * Пример конфигурации для Тинькофф
 */
export const tinkoffApiConfig: BankApiConfig = {
  bank_id: 'tinkoff',
  bank_name: 'Тинькофф',
  api_url: 'https://api.tinkoff.ru/v1',
  api_type: BankApiType.REST,
  endpoints: {
    products: '/products',
    rates: '/rates'
  },
  auth: {
    type: 'bearer',
    token: process.env.VITE_TINKOFF_API_TOKEN || ''
  },
  mapping: {
    name: 'name',
    product_type: 'type',
    interest_rate: 'interestRate',
    min_amount: 'minAmount',
    max_amount: 'maxAmount',
    min_term: 'minTermMonths',
    max_term: 'maxTermMonths',
    fees: {
      application: 'fees.application',
      monthly: 'fees.monthly',
      early_repayment: 'fees.earlyRepayment'
    },
    requirements: {
      min_income: 'requirements.minMonthlyIncome',
      min_age: 'requirements.minAge'
    },
    features: {
      early_repayment: 'features.earlyRepaymentAllowed',
      online_application: 'features.onlineApplicationAvailable',
      fast_approval: 'features.fastApproval'
    }
  }
};

/**
 * Получить все доступные конфигурации банковских API
 */
export function getAllBankApiConfigs(): BankApiConfig[] {
  return [
    sberbankApiConfig,
    vtbApiConfig,
    alfabankApiConfig,
    tinkoffApiConfig
  ].filter(config => {
    // Возвращаем только те конфигурации, для которых есть API ключи
    if (config.auth?.type === 'api_key') {
      return config.auth.key && config.auth.key.length > 0;
    }
    if (config.auth?.type === 'bearer') {
      return config.auth.token && config.auth.token.length > 0;
    }
    return true;
  });
}

/**
 * Получить конфигурацию API для конкретного банка
 */
export function getBankApiConfig(bankId: string): BankApiConfig | undefined {
  const configs = getAllBankApiConfigs();
  return configs.find(config => config.bank_id === bankId);
}
