import type { AuthenticatedUser, LoginInput } from '@rental/contracts';
import { createContext } from 'react';

export interface SessionContextValue {
  error: string;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  user: AuthenticatedUser | null;
}

export const SessionContext = createContext<SessionContextValue | null>(null);
