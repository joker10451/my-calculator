import type { SupportedLanguage } from '@/types/blog';

const LANGUAGE_STORAGE_KEY = 'schitai-language';
const DEFAULT_LANGUAGE: SupportedLanguage = 'ru';

/**
 * Получить текущий язык из localStorage или использовать язык по умолчанию
 */
export function getCurrentLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }
  
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === 'ru' || stored === 'en') {
    return stored;
  }
  
  return DEFAULT_LANGUAGE;
}

/**
 * Установить текущий язык в localStorage
 */
export function setCurrentLanguage(language: SupportedLanguage): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}

/**
 * Получить префикс языка для URL
 */
export function getLanguagePrefix(language: SupportedLanguage): string {
  return language === DEFAULT_LANGUAGE ? '' : `/${language}`;
}

/**
 * Извлечь язык из пути URL
 */
export function extractLanguageFromPath(path: string): {
  language: SupportedLanguage;
  pathWithoutLanguage: string;
} {
  const match = path.match(/^\/(en|ru)(\/|$)/);
  
  if (match) {
    const language = match[1] as SupportedLanguage;
    const pathWithoutLanguage = path.replace(/^\/(en|ru)/, '') || '/';
    return { language, pathWithoutLanguage };
  }
  
  return { language: DEFAULT_LANGUAGE, pathWithoutLanguage: path };
}

/**
 * Построить URL с языковым префиксом
 */
export function buildLocalizedUrl(path: string, language: SupportedLanguage): string {
  const prefix = getLanguagePrefix(language);
  
  // Убираем начальный слеш если есть префикс
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${prefix}${cleanPath}`;
}

/**
 * Получить URL для переключения языка
 */
export function getLanguageSwitchUrl(currentPath: string, targetLanguage: SupportedLanguage): string {
  const { pathWithoutLanguage } = extractLanguageFromPath(currentPath);
  return buildLocalizedUrl(pathWithoutLanguage, targetLanguage);
}
