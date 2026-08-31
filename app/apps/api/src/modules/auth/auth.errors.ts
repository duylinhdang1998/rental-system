export type AuthErrorCode =
  'ACCOUNT_UNAVAILABLE' | 'INVALID_CREDENTIALS' | 'RATE_LIMITED' | 'SESSION_INVALID';

export class AuthError extends Error {
  constructor(
    readonly code: AuthErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
