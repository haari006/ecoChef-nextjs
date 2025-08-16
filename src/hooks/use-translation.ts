'use client';

import { useCallback } from 'react';
import { useLanguage } from './use-language';
import en from '@/lib/locales/en.json';
import ms from '@/lib/locales/ms.json';

const translations = {
  en,
  ms,
};

type TranslationKey = keyof typeof en;

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = useCallback(
    (key: string, options?: { count?: number }) => {
      const keys = key.split('.');
      let text = (translations[language] as any);
      for(const k of keys) {
        if(text && typeof text === 'object' && k in text) {
            text = text[k];
        } else {
            // Fallback to English if key not found in current language
            let fallbackText = (translations.en as any);
            for(const fk of keys) {
                if(fallbackText && typeof fallbackText === 'object' && fk in fallbackText) {
                    fallbackText = fallbackText[fk];
                } else {
                    return key; // Return the key itself if not found anywhere
                }
            }
            text = fallbackText;
            break;
        }
      }

      if (typeof text !== 'string') {
        return key;
      }
      
      if(options?.count !== undefined) {
        text = text.replace('{{count}}', options.count.toString());
        if (options.count > 1) {
            // Very simple pluralization, can be expanded
            text = text.replace('(s)', 's'); 
        } else {
            text = text.replace('(s)', '');
        }
      }

      return text;
    },
    [language]
  );

  return { t };
};
