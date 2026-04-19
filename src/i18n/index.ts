import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en } },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

// Force LTR — Urdu/RTL support has been removed.
if (typeof document !== 'undefined') {
  document.documentElement.dir = 'ltr';
  document.documentElement.lang = 'en';
  try {
    localStorage.removeItem('i18nextLng');
  } catch {
    /* ignore */
  }
}

export default i18n;
