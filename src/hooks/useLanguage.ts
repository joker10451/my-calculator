/**
 * Хук для работы с текущим языком приложения
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { SupportedLanguage } from '@/types/blog';
import {
  getCurrentLanguage,
  setCurrentLanguage as saveLanguage,
  extractLanguageFromPath,
} from '@/utils/i18n';

export function useLanguage() {
  const location = useLocation();
  const [language, setLanguageState] = useState<SupportedLanguage>(getCurrentLanguage());

  // Обновляем язык при изменении URL
  useEffect(() => {
    const { language: langFromPath } = extractLanguageFromPath(location.pathname);
    
    // Если язык в URL отличается от сохраненного, обновляем
    if (langFromPath !== language) {
      setLanguageState(langFromPath);
      saveLanguage(langFromPath);
    }
  }, [location.pathname, language]);

  // Функция для изменения языка
  const setLanguage = (newLanguage: SupportedLanguage) => {
    setLanguageState(newLanguage);
    saveLanguage(newLanguage);
  };

  return {
    language,
    setLanguage,
    isRussian: language === 'ru',
    isEnglish: language === 'en',
  };
}
