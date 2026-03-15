'use client';

import { T } from 'components';

export default function Loading() {
  return (
    <div className="expand-absolute jk-col">
      <h3 className="jk-row" style={{ alignItems: 'baseline' }}>
        <T className="tt-se">loading application</T>&nbsp;
        <div className="dot-flashing" />
      </h3>
    </div>
  );
}
