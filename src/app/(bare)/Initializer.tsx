'use client';

import { useEffect, useI18nStore, useInjectTheme } from 'hooks';
import { useSearchParams } from 'next/navigation';
import { Theme } from 'types';

export const Initializer = () => {
  const searchParams = useSearchParams();

  const language = searchParams.get('language');

  const theme = searchParams.get('theme');

  const changeLanguage = useI18nStore((state) => state.changeLanguage);
  useInjectTheme(theme === Theme.DARK ? Theme.DARK : Theme.LIGHT);

  useEffect(() => {
    if (language) {
      changeLanguage(language);
    }
  }, [changeLanguage, language]);
  return null;
};
