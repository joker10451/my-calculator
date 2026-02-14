// Общие константы приложения
export const APP_CONFIG = {
  name: 'Считай.RU',
  shortName: 'Считай.RU',
  description: 'Бесплатные онлайн калькуляторы для России и СНГ',
  version: '1.0.0',
  author: 'Schitay.ru Team',
  url: 'https://schitay-online.ru',
} as const;

export const STORAGE_KEYS = {
  // Calculator prefixes
  MORTGAGE: 'mortgage_',
  SALARY: 'calc_salary_',
  CREDIT: 'credit_',
  BMI: 'bmi_',
  FUEL: 'fuel_',
  UTILITIES: 'utilities_',
  MATERNITY: 'maternity_',
  CALORIE: 'calorie_',
  WATER: 'water_',
  ALIMONY: 'alimony_',
  REFINANCING: 'refinancing_',
  DEPOSIT: 'deposit_',
  CURRENCY: 'currency_',
  TIRE_SIZE: 'tire_size_',
  COURT_FEE: 'court_fee_',
  
  // Global keys
  COMPARISON_ITEMS: 'calc_comparison_items',
  THEME: 'theme',
  OFFLINE_MODE: 'offline_mode',
} as const;

export const TAX_RATES = {
  // НДФЛ 2026
  INCOME_TAX: {
    STANDARD_RATE: 0.13,
    PROGRESSIVE_THRESHOLD: 5000000, // 5 млн рублей в год
    PROGRESSIVE_RATE: 0.15,
  },
  
  // Материнский капитал 2026
  MATERNITY_CAPITAL: {
    FIRST_CHILD: 934058,
    SECOND_CHILD: 1232000,
  },
  
  // Социальные взносы
  SOCIAL_CONTRIBUTIONS: {
    PENSION: 0.22,
    MEDICAL: 0.051,
    SOCIAL: 0.029,
    TOTAL: 0.30,
  },
} as const;

export const VALIDATION_LIMITS = {
  MORTGAGE: {
    MIN_PRICE: 100000,
    MAX_PRICE: 100000000,
    MIN_INITIAL: 0,
    MAX_INITIAL_PERCENT: 90,
    MIN_TERM: 1,
    MAX_TERM: 50,
    MIN_RATE: 0.1,
    MAX_RATE: 50,
  },
  
  SALARY: {
    MIN_AMOUNT: 15000,
    MAX_AMOUNT: 10000000,
  },
  
  CREDIT: {
    MIN_AMOUNT: 10000,
    MAX_AMOUNT: 50000000,
    MIN_TERM: 1,
    MAX_TERM: 30,
    MIN_RATE: 0.1,
    MAX_RATE: 50,
  },
} as const;

export const FORMAT_OPTIONS = {
  CURRENCY: {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  },
  
  PERCENT: {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  },
  
  NUMBER: {
    maximumFractionDigits: 0,
  },
} as const;

export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#ef4444',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  INFO: '#06b6d4',
  MUTED: '#6b7280',
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;