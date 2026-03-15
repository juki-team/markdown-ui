'use client';

import dynamic from 'next/dynamic';

export const JukiI18nInitializer = dynamic(
  () => import('@juki-team/base-ui').then((m) => m.JukiI18nInitializer),
  { ssr: false },
);
