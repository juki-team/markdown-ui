import { LoadingIcon } from '@juki-team/base-ui/server-components';

export default function Loading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <LoadingIcon />
    </div>
  );
}