import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Cookies from 'js-cookie';

// Import translation files
import arTranslations from '../locales/ar.json';
import enTranslations from '../locales/en.json';

// Get saved language or default to Arabic
const savedLanguage = Cookies.get('language') || 'ar';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: {
        translation: arTranslations,
      },
      en: {
        translation: enTranslations,
      },
    },
    lng: savedLanguage,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;














