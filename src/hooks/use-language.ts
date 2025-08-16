'use client';

import { createContext, useContext } from 'react';

type LanguageContextType = {
  language: 'en' | 'ms';
  setLanguage: (language: 'en' | 'ms') => void;
};

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

export const useLanguage = () => {
    return useContext(LanguageContext);
};
