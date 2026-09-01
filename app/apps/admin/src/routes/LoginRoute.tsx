import { Navigate } from 'react-router-dom';
import { LoginPage, useSession } from '@/features/auth';
import { LoadingScreen } from '@/shared/ui/LoadingScreen';

export function LoginRoute() {
  const { loading, user } = useSession();
  if (loading) return <LoadingScreen />;
  return user ? <Navigate replace to="/" /> : <LoginPage />;
}
