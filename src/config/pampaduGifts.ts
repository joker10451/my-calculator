export const PAMPADU_GIFTS = {
  widgetId: 'f6b829b7-5999-4af1-b10b-752e0ae5a79a',
  iframeBaseUrl: 'https://ppdu.ru/gifts',
  scriptUrl: 'https://ppdu.ru/ppdw.js',
  iframeId: 'ppdwiFlocktory',
  defaultHeight: 650,
  minWidth: 320,

  get directLink(): string {
    return `${this.iframeBaseUrl}/${this.widgetId}`;
  },

  get iframeSrc(): string {
    return `${this.iframeBaseUrl}/${this.widgetId}`;
  },
} as const;
