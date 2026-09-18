import { verify } from 'argon2';
import { describe, expect, it, vi } from 'vitest';
import { createEmployeeInputSchema, usernameSchema } from '@rental/contracts';
import {
  ownerSeedSchema,
  seedOwner,
  type SeedAccountData,
} from '../../apps/api/src/cli/seed-owner';
import { evaluateRestore, type RestoreSnapshot } from '../../apps/api/src/cli/verify-restore';
import { matchesAuditFilter } from '../../apps/api/src/common/audit/demo-audit.repository';
import { StructuredLogger, redact } from '../../apps/api/src/common/logging/structured-logger';
import {
  SlidingWindowCounter,
  buildPolicies,
  policyNameFor,
} from '../../apps/api/src/common/throttle/throttle.policy';
import { parseEnvironment } from '../../apps/api/src/config/environment';
import { auditFilterFrom } from '../../apps/api/src/modules/audit/audit-query.policy';
import { probeDatabase } from '../../apps/api/src/modules/health/database.probe';
import { HealthService } from '../../apps/api/src/modules/health/health.service';

const MINUTE = 60_000;
const NOW = new Date('2026-09-18T03:00:00.000Z').getTime();

function snapshot(overrides: Partial<RestoreSnapshot> = {}): RestoreSnapshot {
  return {
    activeOwners: 1,
    appliedMigrations: ['202608310001_init', '202609100002_payment_ledger'],
    counts: {
      accounts: 3,
      auditEvents: 40,
      contracts: 12,
      customers: 8,
      payments: 30,
      vehicles: 6,
    },
    ledgerMismatches: 0,
    negativeLedgers: 0,
    orphanPayments: 0,
    ...overrides,
  };
}

