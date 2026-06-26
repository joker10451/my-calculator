/**
 * Конфигурация партнёрского виджета Pampadu (ОСАГО онлайн).
 *
 * Виджет загружается через iframe + скрипт `ppdw.js`, который Pampadu
 * использует для авто-ресайза. Идентификатор виджета зашит в URL после `#`
 * и выдаётся в личном кабинете Pampadu (раздел «Вебмастеру → код виджета»).
 *
 * При смене виджета достаточно поменять `WIDGET_ID` — остальное подтянется.
 */

export const PAMPADU_OSAGO = {
  /** ID виджета из ЛК Pampadu (часть URL после #) */
  widgetId: '6b93eb3b-21e5-4c9e-bc6c-f45d24835a83',

  /** Базовый URL iframe-виджета */
  iframeBaseUrl: 'https://b2c.pampadu.ru/index.html',

  /** URL скрипта авто-ресайза iframe от Pampadu */
  scriptUrl: 'https://b2c.pampadu.ru/ppdw.js',

  /** Высота iframe по умолчанию (px). Скрипт ppdw.js потом может её скорректировать. */
  defaultHeight: 650,

  /** Минимальная ширина (px) — требование Pampadu */
  minWidth: 320,

  /**
   * Прямая ссылка на расчёт — её можно отдавать в соцсетях/мессенджерах
   * или использовать как fallback, если iframe заблокирован.
   */
  get directLink(): string {
    return `${this.iframeBaseUrl}#${this.widgetId}`;
  },

  /** Полный src для iframe (с хеш-параметром) */
  get iframeSrc(): string {
    return `${this.iframeBaseUrl}#${this.widgetId}`;
  },
} as const;
