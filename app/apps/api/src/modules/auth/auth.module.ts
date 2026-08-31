import { type DynamicModule, Global, Module, type Provider } from '@nestjs/common';
import { AuthenticationGuard } from '../../common/guards/authentication.guard.js';
import { OwnerAuthorizationGuard } from '../../common/guards/authorization.guard.js';
import { ENVIRONMENT } from '../../config/configuration.js';
import type { Environment } from '../../config/environment.js';
import { PrismaService } from '../../database/prisma.service.js';
import { AuthCookieService } from './auth-cookie.service.js';
import { AuthRateLimitService } from './auth-rate-limit.service.js';
import { AuthRepository } from './auth.repository.js';
import { ACCOUNT_REPOSITORY, SESSION_REPOSITORY } from './auth.tokens.js';
import { AuthTokenService } from './auth-token.service.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { CsrfGuard } from './csrf.guard.js';
import { DemoAccountRepository } from './demo-account.repository.js';
import { MemorySessionRepository } from './memory-session.repository.js';
import { PrismaAccountRepository } from './prisma-account.repository.js';
import { PrismaSessionRepository } from './prisma-session.repository.js';
import { SecurityEventService } from './security-event.service.js';

function repositoryProviders(environment: Environment): Provider[] {
  if (environment.DEMO_MODE) {
    return [
      { provide: ACCOUNT_REPOSITORY, useClass: DemoAccountRepository },
      { provide: SESSION_REPOSITORY, useClass: MemorySessionRepository },
    ];
  }
  return [
    PrismaService,
    { provide: ACCOUNT_REPOSITORY, useClass: PrismaAccountRepository },
    { provide: SESSION_REPOSITORY, useClass: PrismaSessionRepository },
  ];
}

@Global()
@Module({})
export class AuthModule {
  static register(environment: Environment): DynamicModule {
    return {
      controllers: [AuthController],
      module: AuthModule,
      providers: [
        { provide: ENVIRONMENT, useValue: environment },
        ...repositoryProviders(environment),
        AuthCookieService,
        AuthRateLimitService,
        AuthRepository,
        AuthService,
        AuthTokenService,
        AuthenticationGuard,
        CsrfGuard,
        OwnerAuthorizationGuard,
        SecurityEventService,
      ],
      exports: [
        AuthCookieService,
        AuthRepository,
        AuthService,
        AuthenticationGuard,
        OwnerAuthorizationGuard,
        SecurityEventService,
      ],
    };
  }
}
