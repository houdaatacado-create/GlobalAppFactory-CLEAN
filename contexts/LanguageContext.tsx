// Powered by OnSpace.AI
// Language Context - Global state for language + direction management
//
// Language resolution order:
//   1. Manual override stored in AsyncStorage (key: @noor_language_manual)
//   2. Device/system locale detected via expo-localization
//   3. English fallback for unsupported locales
//
// Migration: Old versions stored Arabic as default without a 'manual' flag.
// Those stored values are discarded so Portuguese/English etc. phones get
// their correct language after upgrading from an Arabic-default build.

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import {
  LanguageCode,
  TextDirection,
  translations,
  getLanguageFromLocale,
  getLanguageInfo,
  SUPPORTED_LANGUAGES,
  TranslationKey,
} from '../constants/i18n';

interface LanguageContextType {
  language: LanguageCode;
  direction: TextDirection;
  isRTL: boolean;
  t: (key: TranslationKey) => string;
  changeLanguage: (code: LanguageCode) => Promise<void>;
  /** Clears manual override; app returns to device language */
  useDeviceLanguage: () => Promise<void>;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
  appName: string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// @noor_language_manual → user explicitly chose a language; MUST be respected.
// @noor_language (legacy) → may have been auto-set to Arabic as old default; DISCARD unless confirmed manual.
const MANUAL_LANGUAGE_KEY = '@noor_language_manual';

/** Detect the real device language using expo-localization. */
function detectDeviceLanguage(): LanguageCode {
  try {
    // expo-localization: getLocales() returns ordered list of device locales
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
      const primary = locales[0].languageCode || locales[0].languageTag || 'en';
      return getLanguageFromLocale(primary);
    }
  } catch { /* ignore */ }
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Start with device language immediately (synchronous) to avoid Arabic flash
  const [language, setLanguage] = useState<LanguageCode>(() => detectDeviceLanguage());
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    resolveLanguage();
  }, []);

  const resolveLanguage = async () => {
    try {
      // Check for an EXPLICIT manual user override
      const manualChoice = await AsyncStorage.getItem(MANUAL_LANGUAGE_KEY);
      if (manualChoice && SUPPORTED_LANGUAGES.some(l => l.code === manualChoice)) {
        // User deliberately picked this language — honour it
        setLanguage(manualChoice as LanguageCode);
      } else {
        // No manual override: always use device language
        // This also handles the legacy Arabic-default migration:
        // old @noor_language entries are ignored because we only read
        // @noor_language_manual, so an Arabic-default phone that never
        // explicitly chose Arabic will now correctly get its device language.
        const deviceLang = detectDeviceLanguage();
        setLanguage(deviceLang);
      }
    } catch {
      setLanguage(detectDeviceLanguage());
    } finally {
      setInitialized(true);
    }
  };

  const changeLanguage = async (code: LanguageCode) => {
    try {
      if (code === detectDeviceLanguage()) {
        // User selected their device language — treat as "use device language" (clear manual override)
        await AsyncStorage.removeItem(MANUAL_LANGUAGE_KEY);
      } else {
        // Explicit manual override
        await AsyncStorage.setItem(MANUAL_LANGUAGE_KEY, code);
      }
      setLanguage(code);
    } catch {
      setLanguage(code);
    }
  };

  /** Clears manual override and reverts to device language. */
  const useDeviceLanguage = async () => {
    try {
      await AsyncStorage.removeItem(MANUAL_LANGUAGE_KEY);
    } catch { /* ignore */ }
    const deviceLang = detectDeviceLanguage();
    setLanguage(deviceLang);
  };

  const langInfo = getLanguageInfo(language);
  const direction: TextDirection = langInfo.direction;
  const isRTL = direction === 'rtl';

  const t = (key: TranslationKey): string => {
    const langTranslations = translations[language] as Record<string, string>;
    const fallback = translations['ar'] as Record<string, string>;
    return langTranslations?.[key] || fallback?.[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{
      language,
      direction,
      isRTL,
      t,
      changeLanguage,
      useDeviceLanguage,
      supportedLanguages: SUPPORTED_LANGUAGES,
      appName: t('appName'),
    }}>
      {children}
    </LanguageContext.Provider>
  );
}
