import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import { createApiApp } from '../../apps/api/src/main';
import { parseEnvironment } from '../../apps/api/src/config/env.schema';

describe('Feature: Secure responsive operations preview — API boundary contract', () => {
  let app: INestApplication | undefined;

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  describe('Scenario: Unknown or invalid request fields are rejected safely', () => {
    it('returns a normalized 400 response with a request identifier', async () => {
      app = await createApiApp({ nodeEnv: 'test', demoMode: true });
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'owner', password: 'OwnerDemo!2026', admin: true })
        .expect(400);

      expect(response.body.requestId).toMatch(/^req_/);
      expect(JSON.stringify(response.body)).not.toMatch(/stack|sql|secret/i);
    });
  });

  describe('Scenario: Production API rejects an unapproved browser origin', () => {
    it('rejects wildcard credentialed CORS configuration', () => {
      expect(() =>
        parseEnvironment({
          NODE_ENV: 'production',
          DEMO_MODE: 'false',
          CORS_ORIGINS: '*',
        }),
      ).toThrow(/CORS/i);
    });

    it('does not grant CORS access to an unapproved origin', async () => {
      app = await createApiApp({
        nodeEnv: 'test',
        demoMode: true,
        corsOrigins: ['https://admin.example.com'],
      });
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .set('origin', 'https://unapproved.example.com')
        .expect(200);
      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  describe('Scenario: Production cannot expose demo endpoints', () => {
    it('fails startup validation when demo mode is enabled in production', () => {
      expect(() =>
        parseEnvironment({
          NODE_ENV: 'production',
          DEMO_MODE: 'true',
          CORS_ORIGINS: 'https://admin.example.com',
        }),
      ).toThrow(/demo/i);
    });

    it('does not mount demo routes in safe production configuration', async () => {
      app = await createApiApp({
        corsOrigins: ['https://admin.example.com'],
        demoMode: false,
        environment: {
          DATABASE_URL: 'postgresql://service:secret@db.example.com:5432/rental',
          SESSION_SECRET: 'production-test-session-secret-32-characters',
        },
        nodeEnv: 'production',
      });

      await request(app.getHttpServer()).get('/api/demo/dashboard').expect(404);
    });

    it('rejects production defaults for the database and session secret independently', () => {
      const safeBase = {
        CORS_ORIGINS: 'https://admin.example.com',
        DEMO_MODE: 'false',
        NODE_ENV: 'production',
      } as const;

      expect(() => parseEnvironment(safeBase)).toThrow(/database/i);
      expect(() =>
        parseEnvironment({
          ...safeBase,
          DATABASE_URL: 'postgresql://service:secret@db.example.com:5432/rental',
        }),
      ).toThrow(/session secret/i);
    });

    it('applies safe development defaults without production-only rejection', () => {
      const environment = parseEnvironment({ NODE_ENV: 'development' });

      expect(environment.DEMO_MODE).toBe(true);
      expect(environment.PORT).toBe(3000);
      expect(environment.SESSION_TTL_MINUTES).toBe(480);
    });
  });
});
