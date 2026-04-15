import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import de from './locales/de.json'

const savedLanguage = localStorage.getItem('preferredLanguage') || 'en'

i18n.use(initReactI18next).init({
  lng: savedLanguage,
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    de: { translation: de },
  },
  interpolation: { escapeValue: false },
  keySeparator: false,
})

export default i18n
