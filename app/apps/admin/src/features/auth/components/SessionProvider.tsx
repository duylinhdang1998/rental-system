import type { ReactNode } from 'react';
import { SessionContext } from '../lib/session-context';
import { useSessionProvider } from '../hooks/use-session-provider';

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  return <SessionContext.Provider value={useSessionProvider()}>{children}</SessionContext.Provider>;
}
