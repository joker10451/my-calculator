import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Минимальная инициализация i18n — без HTTP backend (переводы не используются)
i18n
    .use(initReactI18next)
    .init({
        lng: 'ru',
        fallbackLng: 'ru',
        interpolation: {
            escapeValue: false,
        },
        resources: {
            ru: { common: {} },
        },
        ns: ['common'],
        defaultNS: 'common',
    });

export default i18n;
