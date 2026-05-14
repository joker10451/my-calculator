/**
 * Данные о ставках банков — обновляются вручную
 * Последнее обновление: май 2026
 */

export interface BankRateData {
  slug: string;
  name: string;
  logo?: string;
  rating: number; // 1-5
  mortgage: {
    rate: number; // базовая ставка %
    maxAmount: number; // макс. сумма, ₽
    minDownPayment: number; // мин. первоначальный взнос, %
    maxTerm: number; // макс. срок, лет
  };
  credit: {
    rate: number;
    maxAmount: number;
    maxTerm: number; // лет
  };
  deposit: {
    rate: number; // макс. ставка %
    minAmount: number;
    maxTerm: number; // месяцев
  };
}

export const BANK_RATES: BankRateData[] = [
  {
    slug: 'sber',
    name: 'Сбербанк',
    rating: 4.5,
    mortgage: { rate: 14.9, maxAmount: 100_000_000, minDownPayment: 15, maxTerm: 30 },
    credit: { rate: 16.9, maxAmount: 5_000_000, maxTerm: 7 },
    deposit: { rate: 17.0, minAmount: 1000, maxTerm: 36 },
  },
  {
    slug: 'vtb',
    name: 'ВТБ',
    rating: 4.3,
    mortgage: { rate: 14.5, maxAmount: 60_000_000, minDownPayment: 15, maxTerm: 30 },
    credit: { rate: 15.9, maxAmount: 7_000_000, maxTerm: 7 },
    deposit: { rate: 17.5, minAmount: 1000, maxTerm: 24 },
  },
  {
    slug: 'alfa',
    name: 'Альфа-Банк',
    rating: 4.4,
    mortgage: { rate: 15.2, maxAmount: 50_000_000, minDownPayment: 20, maxTerm: 30 },
    credit: { rate: 14.9, maxAmount: 7_500_000, maxTerm: 5 },
    deposit: { rate: 18.0, minAmount: 10000, maxTerm: 36 },
  },
  {
    slug: 'tinkoff',
    name: 'Т-Банк',
    rating: 4.6,
    mortgage: { rate: 15.5, maxAmount: 30_000_000, minDownPayment: 20, maxTerm: 25 },
    credit: { rate: 14.5, maxAmount: 5_000_000, maxTerm: 5 },
    deposit: { rate: 18.5, minAmount: 50000, maxTerm: 24 },
  },
  {
    slug: 'gazprombank',
    name: 'Газпромбанк',
    rating: 4.2,
    mortgage: { rate: 14.3, maxAmount: 60_000_000, minDownPayment: 15, maxTerm: 30 },
    credit: { rate: 15.5, maxAmount: 5_000_000, maxTerm: 7 },
    deposit: { rate: 17.8, minAmount: 15000, maxTerm: 36 },
  },
  {
    slug: 'raiffeisen',
    name: 'Райффайзен',
    rating: 4.1,
    mortgage: { rate: 15.8, maxAmount: 26_000_000, minDownPayment: 20, maxTerm: 30 },
    credit: { rate: 16.5, maxAmount: 3_000_000, maxTerm: 5 },
    deposit: { rate: 16.5, minAmount: 50000, maxTerm: 24 },
  },
  {
    slug: 'rosbank',
    name: 'Росбанк',
    rating: 4.0,
    mortgage: { rate: 15.0, maxAmount: 30_000_000, minDownPayment: 20, maxTerm: 25 },
    credit: { rate: 16.0, maxAmount: 3_000_000, maxTerm: 5 },
    deposit: { rate: 17.0, minAmount: 10000, maxTerm: 24 },
  },
  {
    slug: 'psb',
    name: 'ПСБ',
    rating: 4.0,
    mortgage: { rate: 14.7, maxAmount: 50_000_000, minDownPayment: 15, maxTerm: 30 },
    credit: { rate: 15.9, maxAmount: 5_000_000, maxTerm: 7 },
    deposit: { rate: 17.5, minAmount: 10000, maxTerm: 36 },
  },
  {
    slug: 'sovcombank',
    name: 'Совкомбанк',
    rating: 4.1,
    mortgage: { rate: 14.9, maxAmount: 30_000_000, minDownPayment: 10, maxTerm: 30 },
    credit: { rate: 14.9, maxAmount: 5_000_000, maxTerm: 5 },
    deposit: { rate: 18.0, minAmount: 50000, maxTerm: 36 },
  },
  {
    slug: 'otkritie',
    name: 'Открытие',
    rating: 3.9,
    mortgage: { rate: 15.3, maxAmount: 30_000_000, minDownPayment: 20, maxTerm: 30 },
    credit: { rate: 16.2, maxAmount: 4_000_000, maxTerm: 5 },
    deposit: { rate: 17.2, minAmount: 10000, maxTerm: 24 },
  },
];
