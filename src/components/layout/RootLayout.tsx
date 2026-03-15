'use client';

import { ErrorBoundary, Image, JukiProviders, NewVersionAvailable } from 'components';
import { jukiAppRoutes } from 'config';
import { NODE_ENV } from 'config/constants';
import { usePreloadComponents } from 'hooks';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Children, PropsWithChildren } from 'react';
import { SWRConfig } from 'swr';
import { useRouter } from '../../hooks/useRouter';
import { useSearchParams } from '../../hooks/useSearchParams';

const Analytics = dynamic(
  () => import('@vercel/analytics/react').then((m) => m.Analytics),
  { ssr: false },
);

const initialLastPath = {};

export const RootLayout = ({ children }: PropsWithChildren) => {
  const { isLoadingRoute, push, replace, refresh } = useRouter();
  const routerParams = useParams();
  const pathname = usePathname();
  const { searchParams, setSearchParams, deleteSearchParams, appendSearchParams } = useSearchParams();
  const preloaders = usePreloadComponents();

  const loadingBasic = preloaders.atoms && preloaders.molecules && preloaders.organisms;

  const app = (
    <SWRConfig
      value={{
        revalidateIfStale: true,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
      }}
    >
      <JukiProviders
        components={{ Image, Link }}
        router={{
          searchParams,
          setSearchParams,
          deleteSearchParams,
          appendSearchParams,
          pathname,
          routeParams: routerParams,
          pushRoute: push,
          replaceRoute: replace,
          reloadRoute: refresh,
          isLoadingRoute: isLoadingRoute || !loadingBasic,
        }}
        initialLastPath={initialLastPath}
        multiCompanies={false}
        onSeeMyProfile={(nickname, companyKey) => push(jukiAppRoutes.JUDGE().profiles.view({ nickname, companyKey }))}
      >
        {Children.toArray(children)}
        <Analytics />
        <NewVersionAvailable apiVersionUrl="/api/version" />
      </JukiProviders>
    </SWRConfig>
  );

  return NODE_ENV !== 'production' ? app : <ErrorBoundary reload={refresh}>{app}</ErrorBoundary>;
};
