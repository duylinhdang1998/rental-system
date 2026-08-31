import { Inject, Injectable } from '@nestjs/common';
import type { CookieOptions, Response } from 'express';
import { ENVIRONMENT } from '../../config/configuration.js';
import type { Environment } from '../../config/environment.js';
import { MILLISECONDS_PER_MINUTE } from '../../common/time.js';

const CSRF_COOKIE_NAME = 'rental_csrf';

@Injectable()
export class AuthCookieService {
  constructor(@Inject(ENVIRONMENT) private readonly environment: Environment) {}

  set(response: Response, sessionToken: string, csrfToken: string): void {
    response.cookie(this.environment.SESSION_COOKIE_NAME, sessionToken, this.sessionOptions());
    response.cookie(CSRF_COOKIE_NAME, csrfToken, this.csrfOptions());
  }

  clear(response: Response): void {
    response.clearCookie(this.environment.SESSION_COOKIE_NAME, this.sessionOptions());
    response.clearCookie(CSRF_COOKIE_NAME, this.csrfOptions());
  }

  sessionName(): string {
    return this.environment.SESSION_COOKIE_NAME;
  }

  csrfName(): string {
    return CSRF_COOKIE_NAME;
  }

  private sessionOptions(): CookieOptions {
    return { ...this.sharedOptions(), httpOnly: true };
  }

  private csrfOptions(): CookieOptions {
    return { ...this.sharedOptions(), httpOnly: false };
  }

  private sharedOptions(): CookieOptions {
    return {
      maxAge: this.environment.SESSION_TTL_MINUTES * MILLISECONDS_PER_MINUTE,
      path: '/',
      sameSite: 'strict',
      secure: this.environment.NODE_ENV === 'production',
    };
  }
}
