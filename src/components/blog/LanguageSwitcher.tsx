/**
 * Компонент переключателя языков для блога
 * Позволяет пользователю переключаться между доступными языками
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SupportedLanguage } from '@/types/blog';
import {
  getCurrentLanguage,
  setCurrentLanguage,
  getLanguageSwitchUrl,
} from '@/utils/i18n';

interface LanguageSwitcherProps {
  /**
   * Доступные языки для текущей страницы
   * Если не указано, показываются все поддерживаемые языки
   */
  availableLanguages?: SupportedLanguage[];
  
  /**
   * Компактный режим (только иконка без текста)
   */
  compact?: boolean;
  
  /**
   * Класс для стилизации
   */
  className?: string;
}

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  ru: 'Русский',
  en: 'English',
};

const LANGUAGE_CODES: Record<SupportedLanguage, string> = {
  ru: 'RU',
  en: 'EN',
};

export function LanguageSwitcher({
  availableLanguages,
  compact = false,
  className = '',
}: LanguageSwitcherProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(getCurrentLanguage());

  // Обновляем текущий язык при изменении location
  useEffect(() => {
    const lang = getCurrentLanguage();
    setCurrentLang(lang);
  }, [location.pathname]);

  // Определяем доступные языки
  const languages: SupportedLanguage[] = availableLanguages || ['ru', 'en'];

  // Обработчик переключения языка
  const handleLanguageChange = (language: SupportedLanguage) => {
    // Сохраняем выбранный язык в localStorage
    setCurrentLanguage(language);
    setCurrentLang(language);

    // Получаем новый URL с языковым префиксом
    const newUrl = getLanguageSwitchUrl(location.pathname, language);
    
    // Переходим на новый URL
    navigate(newUrl);
    
    // Перезагружаем страницу для применения изменений
    // В production можно использовать более элегантное решение с контекстом
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? 'icon' : 'default'}
          className={className}
          aria-label="Выбрать язык"
        >
          <Globe className="h-5 w-5" />
          {!compact && (
            <span className="ml-2">
              {LANGUAGE_CODES[currentLang]}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={currentLang === lang ? 'bg-accent' : ''}
          >
            <span className="flex items-center gap-2">
              <span className="font-medium">{LANGUAGE_CODES[lang]}</span>
              <span className="text-muted-foreground">{LANGUAGE_NAMES[lang]}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Компактная версия переключателя языков для мобильных устройств
 */
export function LanguageSwitcherCompact(props: Omit<LanguageSwitcherProps, 'compact'>) {
  return <LanguageSwitcher {...props} compact />;
}
