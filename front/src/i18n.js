import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';

const savedLang = typeof window !== 'undefined' && localStorage.getItem('evalua-lang');

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      fr: { translation: fr },
    },
    lng: savedLang || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.body.style.direction = lng === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem('evalua-lang', lng);
    } catch (_) {}
  }
});

// Set initial dir/lang
if (typeof document !== 'undefined') {
  const lng = i18n.language;
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
}

export default i18n;
