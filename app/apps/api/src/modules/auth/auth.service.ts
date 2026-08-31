import { randomBytes, timingSafeEqual } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import type { AuthenticatedUser, LoginInput } from '@rental/contracts';
import { hash, verify } from 'argon2';
import { ENVIRONMENT } from '../../config/configuration.js';
import type { Environment } from '../../config/environment.js';
import { MILLISECONDS_PER_MINUTE } from '../../common/time.js';
import { AuthRateLimitService } from './auth-rate-limit.service.js';
import { AuthError } from './auth.errors.js';
import { AuthRepository } from './auth.repository.js';
import { AuthTokenService } from './auth-token.service.js';
import type { AccountRecord, IssuedSession, SessionRecord } from './auth.types.js';

const SAFE_LOGIN_MESSAGE = 'Thông tin đăng nhập không hợp lệ';
const DUMMY_SECRET_BYTES = 32;

@Injectable()
export class AuthService {
  private readonly dummyHash = hash(randomBytes(DUMMY_SECRET_BYTES));

  constructor(
    private readonly repository: AuthRepository,
    @Inject(ENVIRONMENT) private readonly environment: Environment,
    private readonly rateLimit: AuthRateLimitService,
    private readonly tokens: AuthTokenService,
  ) {}

  async login(input: LoginInput, clientIdentifier: string): Promise<IssuedSession> {
    const rateLimitKey = `${clientIdentifier}:${input.username.toLowerCase()}`;
    this.rateLimit.assertAllowed(rateLimitKey, clientIdentifier);
    const account = await this.repository.findAccount(input.username);
    const passwordHash = account?.passwordHash ?? (await this.dummyHash);
    const passwordMatches = await verify(passwordHash, input.password);
    if (!account || !passwordMatches) {
      this.rateLimit.recordFailure(rateLimitKey);
      throw new AuthError('INVALID_CREDENTIALS', SAFE_LOGIN_MESSAGE);
    }
    if (!account.active)
      throw new AuthError('ACCOUNT_UNAVAILABLE', 'Tài khoản hiện không thể truy cập');
    this.rateLimit.clear(rateLimitKey);
    return this.createSession(this.toAuthenticatedUser(account));
  }

  async getUser(sessionToken: string): Promise<AuthenticatedUser> {
    const session = await this.findActiveSession(sessionToken);
    if (!session) throw new AuthError('SESSION_INVALID', 'Phiên đăng nhập không hợp lệ');
    return session.user;
  }

  async logout(sessionToken: string): Promise<void> {
    await this.repository.deleteSession(this.tokens.hash(sessionToken));
  }

  async validateCsrf(sessionToken: string, csrfToken: string): Promise<boolean> {
    const session = await this.findActiveSession(sessionToken);
    if (!session) return false;
    return this.safeEqual(this.tokens.hash(csrfToken), session.csrfHash);
  }

  private async createSession(account: AuthenticatedUser): Promise<IssuedSession> {
    const sessionToken = this.tokens.issue();
    const csrfToken = this.tokens.issue();
    const expiresAt = new Date(
      Date.now() + this.environment.SESSION_TTL_MINUTES * MILLISECONDS_PER_MINUTE,
    );
    await this.repository.createSession({
      csrfHash: csrfToken.hash,
      expiresAt,
      tokenHash: sessionToken.hash,
      user: account,
    });
    return { csrfToken: csrfToken.raw, sessionToken: sessionToken.raw, user: account };
  }

  private async findActiveSession(sessionToken: string): Promise<SessionRecord | null> {
    const tokenHash = this.tokens.hash(sessionToken);
    const session = await this.repository.findSession(tokenHash);
    if (!session) return null;
    const account = await this.repository.findAccountById(session.user.id);
    if (session.expiresAt.getTime() > Date.now() && account?.active) return session;
    await this.repository.deleteSession(tokenHash);
    return null;
  }

  private safeEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
  }

  private toAuthenticatedUser(account: AccountRecord): AuthenticatedUser {
    return {
      id: account.id,
      name: account.name,
      role: account.role,
      username: account.username,
    };
  }
}
