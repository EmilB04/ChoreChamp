import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import deOnboarding from './locales/de/onboarding.json';
import enOnboarding from './locales/en/onboarding.json';
import esOnboarding from './locales/es/onboarding.json';
import nbOnboarding from './locales/nb/onboarding.json';

import dePermissions from './locales/de/permissions.json';
import enPermissions from './locales/en/permissions.json';
import esPermissions from './locales/es/permissions.json';
import nbPermissions from './locales/nb/permissions.json';

import deApp from './locales/de/app.json';
import enApp from './locales/en/app.json';
import esApp from './locales/es/app.json';
import nbApp from './locales/nb/app.json';

const resources = {
  en: { 
    onboarding: enOnboarding,
    permissions: enPermissions,
    app: enApp,
  },
  nb: { 
    onboarding: nbOnboarding,
    permissions: nbPermissions,
    app: nbApp,
  },
  es: { 
    onboarding: esOnboarding,
    permissions: esPermissions,
    app: esApp,
  },
  de: { 
    onboarding: deOnboarding,
    permissions: dePermissions,
    app: deApp,
  },
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
        ns: ['onboarding', 'permissions', 'app'],
        defaultNS: 'onboarding',
      interpolation: { escapeValue: false },
    });

  _i18nInitialized = true;
  return i18n;
}

export default i18n;