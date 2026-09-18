/** Business-rule failures; `api-exception.filter.ts` maps every code to one HTTP status. */
export type DomainErrorCode =
  | 'CASH_SHIFT_ALREADY_OPEN'
  | 'CASH_SHIFT_NOTE_REQUIRED'
  | 'CASH_SHIFT_NOT_OPEN'
  | 'CONFLICT'
  | 'CONTRACT_NOT_SETTLED'
  | 'DAMAGE_ITEM_EXISTS'
  | 'DAMAGE_ITEM_INACTIVE'
  | 'DAMAGE_ITEM_NOT_FOUND'
  | 'DEPOSIT_ALREADY_REFUNDED'
  | 'FORBIDDEN'
  | 'INVALID_INPUT'
  | 'INVALID_TRANSITION'
  | 'NOT_FOUND'
  | 'NO_DEPOSIT_REFUND_DUE'
  | 'TOO_MANY_FILES'
  | 'UNSUPPORTED_FILE';

export class DomainError extends Error {
  constructor(
    readonly code: DomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
