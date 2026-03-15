import { RootLayout, UserStoreProvider } from 'components';
import { jukiApiManager } from 'config';
import { EMPTY_COMPANY, EMPTY_USER } from 'config/constants';
import { get } from 'helpers';
import { type PropsWithChildren, Suspense } from 'react';
import './styles.scss';
import type { ContentResponse, PingResponseDTO } from 'types';
import { InitializerLoader } from './InitializerLoader';

const getInitialUser = async () => {
  const session = await get<ContentResponse<PingResponseDTO>>(jukiApiManager.API_V2.auth.ping().url);

  return {
    user: session?.success ? session?.content.user : EMPTY_USER,
    company: session?.success ? session?.content.company : EMPTY_COMPANY,
    isLoading: false,
  };
};

export default async function Layout({ children }: PropsWithChildren) {
  return (
    <UserStoreProvider initialUser={await getInitialUser()}>
      <InitializerLoader />
      <Suspense>
        <RootLayout>{children}</RootLayout>
      </Suspense>
    </UserStoreProvider>
  );
}
