import { useState, useEffect } from 'react';
import { en, zh } from '../i18n/locales';
import { Language, Translations } from '../types';

// Helper to get nested value from object using dot notation
const getNestedValue = (obj: any, path: string): string => {
  return path.split('.').reduce((prev, curr) => {
    return prev ? prev[curr] : null;
  }, obj) || path;
};

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Translations>(en);

  useEffect(() => {
    setTranslations(language === 'zh' ?zh : en);
  }, [language]);

  const t = (key: string): string => {
    return getNestedValue(translations, key);
  };

  return { t, language, setLanguage };
};