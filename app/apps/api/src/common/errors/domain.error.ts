export type DomainErrorCode = 'CONFLICT' | 'FORBIDDEN' | 'INVALID_TRANSITION' | 'NOT_FOUND';

export class DomainError extends Error {
  constructor(
    readonly code: DomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
