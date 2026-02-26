import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';
import hi from './locales/hi.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import ja from './locales/ja.json';
import bn from './locales/bn.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      ar: { translation: ar },
      zh: { translation: zh },
      hi: { translation: hi },
      pt: { translation: pt },
      ru: { translation: ru },
      ja: { translation: ja },
      bn: { translation: bn }
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export const LANGUAGES = [
  { code: 'en', name: 'English', flag: 'EN' },
  { code: 'es', name: 'Espanol', flag: 'ES' },
  { code: 'fr', name: 'Francais', flag: 'FR' },
  { code: 'ar', name: 'العربية', flag: 'AR', rtl: true },
  { code: 'zh', name: '中文', flag: 'ZH' },
  { code: 'hi', name: 'हिन्दी', flag: 'HI' },
  { code: 'pt', name: 'Portugues', flag: 'PT' },
  { code: 'ru', name: 'Русский', flag: 'RU' },
  { code: 'ja', name: '日本語', flag: 'JA' },
  { code: 'bn', name: 'বাংলা', flag: 'BN' }
];

export default i18n;
