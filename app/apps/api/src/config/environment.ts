import { z } from 'zod';

const DEFAULT_PORT = 3000;
const DEFAULT_SESSION_MINUTES = 480;
const MINIMUM_SECRET_LENGTH = 32;
const DEFAULT_DATABASE_URL = 'postgresql://rental:rental@localhost:5432/rental_system';
const DEFAULT_SESSION_SECRET = 'development-only-session-secret-32-chars';
const DEFAULT_BODY_LIMIT = '256kb';
const DEFAULT_READ_PER_MINUTE = 120;
const DEFAULT_MUTATION_PER_MINUTE = 30;
const DEFAULT_LOGIN_PER_MINUTE = 20;
const DEFAULT_EXPORT_PER_TEN_MINUTES = 5;

const booleanFromString = z
  .enum(['true', 'false'])
  .default('true')
  .transform((value) => value === 'true');

const positiveInteger = z.coerce.number().int().positive();

const environmentSchema = z.object({
  APP_VERSION: z.string().default('0.1.0'),
  BODY_LIMIT: z
    .string()
    .regex(/^\d+(?:b|kb|mb)$/i)
    .default(DEFAULT_BODY_LIMIT),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().default(DEFAULT_DATABASE_URL),
  DEMO_MODE: booleanFromString,
  DEMO_OWNER_PASSWORD: z.string().default('OwnerDemo!2026'),
  DEMO_OWNER_USERNAME: z.string().default('owner'),
  DEMO_STAFF_PASSWORD: z.string().default('StaffDemo!2026'),
  DEMO_STAFF_USERNAME: z.string().default('staff'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: positiveInteger.default(DEFAULT_PORT),
  RATE_LIMIT_ENABLED: booleanFromString,
  RATE_LIMIT_EXPORT_PER_TEN_MINUTES: positiveInteger.default(DEFAULT_EXPORT_PER_TEN_MINUTES),
  RATE_LIMIT_LOGIN_PER_MINUTE: positiveInteger.default(DEFAULT_LOGIN_PER_MINUTE),
  RATE_LIMIT_MUTATION_PER_MINUTE: positiveInteger.default(DEFAULT_MUTATION_PER_MINUTE),
  RATE_LIMIT_READ_PER_MINUTE: positiveInteger.default(DEFAULT_READ_PER_MINUTE),
  SESSION_COOKIE_NAME: z.string().default('rental_session'),
  SESSION_SECRET: z.string().min(MINIMUM_SECRET_LENGTH).default(DEFAULT_SESSION_SECRET),
  SESSION_TTL_MINUTES: positiveInteger.default(DEFAULT_SESSION_MINUTES),
  TRUST_PROXY_HOPS: z.coerce.number().int().nonnegative().default(0),
});

export type Environment = z.infer<typeof environmentSchema>;
export type EnvironmentInput = Partial<Record<keyof Environment, string>>;

function enforceProductionPolicy(environment: Environment): void {
  if (environment.NODE_ENV !== 'production') return;
  if (environment.CORS_ORIGINS.split(',').includes('*')) {
    throw new Error('CORS wildcard is not allowed in production');
  }
  if (environment.DEMO_MODE) {
    throw new Error('Demo mode is not allowed in production');
  }
  if (environment.DATABASE_URL === DEFAULT_DATABASE_URL) {
    throw new Error('Production database must be configured explicitly');
  }
  if (environment.SESSION_SECRET === DEFAULT_SESSION_SECRET) {
    throw new Error('Production session secret must be configured explicitly');
  }
  if (!environment.RATE_LIMIT_ENABLED) {
    throw new Error('Rate limiting cannot be disabled in production');
  }
}

export function parseEnvironment(input: EnvironmentInput): Environment {
  const environment = environmentSchema.parse(input);
  enforceProductionPolicy(environment);
  return environment;
}
