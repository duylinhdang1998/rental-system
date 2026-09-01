import { useContext } from 'react';
import { SessionContext, type SessionContextValue } from '@/features/auth/lib/session-context';

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used inside SessionProvider');
  return context;
}
