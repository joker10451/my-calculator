/**
 * Типы данных для интеграции Яндекс Кешбэка
 */

/**
 * Источники кешбэк событий
 */
export type CashbackSource = 'footer' | 'credit' | 'mortgage' | 'salary';

/**
 * Типы калькуляторов для контекстных советов
 */
export type CalculatorType = 'credit' | 'mortgage' | 'salary';

/**
 * Типы действий пользователя с кешбэком
 */
export type CashbackAction = 'view' | 'click';

/**
 * Конфигурация источника кешбэка
 */
export interface CashbackSourceConfig {
  enabled: boolean;
  message: string;
  utmSource: string;
  displayConditions?: {
    minAmount?: number;
    maxAmount?: number;
  };
}

/**
 * Основная конфигурация кешбэка
 */
export interface CashbackConfig {
  partnerUrl: string;
  isEnabled: boolean;
  sources: {
    footer: CashbackSourceConfig;
    calculators: Record<CalculatorType, CashbackSourceConfig>;
  };
}

/**
 * Событие аналитики кешбэка
 */
export interface CashbackEvent {
  source: CashbackSource;
  action: CashbackAction;
  amount?: number;
  timestamp: Date;
  sessionId: string;
}

/**
 * Параметры для генерации UTM меток
 */
export interface UTMParameters {
  source: string;
  medium: string;
  campaign: string;
  content?: string;
  term?: string;
}

/**
 * Пропсы для компонента CashbackFooterSection
 */
export interface CashbackFooterSectionProps {
  className?: string;
}

/**
 * Пропсы для компонента CashbackTip
 */
export interface CashbackTipProps {
  calculatorType: CalculatorType;
  amount?: number;
  className?: string;
}

/**
 * Интерфейс для хука аналитики кешбэка
 */
export interface CashbackAnalytics {
  trackClick: (source: CashbackSource, amount?: number) => void;
  trackView: (source: CashbackSource) => void;
}

/**
 * Результат генерации кешбэк ссылки
 */
export interface CashbackLinkResult {
  url: string;
  utmParameters: UTMParameters;
}

/**
 * Опции для генерации кешбэк сообщения
 */
export interface CashbackMessageOptions {
  calculatorType: CalculatorType;
  amount?: number;
  locale?: string;
}