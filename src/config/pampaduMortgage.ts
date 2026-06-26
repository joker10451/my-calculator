/**
 * Конфигурация партнёрского виджета Pampadu (Страхование ипотеки).
 *
 * Виджет загружается через iframe + скрипт `ppdw.js`, который Pampadu
 * использует для авто-ресайза. Идентификатор виджета зашит в URL после `#`
 * и выдаётся в личном кабинете Pampadu (раздел «Вебмастеру → код виджета»).
 *
 * При смене виджета достаточно поменять `WIDGET_ID` — остальное подтянется.
 */

export const PAMPADU_MORTGAGE = {
  /** ID виджета из ЛК Pampadu (часть URL после #) */
  widgetId: 'b65f871c-5619-4839-8290-f8c4a0f90657',

  /** Базовый URL iframe-виджета */
  iframeBaseUrl: 'https://ipoteka.pampadu.ru/index.html',

  /** URL скрипта авто-ресайза iframe от Pampadu */
  scriptUrl: 'https://ipoteka.pampadu.ru/app/ppdw.js',

  /** HTML id iframe — Pampadu требует ppdwiIpoteka для ипотечного виджета */
  iframeId: 'ppdwiIpoteka',

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
