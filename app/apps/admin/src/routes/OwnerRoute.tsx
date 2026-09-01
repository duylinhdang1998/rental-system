import { Outlet } from 'react-router-dom';
import { useSession } from '../features/auth/hooks/use-session';
import { AccessDeniedPage } from '../shared/pages/AccessDeniedPage';

export function OwnerRoute() {
  const { user } = useSession();
  return user?.role === 'OWNER' ? <Outlet /> : <AccessDeniedPage />;
}
