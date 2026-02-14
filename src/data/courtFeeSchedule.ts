import { FeeScheduleConfig, FeeRule } from '@/types/courtFee';

/**
 * Конфигурация тарифных сеток госпошлин
 * Основано на НК РФ статьи 333.19 (суды общей юрисдикции) и 333.21 (арбитражные суды)
 */
export const FEE_SCHEDULE_CONFIG: FeeScheduleConfig = {
  general: {
    rules: [
      { 
        min: 0, 
        max: 20000, 
        rate: 0.04, 
        minFee: 400 
      },
      { 
        min: 20001, 
        max: 100000, 
        rate: 0.03, 
        fixedPart: 800 
      },
      { 
        min: 100001, 
        max: 200000, 
        rate: 0.02, 
        fixedPart: 3200 
      },
      { 
        min: 200001, 
        max: 1000000, 
        rate: 0.01, 
        fixedPart: 5200 
      },
      { 
        min: 1000001, 
        max: null, 
        fixedFee: 60000 
      }
    ]
  },
  arbitration: {
    rules: [
      { 
        min: 0, 
        max: 100000, 
        rate: 0.04, 
        minFee: 2000 
      },
      { 
        min: 100001, 
        max: 500000, 
        rate: 0.03, 
        fixedPart: 4000 
      },
      { 
        min: 500001, 
        max: 1500000, 
        rate: 0.02, 
        fixedPart: 16000 
      },
      { 
        min: 1500001, 
        max: 10000000, 
        rate: 0.01, 
        fixedPart: 36000 
      },
      { 
        min: 10000001, 
        max: 500000000, 
        rate: 0.005, 
        fixedPart: 136000 
      },
      { 
        min: 500000001, 
        max: null, 
        fixedFee: 200000 
      }
    ]
  }
};

/**
 * Правила расчета для судов общей юрисдикции (ст. 333.19 НК РФ)
 */
export const GENERAL_JURISDICTION_RULES: FeeRule[] = [
  {
    minAmount: 0,
    maxAmount: 20000,
    feeType: 'percentage',
    feeValue: 0.04,
    minimumFee: 400,
    formula: 'цена иска × 4%, но не менее 400 руб.',
    legalBasis: 'пп. 1 п. 1 ст. 333.19 НК РФ'
  },
  {
    minAmount: 20001,
    maxAmount: 100000,
    feeType: 'progressive',
    feeValue: 0.03,
    formula: '800 руб. + 3% с суммы, превышающей 20 000 руб.',
    legalBasis: 'пп. 2 п. 1 ст. 333.19 НК РФ'
  },
  {
    minAmount: 100001,
    maxAmount: 200000,
    feeType: 'progressive',
    feeValue: 0.02,
    formula: '3 200 руб. + 2% с суммы, превышающей 100 000 руб.',
    legalBasis: 'пп. 3 п. 1 ст. 333.19 НК РФ'
  },
  {
    minAmount: 200001,
    maxAmount: 1000000,
    feeType: 'progressive',
    feeValue: 0.01,
    formula: '5 200 руб. + 1% с суммы, превышающей 200 000 руб.',
    legalBasis: 'пп. 4 п. 1 ст. 333.19 НК РФ'
  },
  {
    minAmount: 1000001,
    maxAmount: null,
    feeType: 'fixed',
    feeValue: 60000,
    maximumFee: 60000,
    formula: '60 000 руб.',
    legalBasis: 'пп. 5 п. 1 ст. 333.19 НК РФ'
  }
];

/**
 * Правила расчета для арбитражных судов (ст. 333.21 НК РФ)
 */
export const ARBITRATION_RULES: FeeRule[] = [
  {
    minAmount: 0,
    maxAmount: 100000,
    feeType: 'percentage',
    feeValue: 0.04,
    minimumFee: 2000,
    formula: 'цена иска × 4%, но не менее 2 000 руб.',
    legalBasis: 'пп. 1 п. 1 ст. 333.21 НК РФ'
  },
  {
    minAmount: 100001,
    maxAmount: 500000,
    feeType: 'progressive',
    feeValue: 0.03,
    formula: '4 000 руб. + 3% с суммы, превышающей 100 000 руб.',
    legalBasis: 'пп. 2 п. 1 ст. 333.21 НК РФ'
  },
  {
    minAmount: 500001,
    maxAmount: 1500000,
    feeType: 'progressive',
    feeValue: 0.02,
    formula: '16 000 руб. + 2% с суммы, превышающей 500 000 руб.',
    legalBasis: 'пп. 3 п. 1 ст. 333.21 НК РФ'
  },
  {
    minAmount: 1500001,
    maxAmount: 10000000,
    feeType: 'progressive',
    feeValue: 0.01,
    formula: '36 000 руб. + 1% с суммы, превышающей 1 500 000 руб.',
    legalBasis: 'пп. 4 п. 1 ст. 333.21 НК РФ'
  },
  {
    minAmount: 10000001,
    maxAmount: 500000000,
    feeType: 'progressive',
    feeValue: 0.005,
    formula: '136 000 руб. + 0,5% с суммы, превышающей 10 000 000 руб.',
    legalBasis: 'пп. 5 п. 1 ст. 333.21 НК РФ'
  },
  {
    minAmount: 500000001,
    maxAmount: null,
    feeType: 'fixed',
    feeValue: 200000,
    maximumFee: 200000,
    formula: '200 000 руб.',
    legalBasis: 'пп. 6 п. 1 ст. 333.21 НК РФ'
  }
];

/**
 * Получить правила для типа суда
 */
export function getFeeRules(courtType: 'general' | 'arbitration'): FeeRule[] {
  return courtType === 'general' ? GENERAL_JURISDICTION_RULES : ARBITRATION_RULES;
}

/**
 * Найти применимое правило для суммы иска
 */
export function findApplicableRule(amount: number, courtType: 'general' | 'arbitration'): FeeRule | null {
  const rules = getFeeRules(courtType);
  
  for (const rule of rules) {
    if (amount >= rule.minAmount && (rule.maxAmount === null || amount <= rule.maxAmount)) {
      return rule;
    }
  }
  
  return null;
}