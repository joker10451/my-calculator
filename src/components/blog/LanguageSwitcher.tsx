/**
 * Компонент переключателя языков для блога
 * Позволяет пользователю переключаться между доступными языками
 */

import { useTranslation } from 'react-i18next';
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
  setCurrentLanguage,
  getLanguageSwitchUrl,
} from '@/utils/i18n';

interface LanguageSwitcherProps {
  availableLanguages?: SupportedLanguage[];
  compact?: boolean;
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
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const currentLang = i18n.language as SupportedLanguage;

  // Определяем доступные языки
  const languages: SupportedLanguage[] = availableLanguages || ['ru', 'en'];

  // Обработчик переключения языка
  const handleLanguageChange = async (language: SupportedLanguage) => {
    // Сохраняем выбранный язык в localStorage
    setCurrentLanguage(language);

    // Меняем язык в i18next
    await i18n.changeLanguage(language);

    // Получаем новый URL с языковым префиксом
    const newUrl = getLanguageSwitchUrl(location.pathname, language);

    // Переходим на новый URL
    navigate(newUrl);
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
              {LANGUAGE_CODES[currentLang] || 'RU'}
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
