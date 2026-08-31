import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { readCookie } from '../../common/http/cookies.js';
import { AuthCookieService } from './auth-cookie.service.js';
import { AuthService } from './auth.service.js';

const CSRF_HEADER = 'x-csrf-token';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly cookies: AuthCookieService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionToken = readCookie(request, this.cookies.sessionName());
    const csrfCookie = readCookie(request, this.cookies.csrfName());
    const csrfHeader = request.header(CSRF_HEADER);
    if (!sessionToken || !csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      throw new ForbiddenException('CSRF token không hợp lệ');
    }
    const valid = await this.authService.validateCsrf(sessionToken, csrfHeader);
    if (!valid) throw new ForbiddenException('CSRF token không hợp lệ');
    return true;
  }
}
