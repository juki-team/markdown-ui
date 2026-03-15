'use client';

import { PageNotFound, T } from 'components';
import { jukiAppRoutes } from 'config';
import { useEffect } from 'hooks';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  
  const router = useRouter();
  
  useEffect(() => {
    setTimeout(() => router.replace(jukiAppRoutes.COACH().home()), 200);
  }, [ router ]);
  
  return (
    <PageNotFound style={{ height: 'var(--100VH) !important' }}>
      <h1><T className="tt-se">page not found</T></h1>
      <div className="jk-row" style={{ alignItems: 'baseline' }}>
        <T className="tt-se tx-l">redirecting to home</T>&nbsp;
        <div className="dot-flashing" />
      </div>
    </PageNotFound>
  );
}
