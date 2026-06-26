/**
 * Конфигурация партнёрского виджета Pampadu (Каталог предложений).
 *
 * Виджет загружается через iframe + скрипт `ppdw.js` с домена ppdu.ru.
 * Идентификатор виджета зашит в URL пути.
 */

export const PAMPADU_OFFERS = {
  /** ID виджета из ЛК Pampadu (часть URL пути) */
  widgetId: '41ef6068-a4eb-4179-a855-6c0270f8acf0',

  /** Базовый URL iframe-виджета */
  iframeBaseUrl: 'https://ppdu.ru',

  /** URL скрипта авто-ресайза iframe от Pampadu */
  scriptUrl: 'https://ppdu.ru/ppdw.js',

  /** HTML id iframe */
  iframeId: 'ppdwiOffer',

  /** Высота iframe по умолчанию (px) */
  defaultHeight: 650,

  /** Минимальная ширина (px) — требование Pampadu */
  minWidth: 320,

  /** Прямая ссылка на виджет */
  get directLink(): string {
    return `${this.iframeBaseUrl}/${this.widgetId}`;
  },

  /** Полный src для iframe */
  get iframeSrc(): string {
    return `${this.iframeBaseUrl}/${this.widgetId}`;
  },
} as const;
