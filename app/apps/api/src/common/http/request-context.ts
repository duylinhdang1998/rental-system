import type { Request } from 'express';
import type { AuthenticatedUser } from '@rental/contracts';

export interface ContextRequest extends Request {
  authenticatedUser?: AuthenticatedUser;
  requestId?: string;
}
