import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { ContextRequest } from '../http/request-context.js';

@Injectable()
export class OwnerAuthorizationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<ContextRequest>();
    if (request.authenticatedUser?.role !== 'OWNER') {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }
    return true;
  }
}
