import { Outlet } from 'react-router-dom';
import { SessionProvider } from '@/features/auth';
import { QueryProvider } from '@/shared/query/QueryProvider';

export function BusinessProviders() {
  return (
    <QueryProvider>
      <SessionProvider>
        <Outlet />
      </SessionProvider>
    </QueryProvider>
  );
}
