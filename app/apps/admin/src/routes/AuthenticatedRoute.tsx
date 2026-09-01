import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../features/auth/hooks/use-session';
import { LoadingScreen } from '../shared/ui/LoadingScreen';

export function AuthenticatedRoute() {
  const { loading, user } = useSession();
  if (loading) return <LoadingScreen />;
  return user ? <Outlet /> : <Navigate replace to="/login" />;
}
