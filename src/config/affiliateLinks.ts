/**
 * Конфигурация партнерских ссылок
 * Здесь хранятся все реферальные ссылки для банковских продуктов
 */

export interface AffiliateLink {
  url: string;
  bankId: string;
  productType?: string;
  commission?: number; // потенциальная комиссия в рублях
  description?: string;
  erid?: string; // идентификатор рекламы для соответствия требованиям
  title?: string; // заголовок для витрины
  category?: 'mortgage' | 'credit' | 'debit' | 'deposit' | 'loan' | 'insurance' | 'vacancies' | 'other';
  badges?: string[];
  updatedAt?: string; // дата последней актуализации условий
  eligibility?: string[]; // ключевые требования/кому подходит
  restrictions?: string[]; // важные ограничения
  publicDetails?: string; // краткие условия для пользователя (показываются на сайте)
  internalNotes?: string; // служебные заметки для аналитики (не показываются в UI)
  priority?: number; // ручная сортировка: больше = выше
}

/**
 * Партнерские ссылки по банкам
 * Формат: 'bankId-productType' или 'bankId' для общей ссылки банка
 */
export const AFFILIATE_LINKS: Record<string, AffiliateLink> = {
  'vtb-credit-card': {
    url: 'https://trk.ppdu.ru/click/q3zhF1ow?erid=2SDnjeGCc2T',
    bankId: 'vtb',
    productType: 'credit',
    erid: '2SDnjeGCc2T',
    description: 'Кредитная карта ВТБ',
    title: 'Кредитная карта ВТБ',
    category: 'credit',
    badges: ['Онлайн', 'Льготный период'],
    updatedAt: '2026-04-08',
    eligibility: ['Для клиентов 18+', 'Требуется подтверждение банком'],
    publicDetails: 'Решение и выдача по правилам банка',
    priority: 95,
  },
  
  // ПСБ - Дебетовая карта "Зарплатные привилегии"
  'psb-debit-cashback': {
    url: 'https://trk.ppdu.ru/click/dvGuYeFM?erid=2SDnje44eET&siteId=15645',
    bankId: 'psb',
    productType: 'debit',
    erid: '2SDnje44eET',
    commission: 1633,
    description: 'ПСБ «Твой кешбэк»: бесплатная дебетовая карта + сертификат Пятёрочка 1 000 ₽ по условиям акции',
    title: 'ПСБ — дебетовая карта «Твой кешбэк»',
    category: 'debit',
    badges: ['25% кешбэк', 'Сертификат 1 000 ₽', 'Бесплатно'],
    updatedAt: '2026-04-08',
    eligibility: ['18+', 'Резиденты РФ', 'Новые клиенты ПСБ по условиям акции'],
    restrictions: ['Сертификат при выполнении условий акции', 'Ограничения по MCC и СБП'],
    publicDetails: 'Бонусы и акции действуют при выполнении условий банка',
    priority: 94,
  },
  // Т-Банк - Дебетовая карта ALL Airlines
  'tbank-all-airlines-debit': {
    url: 'https://trk.ppdu.ru/click/AxwkY87N?erid=2SDnjeBaaR6',
    bankId: 'tbank',
    productType: 'debit',
    erid: '2SDnjeBaaR6',
    description: 'Дебетовая карта ALL Airlines Т-Банк с промокодом LETIM2026',
    title: 'Т‑Банк ALL Airlines (дебетовая)',
    category: 'debit',
    badges: ['Мили', 'Промокод'],
    updatedAt: '2026-04-08',
    eligibility: ['18+', 'Онлайн-заявка'],
    publicDetails: 'Условия начисления бонусов — по правилам банка',
    priority: 70,
  },

  // Ренессанс Жизнь (НСЖ)
  'renlife-guaranteed-income': {
    url: 'https://trk.ppdu.ru/click/Np9sj7AZ?erid=2SDnjcfxx7T',
    bankId: 'renlife',
    productType: 'insurance',
    erid: '2SDnjcfxx7T',
    description: 'НСЖ «Гарантированный доход» — от 19% в первый год, подходит для налоговых вычетов',
    title: 'Ренессанс Жизнь — Гарантированный доход (НСЖ)',
    category: 'insurance',
    badges: ['НСЖ', 'Налоговый вычет', 'От 100 000 ₽'],
    updatedAt: '2026-04-08',
    eligibility: ['Подходит для долгосрочных накоплений', 'Взнос от 100 000 ₽'],
    restrictions: ['Срок программы от 5 лет'],
    publicDetails: 'Выплата по программе производится в конце срока договора',
    priority: 93,
  },
  'pari-tick-insurance': {
    url: 'https://trk.ppdu.ru/click/59pVcHwy?erid=2SDnjd4N5RD',
    bankId: 'pari',
    productType: 'insurance',
    erid: '2SDnjd4N5RD',
    description: 'СК ПАРИ «КлещOff»: страхование от укуса клеща с покрытием до 1 млн ₽',
    title: 'СК ПАРИ — страхование от укуса клеща',
    category: 'insurance',
    badges: ['Здоровье', 'РФ', 'Покрытие 1 млн ₽'],
    updatedAt: '2026-04-08',
    eligibility: ['Возраст от 1 до 80 лет', 'ГЕО: Россия'],
    restrictions: ['Не покрываются услуги без медицинских показаний и иные исключения программы'],
    publicDetails: 'Оформление и оплата полиса онлайн на сайте страховой компании',
    priority: 91,
  },
  'sber-insurance-all': {
    url: 'https://trk.ppdu.ru/click/uyes7Ttz?erid=2SDnje5WHbo',
    erid: '2SDnje5WHbo',
    bankId: 'sberbank',
    productType: 'insurance',
    description: 'Полис-конструктор «Защита на любой случай»: защита жилья, финансов, здоровья и от ДТП в одном полисе. Скидка 10% для подписчиков СберПрайм.',
    title: 'СберСтрахование — Комплексная защита',
    category: 'insurance',
    badges: ['СберБанк', 'Конструктор'],
    updatedAt: '2026-04-10',
    eligibility: ['Взрослым до 70 лет', 'Детям от 1 года'],
    publicDetails: 'Скидка 10% при добавлении 2 модулей, скидка 15% — от 3 модулей',
    priority: 100,
  },
  'pari-dms': {
    url: 'https://trk.ppdu.ru/click/a5NaNeX0?erid=2SDnjdyxgz7',
    erid: '2SDnjdyxgz7',
    bankId: 'sk-pari',
    productType: 'insurance',
    description: 'ДМС: диспансеризация, стоматология, ведение беременности. 300+ программ для детей, взрослых и пенсионеров.',
    title: 'СК ПАРИ — Полис ДМС',
    category: 'insurance',
    badges: ['ДМС', 'Здоровье'],
    updatedAt: '2026-04-08',
    eligibility: ['Москва и МО', 'Взрослые и дети'],
    publicDetails: 'Личный врач-куратор, скорая помощь, возможность купить онлайн.',
    priority: 99,
  },
  'vsk-osago': {
    url: 'https://trk.ppdu.ru/click/dpZrs2PD?erid=2SDnjckH5nw',
    erid: '2SDnjckH5nw',
    bankId: 'vsk',
    productType: 'insurance',
    description: 'Оформление и продление полиса ОСАГО без визита в офис. Урегулирование убытков за 1 час через мобильное приложение.',
    title: 'ВСК — электронный полис ОСАГО',
    category: 'insurance',
    badges: ['ОСАГО', 'Онлайн-оформление'],
    updatedAt: '2026-04-10',
    eligibility: ['Любой возраст', 'Все регионы РФ'],
    publicDetails: 'Оформление ДТП по европротоколу и денежное возмещение на карту',
    priority: 98,
  },
  'tbank-mortgage-insurance': {
    url: 'https://trk.ppdu.ru/click/XwVMdFnv?erid=2SDnjeYFJZe',
    erid: '2SDnjeYFJZe',
    bankId: 'tbank',
    productType: 'insurance',
    description: 'Страхование квартиры и заемщика по требованиям ЦБ РФ. Оплата картой и получение полиса онлайн.',
    title: 'Т‑Страхование — Ипотека',
    category: 'mortgage',
    badges: ['Ипотека', 'Т-Банк'],
    updatedAt: '2026-04-10',
    eligibility: ['Возраст от 21 до 54', 'РФ (кроме ЛНР/ДНР)'],
    publicDetails: 'Оформляется полностью онлайн. Готовый полис на e-mail.',
    priority: 97,
  },
  'vsk-kasko': {
    url: 'https://trk.ppdu.ru/click/mqYRntHD?erid=2SDnjeJfe47',
    erid: '2SDnjeJfe47',
    bankId: 'vsk',
    productType: 'insurance',
    description: 'Оформление КАСКО онлайн с рассрочкой и осмотром через приложение. Быстрое направление на ремонт в случае ДТП.',
    title: 'ВСК — КАСКО онлайн',
    category: 'insurance',
    badges: ['КАСКО', 'Онлайн-Осмотр'],
    updatedAt: '2026-04-10',
    eligibility: ['РФ', 'Любой автомобиль от 35 000 руб'],
    publicDetails: 'Дистанционное оформление. При звонке скажите, что с сайта Считай.RU',
    priority: 96,
  },
  'joymoney-loan': {
    url: 'https://trk.ppdu.ru/click/ZaiOEayY?erid=Kra23k98b',
    erid: 'Kra23k98b',
    bankId: 'joymoney',
    productType: 'loan',
    description: 'Получите займ за 5 минут. При погашении займа в первые 14 дней проценты не начисляются.',
    title: 'JoyMoney — первый займ 0%',
    category: 'loan',
    badges: ['0% первый займ', 'Без отказа'],
    updatedAt: '2026-04-10',
    eligibility: ['Гражданство РФ, от 18 лет', 'Только по паспорту и СНИЛС'],
    publicDetails: 'Одобрение даже с плохой кредитной историей или открытыми займами',
    priority: 95,
  },
  'zetta-vzr': {
    url: 'https://trk.ppdu.ru/click/6OxyALMQ?erid=2SDnjd5PFg5',
    erid: '2SDnjd5PFg5',
    bankId: 'zetta',
    productType: 'insurance',
    description: 'Медицинская туристическая страховка (ВЗР) с покрытием активного отдыха. Оплата врачей, госпитализации и транспортировки.',
    title: 'Zetta Страхование — ВЗР',
    category: 'insurance',
    badges: ['Туристам', 'Весь мир'],
    updatedAt: '2026-04-10',
    eligibility: ['Любое гражданство', 'Полисы от 2 до 365 дней'],
    publicDetails: 'Медицинская защита за границей, включая активный и экстремальный спорт.',
    priority: 94,
  },
  'goldapple-ecom': {
    url: 'https://trk.ppdu.ru/click/5uc2AHXO?erid=2SDnjdg2ZZk',
    bankId: 'goldapple',
    productType: 'ecom',
    erid: '2SDnjdg2ZZk',
    description: 'Интернет-магазин косметики и парфюмерии с регулярными акциями и доставкой по России.',
    title: 'Золотое Яблоко — косметика и парфюмерия',
    category: 'other',
    badges: ['E-com', 'Красота', 'Акции'],
    updatedAt: '2026-04-09',
    eligibility: ['Подходит для онлайн-покупок косметики и парфюмерии', 'Доставка по России'],
    restrictions: ['Заказы с промокодами сторонних площадок не учитываются', 'Заказы из мобильного приложения могут не учитываться'],
    publicDetails: 'Скидки, ассортимент и условия доставки зависят от текущей акции магазина.',
    internalNotes: 'Cookie TTL 30 дней, холд до 60 дней, учитывать ограничения оффера по промокодам и источникам.',
    priority: 88,
  },

  'ruki-vacancy-moscow': {
    url: 'https://trk.ppdu.ru/click/zWDbY2Cd?erid=2SDnjceSYW1',
    bankId: 'ruki',
    productType: 'vacancies',
    erid: '2SDnjceSYW1',
    description: 'Сервис «Руки»: вакансии мастеров по ремонту (двери/кухни), Москва',
    title: 'Сервис «Руки» — вакансии для мастеров',
    category: 'vacancies',
    badges: ['Вакансии', 'Москва', 'Трудоустройство', 'До 6 400 ₽'],
    updatedAt: '2026-04-08',
    eligibility: ['Мужчины 18+', 'Опыт от 1 года', 'Смартфон и инструменты'],
    restrictions: ['ГЕО: Москва', 'Требуется опыт работы от 1 года'],
    publicDetails: 'После заявки доступны этапы оформления по правилам сервиса',
    internalNotes: 'ГЕО: Москва, холд 30 дней',
    priority: 90,
  },
  // Добавьте свои партнерские ссылки здесь
};

/**
 * Получить партнерскую ссылку для продукта
 */
export function getAffiliateLink(
  bankId: string,
  productType?: string,
  productId?: string
): string | null {
  // Пробуем найти специфичную ссылку для продукта
  if (productId && AFFILIATE_LINKS[productId]) {
    return AFFILIATE_LINKS[productId].url;
  }
  
  // Пробуем найти ссылку для типа продукта
  if (productType) {
    const key = `${bankId}-${productType}`;
    if (AFFILIATE_LINKS[key]) {
      return AFFILIATE_LINKS[key].url;
    }
  }
  
  // Возвращаем общую ссылку банка
  if (AFFILIATE_LINKS[bankId]) {
    return AFFILIATE_LINKS[bankId].url;
  }
  
  return null;
}

/**
 * Получить информацию о комиссии
 */
export function getCommissionInfo(
  bankId: string,
  productType?: string
): number | null {
  if (productType) {
    const key = `${bankId}-${productType}`;
    if (AFFILIATE_LINKS[key]) {
      return AFFILIATE_LINKS[key].commission || null;
    }
  }
  
  if (AFFILIATE_LINKS[bankId]) {
    return AFFILIATE_LINKS[bankId].commission || null;
  }
  
  return null;
}
