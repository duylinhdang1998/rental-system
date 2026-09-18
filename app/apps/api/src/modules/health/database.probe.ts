import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

export const DATABASE_PROBE = Symbol('DATABASE_PROBE');
export type DatabaseCheck = 'demo' | 'down' | 'up';

export interface DatabaseProbe {
  check(): Promise<DatabaseCheck>;
}

const PROBE_TIMEOUT_MS = 2_000;

/** Demo mode has no database; readiness reports it explicitly instead of pretending. */
@Injectable()
export class DemoDatabaseProbe implements DatabaseProbe {
  check(): Promise<DatabaseCheck> {
    return Promise.resolve('demo');
  }
}

export interface ProbeClient {
  $queryRaw(query: TemplateStringsArray, ...values: unknown[]): Promise<unknown>;
}

export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error('Database probe timed out')), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** A bounded `SELECT 1`: a hung pool must turn readiness red, not hang the probe. */
export async function probeDatabase(client: ProbeClient, timeoutMs = PROBE_TIMEOUT_MS) {
  try {
    await withTimeout(client.$queryRaw`SELECT 1`, timeoutMs);
    return 'up' as const;
  } catch {
    return 'down' as const;
  }
}

@Injectable()
export class PrismaDatabaseProbe implements DatabaseProbe {
  constructor(private readonly prisma: PrismaService) {}

  check(): Promise<DatabaseCheck> {
    return probeDatabase(this.prisma);
  }
}
