export interface Partner {
  name: string;
  offer: string;
  /** Партнёрская ссылка Pampadu с токеном erid. */
  url: string;
  /** Подпись рекламы рядом со ссылкой (ст. 18.1 ФЗ «О рекламе»). */
  disclosure: string;
  category: 'samozanyatye' | 'semi' | 'universal';
}

export const PARTNERS = {
  // Pampadu, оффер 2274 «Альфа-Банк — РегБиз + РКО»
  alfa_business: {
    name: 'Альфа-Банк',
    offer: 'Регистрация ИП и расчётный счёт',
    url: 'https://trk.ppdu.ru/click/g1qTGqPE?erid=2SDnjeEA46e',
    disclosure: 'Реклама. АО «Альфа-Банк», alfabank.ru. erid: 2SDnjeEA46e',
    category: 'samozanyatye',
  },
  // Pampadu, оффер 2114 «Альфа-Банк — ДК МИР для самозанятых»
  alfa_selfemployed_card: {
    name: 'Альфа-Банк',
    offer: 'Карта МИР для самозанятых',
    url: 'https://trk.ppdu.ru/click/YTnbPQlG?erid=2SDnjcYZxoE',
    disclosure: 'Реклама. АО «Альфа-Банк», alfabank.ru. erid: 2SDnjcYZxoE',
    category: 'samozanyatye',
  },
} satisfies Record<string, Partner>;

export type PartnerKey = keyof typeof PARTNERS;
