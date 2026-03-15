'use client';

import { useRouter as useNextRouter } from 'next/navigation';
import { useCallback } from 'react';

export const useRouter = () => {
  const { push: pushRouter, replace: replaceRouter, ...rest } = useNextRouter();

  const push = useCallback(
    async (url: string) => {
      const result = await pushRouter(url);
      return result;
    },
    [pushRouter],
  );

  const replace = useCallback(
    async (url: string) => {
      const result = await replaceRouter(url);
      return result;
    },
    [replaceRouter],
  );

  return { push, replace, isLoadingRoute: false, ...rest };
};
