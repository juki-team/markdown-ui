'use client';

import { Button, PageNotFound, T } from 'components';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  
  return (
    <PageNotFound style={{ height: 'var(--100VH) !important' }}>
      <h1><T className="tt-se">page error</T></h1>
      <div className="cr-we bc-el jk-br-ie jk-pg-xsm" style={{ fontFamily: 'monospace' }}>
        {error.message}
      </div>
      <Button onClick={() => reset()}>
        <T>reload</T>
      </Button>
      <Button
        onClick={() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }}
      >
        <T>force reload</T>
      </Button>
    </PageNotFound>
  );
}
