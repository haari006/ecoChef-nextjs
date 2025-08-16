'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { LanguageContext } from '@/hooks/use-language';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('language');
    if (storedLang && (storedLang === 'en' || storedLang === 'ms')) {
      setLanguage(storedLang);
    }
  }, []);

  const handleSetLanguage = (lang: string) => {
    if (lang === 'en' || lang === 'ms') {
      setLanguage(lang);
      localStorage.setItem('language', lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
