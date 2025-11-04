import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en/onboarding.json';
import no from './locales/no/onboarding.json';
import es from './locales/es/onboarding.json';
import de from './locales/de/onboarding.json';

const resources = {
  en: { onboarding: en },
  no: { onboarding: no },
  es: { onboarding: es },
  de: { onboarding: de },
};

let _i18nInitialized = false;

export async function initI18n() {
  if (_i18nInitialized) {
    return i18n;
  }

  const storedLanguage = await AsyncStorage.getItem('appLanguage');

  const locales = Localization.getLocales();
  const deviceLanguage = locales.length > 0 ? locales[0].languageCode : 'en';

  const defaultLanguage = storedLanguage || deviceLanguage || 'en';

  await i18n
    .use(initReactI18next)
    .init({
      lng: defaultLanguage,
      fallbackLng: 'en',
      resources,
      ns: ['onboarding'],
      defaultNS: 'onboarding',
      interpolation: { escapeValue: false },
    });

  _i18nInitialized = true;
  return i18n;
}

export default i18n;