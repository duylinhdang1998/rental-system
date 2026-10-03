import { useState } from 'react';
import { logoutRequest } from '@/features/auth/api/auth-api';

export function useLogout() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  async function logout() {
    setPending(true);
    setError(false);
    try {
      await logoutRequest();
      window.location.assign('/login');
    } catch {
      setError(true);
      setPending(false);
    }
  }
  return { pending, error, logout };
}
