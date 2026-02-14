import { FORMAT_OPTIONS } from '../constants';
import type { FormatType, FormatOptions } from '../types/calculator';

/**
 * Универсальная функция форматирования значений
 */
export function formatValue(
  value: number,
  type: FormatType = 'number',
  options: Partial<FormatOptions> = {}
): string {
  const locale = options.locale || 'ru-RU';
  
  try {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat(locale, {
          ...FORMAT_OPTIONS.CURRENCY,
          currency: options.currency || 'RUB',
          minimumFractionDigits: options.minimumFractionDigits,
          maximumFractionDigits: options.maximumFractionDigits ?? FORMAT_OPTIONS.CURRENCY.maximumFractionDigits,
        }).format(value);
        
      case 'percent':
        return new Intl.NumberFormat(locale, {
          ...FORMAT_OPTIONS.PERCENT,
          minimumFractionDigits: options.minimumFractionDigits ?? FORMAT_OPTIONS.PERCENT.minimumFractionDigits,
          maximumFractionDigits: options.maximumFractionDigits ?? FORMAT_OPTIONS.PERCENT.maximumFractionDigits,
        }).format(value / 100);
        
      case 'number':
        return new Intl.NumberFormat(locale, {
          ...FORMAT_OPTIONS.NUMBER,
          minimumFractionDigits: options.minimumFractionDigits,
          maximumFractionDigits: options.maximumFractionDigits ?? FORMAT_OPTIONS.NUMBER.maximumFractionDigits,
        }).format(value);
        
      case 'date':
        return new Date(value).toLocaleDateString(locale);
        
      default:
        return String(value);
    }
  } catch (error) {
    console.warn('Format error:', error);
    return String(value);
  }
}

/**
 * Форматирование валюты (сокращенная версия)
 */
export const formatCurrency = (value: number, options?: Partial<FormatOptions>): string =>
  formatValue(value, 'currency', options);

/**
 * Форматирование процентов (сокращенная версия)
 */
export const formatPercent = (value: number, options?: Partial<FormatOptions>): string =>
  formatValue(value, 'percent', options);

/**
 * Форматирование чисел (сокращенная версия)
 */
export const formatNumber = (value: number, options?: Partial<FormatOptions>): string =>
  formatValue(value, 'number', options);

/**
 * Форматирование больших чисел с сокращениями (К, М, Б)
 */
export function formatCompactNumber(value: number, locale = 'ru-RU'): string {
  try {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(value);
  } catch (error) {
    // Fallback для старых браузеров
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}Б`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}М`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}К`;
    }
    return String(value);
  }
}

/**
 * Парсинг строки в число с учетом локали
 */
export function parseNumber(value: string, locale = 'ru-RU'): number {
  // Удаляем все символы кроме цифр, точек, запятых и знака минус
  const cleaned = value.replace(/[^\d.,-]/g, '');
  
  // Определяем разделитель десятичных знаков для локали
  const decimalSeparator = locale === 'ru-RU' ? ',' : '.';
  const thousandsSeparator = locale === 'ru-RU' ? ' ' : ',';
  
  // Заменяем разделители на стандартные
  const normalized = cleaned
    .replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '')
    .replace(decimalSeparator, '.');
  
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Форматирование диапазона значений
 */
export function formatRange(
  min: number,
  max: number,
  type: FormatType = 'number',
  options?: Partial<FormatOptions>
): string {
  const formattedMin = formatValue(min, type, options);
  const formattedMax = formatValue(max, type, options);
  return `${formattedMin} — ${formattedMax}`;
}

/**
 * Форматирование времени (месяцы в годы и месяцы)
 */
export function formatDuration(months: number): string {
  if (months < 12) {
    return `${months} мес.`;
  }
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (remainingMonths === 0) {
    return `${years} ${getYearWord(years)}`;
  }
  
  return `${years} ${getYearWord(years)} ${remainingMonths} мес.`;
}

/**
 * Получение правильного склонения слова "год"
 */
function getYearWord(years: number): string {
  const lastDigit = years % 10;
  const lastTwoDigits = years % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'лет';
  }
  
  if (lastDigit === 1) {
    return 'год';
  }
  
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'года';
  }
  
  return 'лет';
}