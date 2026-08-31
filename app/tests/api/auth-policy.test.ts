import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createApiApp } from '../../apps/api/src/main';
import { readCookie } from '../../apps/api/src/common/http/cookies';
import { AuthRateLimitService } from '../../apps/api/src/modules/auth/auth-rate-limit.service';
import { AuthController } from '../../apps/api/src/modules/auth/auth.controller';
import type { AuthCookieService } from '../../apps/api/src/modules/auth/auth-cookie.service';
import type { AuthService } from '../../apps/api/src/modules/auth/auth.service';
import { AuthRepository } from '../../apps/api/src/modules/auth/auth.repository';
import { SecurityEventService } from '../../apps/api/src/modules/auth/security-event.service';

describe('Feature: Secure responsive operations preview — authentication policies', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createApiApp({ nodeEnv: 'test', demoMode: true });
  });

  afterEach(async () => {
    vi.useRealTimers();
    await app.close();
  });

  describe('Scenario: Active Owner signs in successfully', () => {
    it('creates a server-side session without exposing its identifier in JSON', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'owner', password: 'OwnerDemo!2026' })
        .expect(201);

      expect(response.headers['set-cookie']?.join(';')).toContain('rental_session=');
      expect(response.body).toMatchObject({ user: { role: 'OWNER' } });
      expect(response.body.sessionId).toBeUndefined();
      expect(JSON.stringify(response.body)).not.toMatch(/password|hash/i);
    });
  });

  describe('Scenario: Invalid credentials do not reveal whether an account exists', () => {
    it('returns the same safe response for unknown and incorrect credentials', async () => {
      const unknown = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'unknown', password: 'incorrect' })
        .expect(401);
      const known = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'owner', password: 'incorrect' })
        .expect(401);

      expect(unknown.body.message).toBe('Thông tin đăng nhập không hợp lệ');
      expect(known.body.message).toBe(unknown.body.message);
      expect(JSON.stringify(known.body)).not.toContain('password');
    });
  });

  describe('Scenario: Repeated login attempts are throttled', () => {
    it('returns 429 after the configured account and client threshold', async () => {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        await request(app.getHttpServer())
          .post('/api/auth/login')
          .set('x-forwarded-for', '203.0.113.10')
          .send({ username: 'owner', password: 'incorrect' })
          .expect(401);
      }

      const blocked = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('x-forwarded-for', '203.0.113.10')
        .send({ username: 'owner', password: 'incorrect' })
        .expect(429);

      expect(blocked.body.message).toContain('Thử lại');
      expect(JSON.stringify(blocked.body)).not.toContain('owner');
      const events = app.get(SecurityEventService).events();
      expect(events).toContainEqual({
        clientIdentifier: '::ffff:127.0.0.1',
        type: 'LOGIN_RATE_LIMITED',
      });
      expect(JSON.stringify(events)).not.toMatch(/password|session/i);
    });
  });

  describe('Scenario: Locked Staff cannot sign in or reuse an existing session', () => {
    it('revokes an earlier session when the account becomes inactive', async () => {
      const agent = request.agent(app.getHttpServer());
      await agent
        .post('/api/auth/login')
        .send({ username: 'staff', password: 'StaffDemo!2026' })
        .expect(201);
      await app.get(AuthRepository).setAccountActive('demo-staff', false);

      const blocked = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'staff', password: 'StaffDemo!2026' })
        .expect(401);

      expect(blocked.body.message).toBe('Tài khoản hiện không thể truy cập');
      await agent.get('/api/auth/session').expect(401);
    });
  });

  describe('Scenario: Staff cannot access Owner-only routes', () => {
    it('enforces session and role policy in the API', async () => {
      await request(app.getHttpServer()).get('/api/demo/vehicles').expect(401);
      const staff = request.agent(app.getHttpServer());
      await staff
        .post('/api/auth/login')
        .send({ username: 'staff', password: 'StaffDemo!2026' })
        .expect(201);
      await staff.get('/api/demo/vehicles').expect(200);
      await staff.get('/api/demo/reports').expect(403);

      const owner = request.agent(app.getHttpServer());
      await owner
        .post('/api/auth/login')
        .send({ username: 'owner', password: 'OwnerDemo!2026' })
        .expect(201);
      await owner.get('/api/demo/reports').expect(200);
    });
  });

  describe('Scenario: Cookie-authenticated mutation without CSRF proof is blocked', () => {
    it('rejects logout without the matching CSRF header', async () => {
      const agent = request.agent(app.getHttpServer());
      await agent
        .post('/api/auth/login')
        .send({ username: 'owner', password: 'OwnerDemo!2026' })
        .expect(201);

      await agent.post('/api/auth/logout').expect(403);
      await agent.get('/api/auth/session').expect(200);
    });

    it('rejects a forged CSRF pair even when both values match each other', async () => {
      const login = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'owner', password: 'OwnerDemo!2026' })
        .expect(201);
      const sessionCookie = login.headers['set-cookie']
        ?.find((cookie: string) => cookie.startsWith('rental_session='))
        ?.split(';')[0];

      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('cookie', `${sessionCookie}; rental_csrf=forged`)
        .set('x-csrf-token', 'forged')
        .expect(403);
    });

    it('allows logout with the issued CSRF proof and invalidates the session', async () => {
      const agent = request.agent(app.getHttpServer());
      const login = await agent
        .post('/api/auth/login')
        .send({ username: 'owner', password: 'OwnerDemo!2026' })
        .expect(201);
      const csrfToken = login.headers['set-cookie']
        ?.find((cookie: string) => cookie.startsWith('rental_csrf='))
        ?.split(';')[0]
        ?.split('=')[1];

      if (!csrfToken) throw new Error('Expected an issued CSRF cookie');
      await agent.post('/api/auth/logout').set('x-csrf-token', csrfToken).expect(204);
      await agent.get('/api/auth/session').expect(401);
    });
  });

  describe('Scenario: Boundary helpers reject stale or unrelated state', () => {
    it('decodes only the requested cookie', () => {
      const unrelated = { headers: { cookie: 'other=value' } } as Request;
      const encoded = { headers: { cookie: 'target=hello%20world; other=value' } } as Request;

      expect(readCookie(unrelated, 'target')).toBeUndefined();
      expect(readCookie(encoded, 'target')).toBe('hello world');
    });

    it('clears an expired login throttle window', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-08-31T00:00:00Z'));
      const events = new SecurityEventService();
      const rateLimit = new AuthRateLimitService(events);
      for (let attempt = 0; attempt < 5; attempt += 1) rateLimit.recordFailure('client:owner');
      vi.advanceTimersByTime(16 * 60_000);

      expect(() => rateLimit.assertAllowed('client:owner', 'client')).not.toThrow();
      expect(events.events()).toHaveLength(0);
    });

    it('clears response cookies even when logout has no session cookie', async () => {
      const logout = vi.fn();
      const clear = vi.fn();
      const controller = new AuthController(
        { logout } as unknown as AuthService,
        { clear, sessionName: () => 'rental_session' } as unknown as AuthCookieService,
      );

      await controller.logout({ headers: {} } as Request, {} as Response);

      expect(logout).not.toHaveBeenCalled();
      expect(clear).toHaveBeenCalledOnce();
    });
  });
});
