import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { readCookie } from '../http/cookies.js';
import type { ContextRequest } from '../http/request-context.js';
import { AuthCookieService } from '../../modules/auth/auth-cookie.service.js';
import { AuthService } from '../../modules/auth/auth.service.js';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly cookies: AuthCookieService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ContextRequest>();
    const sessionToken = readCookie(request, this.cookies.sessionName());
    if (!sessionToken) throw new UnauthorizedException('Chưa đăng nhập');
    request.authenticatedUser = await this.authService.getUser(sessionToken);
    return true;
  }
}
