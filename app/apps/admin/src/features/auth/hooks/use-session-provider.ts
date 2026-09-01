import type { AuthenticatedUser, LoginInput } from '@rental/contracts';
import { useEffect, useMemo, useState } from 'react';
import { loginRequest, restoreSessionRequest } from '../api/auth-api';
import type { SessionContextValue } from '../lib/session-context';

export function useSessionProvider(): SessionContextValue {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    void restoreSessionRequest()
      .then((session) => setUser(session?.user ?? null))
      .finally(() => setLoading(false));
  }, []);
  return useMemo(
    () => ({ error, loading, login: login(setError, setLoading, setUser), user }),
    [error, loading, user],
  );
}

function login(
  setError: (value: string) => void,
  setLoading: (value: boolean) => void,
  setUser: (value: AuthenticatedUser) => void,
) {
  return async (input: LoginInput) => {
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
  };
}
