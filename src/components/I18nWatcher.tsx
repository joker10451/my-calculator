import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { extractLanguageFromPath, setCurrentLanguage } from '@/utils/i18n';
import type { SupportedLanguage } from '@/types/blog';

export const I18nWatcher = () => {
    const { i18n } = useTranslation();
    const location = useLocation();

    useEffect(() => {
        const { language } = extractLanguageFromPath(location.pathname);

        if (i18n.language !== language) {
            i18n.changeLanguage(language);
            setCurrentLanguage(language as SupportedLanguage);
        }
    }, [location.pathname, i18n]);

    return null;
};
