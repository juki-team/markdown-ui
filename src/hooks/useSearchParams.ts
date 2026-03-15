'use client';

import { usePathname, useRouter, useSearchParams as useSearchParamsRouter } from 'next/navigation';
import { useCallback } from 'react';
import { AppendSearchParamsType, DeleteSearchParamsType, SetSearchParamsType } from 'types';

export const useSearchParams = () => {
  const searchParams = useSearchParamsRouter();
  const router = useRouter();
  const pathname = usePathname();

  const updateSearchParams = useCallback(
    (params: URLSearchParams, replace: boolean = false) => {
      const url = `${pathname}?${params.toString()}`;
      replace ? router.replace(url) : router.push(url);
    },
    [pathname, router],
  );

  const appendSearchParams: AppendSearchParamsType = useCallback(
    (entries, replace) => {
      const params = new URLSearchParams(searchParams.toString());
      (Array.isArray(entries) ? entries : [entries]).forEach(({ name, value }) => params.set(name, value));
      updateSearchParams(params, replace);
    },
    [searchParams, updateSearchParams],
  );

  const setSearchParams: SetSearchParamsType = useCallback(
    (entries, replace) => {
      const params = new URLSearchParams(searchParams.toString());
      (Array.isArray(entries) ? entries : [entries]).forEach(({ name, value }) => {
        params.delete(name);
        (Array.isArray(value) ? value : [value]).forEach((v) => params.append(name, v));
      });
      updateSearchParams(params, true);
    },
    [searchParams, updateSearchParams],
  );

  const deleteSearchParams: DeleteSearchParamsType = useCallback(
    (entries, replace) => {
      const params = new URLSearchParams(searchParams.toString());
      (Array.isArray(entries) ? entries : [entries]).forEach(({ name, value }) => {
        const remaining = value !== undefined ? params.getAll(name).filter((v) => v !== value) : [];
        params.delete(name);
        remaining.forEach((v) => params.append(name, v));
      });
      updateSearchParams(params, replace);
    },
    [searchParams, updateSearchParams],
  );

  return {
    searchParams,
    appendSearchParams,
    deleteSearchParams,
    setSearchParams,
  };
};
