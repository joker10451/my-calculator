export interface Partner {
  name: string;
  offer: string;
  url: string;
  commission: string;
  category: 'samozanyatye' | 'semi' | 'universal';
}

export const PARTNERS: Record<string, Partner> = {
  tbank_account: {
    name: 'Т-Банк',
    offer: 'Расчётный счёт для самозанятых',
    url: 'https://www.tbank.ru/business/',
    commission: 'до 5 000 ₽',
    category: 'samozanyatye',
  },
  tbank_credit: {
    name: 'Т-Банк',
    offer: 'Кредитная карта Платинум',
    url: 'https://www.tbank.ru/credit/',
    commission: 'до 8 000 ₽',
    category: 'universal',
  },
  moe_delo: {
    name: 'Моё Дело',
    offer: 'Бухгалтерия для самозанятых',
    url: 'https://www.moedelo.org/',
    commission: 'до 5 000 ₽',
    category: 'samozanyatye',
  },
  alfa_bank: {
    name: 'Альфа-Банк',
    offer: 'Ипотека',
    url: 'https://alfabank.ru/ipoteka/',
    commission: 'до 10 000 ₽',
    category: 'semi',
  },
};

export type PartnerKey = keyof typeof PARTNERS;
