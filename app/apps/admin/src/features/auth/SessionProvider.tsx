import type { AuthenticatedUser, LoginInput } from '@rental/contracts';
import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { loginRequest, restoreSessionRequest } from './auth-api';
import { SessionContext, type SessionContextValue } from './session-context';

interface SessionProviderProps {
  children: ReactNode;
}

function useRestoreSession(
  setUser: Dispatch<SetStateAction<AuthenticatedUser | null>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
) {
  useEffect(() => {
    const restore = async () => {
      try {
        setUser((await restoreSessionRequest())?.user ?? null);
      } finally {
        setLoading(false);
      }
    };
    void restore();
  }, [setLoading, setUser]);
}

function useSessionValue(): SessionContextValue {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useRestoreSession(setUser, setLoading);
  return useMemo<SessionContextValue>(
    () => ({
      error,
      loading,
      login: async (input: LoginInput) => {
        setError('');
        setLoading(true);
        try {
          setUser((await loginRequest(input)).user);
        } catch (reason) {
          setError(reason instanceof Error ? reason.message : 'Đã có lỗi xảy ra');
          throw reason;
        } finally {
          setLoading(false);
        }
      },
      user,
    }),
    [error, loading, user],
  );
}

export function SessionProvider({ children }: SessionProviderProps) {
  return <SessionContext.Provider value={useSessionValue()}>{children}</SessionContext.Provider>;
}
