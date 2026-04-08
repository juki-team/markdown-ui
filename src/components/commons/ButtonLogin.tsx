'use client';

import { LoginUser } from 'components';
import { jukiAppRoutes } from 'config';
import { useRouterStore, useUserStore } from 'hooks';

export const ButtonLogin = () => {
  const pushRoute = useRouterStore((store) => store.pushRoute);
  const isLogged = useUserStore((store) => store.user.isLogged);

  if (isLogged) {
    return null;
  }

  return (
    <LoginUser
      withLabel
      isHorizontal={true}
      onSeeMyProfile={(nickname, companyKey) => pushRoute(jukiAppRoutes.JUDGE().profiles.view({ nickname, companyKey }))}
    />
  );
};