describe('Feature: Security hardening, observability and go-live readiness', () => {
  describe('Scenario: Abusive read traffic is throttled per session and per client', () => {
    it('allows the policy limit inside a sliding window and recovers after it', () => {
      const counter = new SlidingWindowCounter();
      const policy = { limit: 3, windowMs: MINUTE };
      expect(counter.hit('read:session:a', policy, NOW).allowed).toBe(true);
      expect(counter.hit('read:session:a', policy, NOW + 1_000).allowed).toBe(true);
      expect(counter.hit('read:session:a', policy, NOW + 2_000)).toMatchObject({
        allowed: true,
        remaining: 0,
      });
      const blocked = counter.hit('read:session:a', policy, NOW + 3_000);
      expect(blocked.allowed).toBe(false);
      expect(blocked.retryAfterSeconds).toBe(57);
      expect(counter.hit('read:session:b', policy, NOW + 3_000).allowed).toBe(true);
      expect(counter.hit('read:session:a', policy, NOW + MINUTE + 1).allowed).toBe(true);
      counter.prune(MINUTE, NOW + 3 * MINUTE);
      expect(counter.size()).toBe(0);
    });

    it('classifies safe methods as reads and everything else as mutations', () => {
      expect(policyNameFor('GET')).toBe('read');
      expect(policyNameFor('head')).toBe('read');
      expect(policyNameFor('POST')).toBe('mutation');
      expect(policyNameFor('GET', 'export')).toBe('export');
      expect(
        buildPolicies({
          exportPerTenMinutes: 5,
          loginPerMinute: 20,
          mutationPerMinute: 30,
          readPerMinute: 120,
        }),
      ).toMatchObject({ export: { limit: 5, windowMs: 10 * MINUTE }, read: { limit: 120 } });
    });

    it('refuses to start production with rate limiting disabled', () => {
      expect(() =>
        parseEnvironment({
          CORS_ORIGINS: 'https://admin.example.com',
          DATABASE_URL: 'postgresql://u:p@db/rental',
          DEMO_MODE: 'false',
          NODE_ENV: 'production',
          RATE_LIMIT_ENABLED: 'false',
          SESSION_SECRET: 'x'.repeat(40),
        }),
      ).toThrow(/Rate limiting/);
    });
  });

  describe('Scenario: Requests are logged as structured JSON with redaction', () => {
    it('masks credential-like fields at any depth and serializes errors safely', () => {
      expect(
        redact({
          list: [{ cookie: 'c', ok: 1 }],
          nested: { csrfToken: 'y', passwordHash: 'h', value: 'kept' },
          password: 'x',
        }),
      ).toEqual({
        list: [{ cookie: '[REDACTED]', ok: 1 }],
        nested: { csrfToken: '[REDACTED]', passwordHash: '[REDACTED]', value: 'kept' },
        password: '[REDACTED]',
      });
      expect(redact(new Error('boom'))).toEqual({ message: 'boom', name: 'Error' });
    });

    it('writes one JSON object per line with time and level', () => {
      const lines: string[] = [];
      const logger = new StructuredLogger((line) => lines.push(line));
      logger.log({ event: 'http.request', password: 'secret', status: 200 });
      expect(lines).toHaveLength(1);
      expect(lines[0]?.endsWith('\n')).toBe(true);
      const parsed = JSON.parse(lines[0] ?? '') as Record<string, unknown>;
      expect(parsed).toMatchObject({ event: 'http.request', level: 'info', status: 200 });
      expect(parsed.password).toBe('[REDACTED]');
      expect(typeof parsed.at).toBe('string');
    });
  });

  describe('Scenario: Readiness reflects the database while liveness stays cheap', () => {
    it('reports up, down and timed-out probes without hanging', async () => {
      const up = { $queryRaw: () => Promise.resolve([{ '?column?': 1 }]) };
      const down = { $queryRaw: () => Promise.reject(new Error('ECONNREFUSED')) };
      const hung = { $queryRaw: () => new Promise<never>(() => undefined) };
      expect(await probeDatabase(up)).toBe('up');
      expect(await probeDatabase(down)).toBe('down');
      expect(await probeDatabase(hung, 10)).toBe('down');
    });

    it('turns readiness into unavailable only when the database is down', async () => {
      const environment = parseEnvironment({ APP_VERSION: '1.2.3', NODE_ENV: 'test' });
      const unavailable = new HealthService({ check: () => Promise.resolve('down') }, environment);
      const demo = new HealthService({ check: () => Promise.resolve('demo') }, environment);
      expect(await unavailable.getReadiness()).toMatchObject({
        checks: { database: 'down' },
        status: 'unavailable',
        version: '1.2.3',
      });
      expect(await demo.getReadiness()).toMatchObject({ status: 'ok' });
      expect(demo.getStatus()).toEqual({ service: 'rental-api', status: 'ok' });
    });
  });

  describe('Scenario: Owner reviews sensitive changes in the audit log', () => {
    it('resolves business days to Asia/Ho_Chi_Minh instants and filters events', () => {
      const filter = auditFilterFrom({
        entityType: 'Contract',
        from: '2026-09-10',
        limit: 20,
        to: '2026-09-10',
      });
      expect(filter.from?.toISOString()).toBe('2026-09-09T17:00:00.000Z');
      expect(filter.to?.toISOString()).toBe('2026-09-10T16:59:59.999Z');
      const event = {
        action: 'CONTRACT_CREATED',
        actorId: 'staff',
        at: new Date('2026-09-10T02:00:00.000Z'),
        entityId: 'c1',
        entityType: 'Contract',
      };
      expect(matchesAuditFilter(event, filter)).toBe(true);
      expect(matchesAuditFilter({ ...event, entityType: 'Vehicle' }, filter)).toBe(false);
      expect(
        matchesAuditFilter({ ...event, at: new Date('2026-09-11T00:00:00.000Z') }, filter),
      ).toBe(false);
      expect(matchesAuditFilter(event, { actorId: 'owner', limit: 5 })).toBe(false);
    });
  });

  describe('Scenario Outline: Restore verification reconciles the ledger and rejects an empty restore', () => {
    it.each([
      { accounts: 3, contracts: 12, mismatches: 0, ok: true, payments: 30 },
      { accounts: 3, contracts: 12, mismatches: 1, ok: false, payments: 30 },
      { accounts: 0, contracts: 0, mismatches: 0, ok: false, payments: 0 },
      { accounts: 1, contracts: 5, mismatches: 0, ok: true, payments: 0 },
    ])(
      '$contracts contracts, $payments payments, $accounts accounts, $mismatches mismatches',
      ({ accounts, contracts, mismatches, ok, payments }) => {
        const verdict = evaluateRestore(
          snapshot({
            activeOwners: accounts > 0 ? 1 : 0,
            counts: { accounts, auditEvents: 0, contracts, customers: 0, payments, vehicles: 0 },
            ledgerMismatches: mismatches,
          }),
          ['202608310001_init', '202609100002_payment_ledger'],
        );
        expect(verdict.ok).toBe(ok);
      },
    );

    it('lists every missing migration, orphan payment and negative ledger as an issue', () => {
      const verdict = evaluateRestore(
        snapshot({
          appliedMigrations: ['202608310001_init'],
          negativeLedgers: 2,
          orphanPayments: 1,
        }),
        ['202608310001_init', '202609100002_payment_ledger'],
      );
      expect(verdict.ok).toBe(false);
      expect(verdict.issues).toEqual([
        '1 payment(s) reference a missing contract',
        '2 contract(s) refunded more than they collected',
        'Missing migration(s): 202609100002_payment_ledger',
      ]);
    });
  });

  describe('Scenario: Production starts with one Owner account and no demo data', () => {
    it('creates the Owner once with an argon2 hash and reports it on the second run', async () => {
      const created: SeedAccountData[] = [];
      const client = {
        create: vi.fn(async ({ data }: { data: SeedAccountData }) => {
          created.push(data);
          await Promise.resolve();
        }),
        findUnique: vi.fn(({ where }: { where: { username: string } }) =>
          Promise.resolve(created.find((row) => row.username === where.username) ?? null),
        ),
      };
      const input = ownerSeedSchema.parse({
        SEED_OWNER_PASSWORD: 'MatKhauChu!2026',
        SEED_OWNER_USERNAME: 'Chu.Cua.Hang',
      });
      expect(await seedOwner(client, input)).toEqual({
        outcome: 'created',
        username: 'chu.cua.hang',
      });
      expect(created[0]).toMatchObject({ active: true, name: 'Chủ cửa hàng', role: 'OWNER' });
      expect(await verify(created[0]?.passwordHash ?? '', 'MatKhauChu!2026')).toBe(true);
      expect(await seedOwner(client, input)).toEqual({
        outcome: 'exists',
        username: 'chu.cua.hang',
      });
      expect(client.create).toHaveBeenCalledTimes(1);
      expect(
        ownerSeedSchema.safeParse({ SEED_OWNER_PASSWORD: 'short', SEED_OWNER_USERNAME: 'owner' })
          .success,
      ).toBe(false);
    });
  });
});

describe('Feature: Employee account management', () => {
  describe('Scenario Outline: Employee input is validated', () => {
    it.each([
      ['nv.lan', 'MatKhau!2026x', true],
      ['nv', 'MatKhau!2026x', false],
      ['nv lan', 'MatKhau!2026x', false],
      ['nv.lan', 'short', false],
    ])('username "%s" with password "%s" → accepted %s', (username, password, accepted) => {
      const result = createEmployeeInputSchema.safeParse({
        name: 'Nguyễn Thị Lan',
        password,
        username,
      });
      expect(result.success).toBe(accepted);
      if (result.success) expect(result.data.role).toBe('STAFF');
    });

    it('normalizes usernames to lower case', () => {
      expect(usernameSchema.parse('  NV.Lan ')).toBe('nv.lan');
    });
  });
});
