import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApiApp, type ApiAppOptions } from '../../apps/api/src/main';
import { SecurityEventService } from '../../apps/api/src/modules/auth/security-event.service';
import { LifecycleClient } from './support/lifecycle-client';

const RANGE = 'from=2026-09-10&to=2026-09-11';

describe('Feature: Security hardening, observability and go-live readiness (API)', () => {
  let app: INestApplication;
  const lines: string[] = [];

  async function boot(environment: ApiAppOptions['environment'] = {}) {
    lines.length = 0;
    app = await createApiApp({
      demoMode: true,
      environment,
      logSink: (line) => lines.push(line),
      nodeEnv: 'test',
    });
    return app.getHttpServer();
  }

  function logs(): Record<string, unknown>[] {
    return lines.map((line) => JSON.parse(line) as Record<string, unknown>);
  }

  afterEach(async () => {
    vi.useRealTimers();
    await app.close();
  });

  describe('Scenario: Every response carries the hardened header set', () => {
    it('sets the helmet headers, hides the framework and returns the request id', async () => {
      const response = await request(await boot())
        .get('/api/health')
        .expect(200);
      expect(response.headers['content-security-policy']).toContain("default-src 'self'");
      expect(response.headers['strict-transport-security']).toContain('max-age');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['referrer-policy']).toBeDefined();
      expect(response.headers['x-powered-by']).toBeUndefined();
      expect(response.headers['x-request-id']).toMatch(/^req_/);
    });
  });

  describe('Scenario: Readiness reflects the database while liveness stays cheap', () => {
    it('answers liveness and a demo readiness with the running version', async () => {
      const server = await boot({ APP_VERSION: '7.0.0' });
      await request(server).get('/api/health').expect(200, { service: 'rental-api', status: 'ok' });
      const ready = await request(server).get('/api/health/ready').expect(200);
      expect(ready.body).toMatchObject({
        checks: { database: 'demo' },
        status: 'ok',
        version: '7.0.0',
      });
      expect(typeof ready.body.uptimeSeconds).toBe('number');
    });
  });

  describe('Scenario: Oversized request bodies are refused before validation', () => {
    it('returns the normalized 413 body without echoing the payload', async () => {
      const server = await boot({ BODY_LIMIT: '1kb' });
      const padding = 'A'.repeat(2_048);
      const response = await request(server)
        .post('/api/auth/login')
        .send({ password: padding, username: 'owner' })
        .expect(413);
      expect(response.body).toMatchObject({
        error: { code: 'PAYLOAD_TOO_LARGE', message: 'Yêu cầu quá lớn' },
        statusCode: 413,
      });
      expect(response.body.requestId).toMatch(/^req_/);
      expect(JSON.stringify(response.body)).not.toContain(padding);
    });
  });

  describe('Scenario: Abusive read traffic is throttled per session and per client', () => {
    it('rejects the request over the read limit, keeps other sessions and recovers', async () => {
      vi.useFakeTimers({ now: new Date('2026-09-18T03:00:00.000Z'), toFake: ['Date'] });
      const server = await boot({ RATE_LIMIT_READ_PER_MINUTE: '3' });
      const staff = await new LifecycleClient(app).login();
      const owner = await new LifecycleClient(app).login('owner', 'OwnerDemo!2026');
      for (let attempt = 0; attempt < 3; attempt += 1) {
        await staff.get('/api/fleet/vehicles').expect(200);
      }
      const blocked = await staff.get('/api/fleet/vehicles').expect(429);
      expect(blocked.headers['retry-after']).toMatch(/^\d+$/);
      expect(blocked.headers['x-ratelimit-remaining']).toBe('0');
      expect(blocked.body).toMatchObject({
        error: { code: 'TOO_MANY_REQUESTS' },
        message: 'Quá nhiều yêu cầu, vui lòng thử lại sau',
      });
      expect(blocked.body.requestId).toMatch(/^req_/);
      await owner.get('/api/fleet/vehicles').expect(200);
      await request(server).get('/api/health').expect(200);

      const events = app.get(SecurityEventService).events();
      const throttled = events.find((event) => event.type === 'REQUEST_RATE_LIMITED');
      expect(throttled).toMatchObject({ policy: 'read' });
      expect(throttled?.clientIdentifier).toMatch(/^session:[0-9a-f]{16}$/);
      const securityLine = logs().find((line) => line.event === 'security.event');
      expect(securityLine).toMatchObject({
        level: 'warn',
        policy: 'read',
        type: 'REQUEST_RATE_LIMITED',
      });

      vi.setSystemTime(new Date('2026-09-18T03:01:01.000Z'));
      await staff.get('/api/fleet/vehicles').expect(200);
    });
  });

  describe('Scenario: Mutations and exports have tighter policies than reads', () => {
    it('counts mutations separately from reads and logins', async () => {
      await boot({ RATE_LIMIT_MUTATION_PER_MINUTE: '2' });
      const staff = await new LifecycleClient(app).login();
      await staff.post('/api/contracts', {}).expect(400);
      await staff.post('/api/contracts', {}).expect(400);
      await staff.post('/api/contracts', {}).expect(429);
      await staff.get('/api/fleet/vehicles').expect(200);
    });

    it('limits workbook downloads per session while the report stays readable', async () => {
      await boot({ RATE_LIMIT_EXPORT_PER_TEN_MINUTES: '1' });
      const owner = await new LifecycleClient(app).login('owner', 'OwnerDemo!2026');
      await owner.get(`/api/reports/revenue/export?${RANGE}`).expect(200);
      await owner.get(`/api/reports/revenue/export?${RANGE}`).expect(429);
      await owner.get(`/api/reports/revenue?${RANGE}`).expect(200);
    });

    it('throttles login attempts per client before credentials are checked', async () => {
      const server = await boot({ RATE_LIMIT_LOGIN_PER_MINUTE: '2' });
      const attempt = () =>
        request(server).post('/api/auth/login').send({ password: 'wrong', username: 'owner' });
      await attempt().expect(401);
      await attempt().expect(401);
      const blocked = await attempt().expect(429);
      expect(blocked.headers['retry-after']).toBeDefined();
      expect(JSON.stringify(blocked.body)).not.toContain('wrong');
    });
  });

  describe('Scenario: Requests are logged as structured JSON with redaction', () => {
    it('logs every request with its route, status, actor and request id, never a secret', async () => {
      const server = await boot();
      const staff = await new LifecycleClient(app).login();
      const vehicles = await staff.get('/api/fleet/vehicles').expect(200);
      await request(server).get('/api/missing').expect(404);

      const entries = logs().filter((line) => line.event === 'http.request');
      const login = entries.find((line) => line.route === '/api/auth/login');
      expect(login).toMatchObject({ level: 'info', method: 'POST', status: 201 });
      expect(login?.requestId).toMatch(/^req_/);
      expect(typeof login?.durationMs).toBe('number');
      expect(entries.find((line) => line.route === '/api/fleet/vehicles')).toMatchObject({
        actorId: 'demo-staff',
        requestId: vehicles.headers['x-request-id'],
      });
      expect(entries.find((line) => line.status === 404)).toMatchObject({ level: 'warn' });
      const joined = lines.join('');
      expect(joined).not.toContain('StaffDemo!2026');
      expect(joined).not.toContain('rental_session=');
      expect(joined).not.toMatch(/"cookie"/i);
    });
  });
});
