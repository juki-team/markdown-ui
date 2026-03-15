'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const Styles = dynamic(() => import('./Styles'), {
  ssr: false,
  loading: () => null,
});

export const StylesLazy = () => {
  const [render, setRender] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setRender(true);
    }, 200);
  }, []);

  if (render) {
    return <Styles />;
  }

  return null;
};
