/**
 * Утилиты для работы с кешбэком
 */

import { 
  CashbackSource, 
  CalculatorType, 
  UTMParameters, 
  CashbackLinkResult,
  CashbackMessageOptions 
} from '../types/cashback';
import { cashbackConfig, cashbackMessages } from '../config/cashback';

/**
 * Генерирует UTM параметры для отслеживания источника трафика
 */
export function generateUTMParameters(
  source: CashbackSource,
  amount?: number
): UTMParameters {
  const baseParams: UTMParameters = {
    source: getUTMSource(source),
    medium: 'referral',
    campaign: 'calculator_integration',
  };

  // Добавляем дополнительную информацию в content если есть сумма
  if (amount !== undefined) {
    baseParams.content = `amount_${Math.floor(amount / 1000)}k`;
  }

  return baseParams;
}

/**
 * Получает UTM source на основе источника кешбэка
 */
function getUTMSource(source: CashbackSource): string {
  const sourceMap: Record<CashbackSource, string> = {
    footer: cashbackConfig.sources.footer.utmSource,
    credit: cashbackConfig.sources.calculators.credit.utmSource,
    mortgage: cashbackConfig.sources.calculators.mortgage.utmSource,
    salary: cashbackConfig.sources.calculators.salary.utmSource,
  };

  return sourceMap[source] || 'unknown';
}

/**
 * Генерирует полную кешбэк ссылку с UTM параметрами
 */
export function generateCashbackUrl(
  source: CashbackSource,
  amount?: number
): CashbackLinkResult {
  const utmParameters = generateUTMParameters(source, amount);
  const baseUrl = cashbackConfig.partnerUrl;
  
  if (!baseUrl) {
    throw new Error('Partner URL is not configured');
  }
  
  // Создаем URL с UTM параметрами
  const url = new URL(baseUrl);
  
  if (!url.searchParams) {
    throw new Error('URL searchParams is not available');
  }
  
  url.searchParams.set('utm_source', utmParameters.source);
  url.searchParams.set('utm_medium', utmParameters.medium);
  url.searchParams.set('utm_campaign', utmParameters.campaign);
  
  // Добавляем опциональные параметры только если они определены
  if (utmParameters.content !== undefined && utmParameters.content !== null) {
    url.searchParams.set('utm_content', utmParameters.content);
  }
  
  if (utmParameters.term !== undefined && utmParameters.term !== null) {
    url.searchParams.set('utm_term', utmParameters.term);
  }

  return {
    url: url.toString(),
    utmParameters,
  };
}

/**
 * Получает сообщение кешбэка для конкретного типа калькулятора
 */
export function getCashbackMessage(options: CashbackMessageOptions): string {
  const { calculatorType, locale = 'ru' } = options;
  
  const messages = cashbackMessages[locale as keyof typeof cashbackMessages];
  if (!messages) {
    return cashbackMessages.ru[calculatorType];
  }

  return messages[calculatorType];
}

/**
 * Проверяет, должен ли отображаться совет кешбэка для данного калькулятора
 */
export function shouldShowCashbackTip(
  calculatorType: CalculatorType,
  amount?: number
): boolean {
  if (!cashbackConfig.isEnabled) {
    return false;
  }

  const config = cashbackConfig.sources.calculators[calculatorType];
  if (!config || !config.enabled) {
    return false;
  }

  // Проверяем условия отображения
  if (config.displayConditions && amount !== undefined) {
    const { minAmount, maxAmount } = config.displayConditions;
    
    if (minAmount !== undefined && amount < minAmount) {
      return false;
    }
    
    if (maxAmount !== undefined && amount > maxAmount) {
      return false;
    }
  }

  return true;
}

/**
 * Генерирует уникальный ID сессии для аналитики
 */
export function generateSessionId(): string {
  return `cashback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Получает или создает ID сессии из sessionStorage
 */
export function getOrCreateSessionId(): string {
  const storageKey = 'cashback_session_id';
  
  try {
    let sessionId = sessionStorage.getItem(storageKey);
    
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem(storageKey, sessionId);
    }
    
    return sessionId;
  } catch (error) {
    // Fallback если sessionStorage недоступен
    return generateSessionId();
  }
}

/**
 * Валидирует партнерскую ссылку
 */
export function validatePartnerUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' && parsedUrl.hostname.includes('ya.cc');
  } catch {
    return false;
  }
}