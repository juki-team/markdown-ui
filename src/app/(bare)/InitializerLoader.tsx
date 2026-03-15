'use client';

import dynamic from 'next/dynamic';

const Initializer = dynamic(() => import('./Initializer').then((m) => m.Initializer), { ssr: false });

export function InitializerLoader() {
  return <Initializer />;
}
