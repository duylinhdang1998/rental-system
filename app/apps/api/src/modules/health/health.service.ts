import { Inject, Injectable } from '@nestjs/common';
import { ENVIRONMENT } from '../../config/configuration.js';
import type { Environment } from '../../config/environment.js';
import { DATABASE_PROBE, type DatabaseCheck, type DatabaseProbe } from './database.probe.js';

export interface HealthStatus {
  service: string;
  status: 'ok';
}

export interface ReadinessStatus {
  checks: { database: DatabaseCheck };
  service: string;
  status: 'ok' | 'unavailable';
  uptimeSeconds: number;
  version: string;
}

const SERVICE_NAME = 'rental-api';

@Injectable()
export class HealthService {
  constructor(
    @Inject(DATABASE_PROBE) private readonly database: DatabaseProbe,
    @Inject(ENVIRONMENT) private readonly environment: Environment,
  ) {}

  /** Liveness: cheap and dependency-free so a slow database never restarts healthy pods. */
  getStatus(): HealthStatus {
    return { service: SERVICE_NAME, status: 'ok' };
  }

  /** Readiness: the load balancer only routes traffic when the database answers. */
  async getReadiness(): Promise<ReadinessStatus> {
    const database = await this.database.check();
    return {
      checks: { database },
      service: SERVICE_NAME,
      status: database === 'down' ? 'unavailable' : 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      version: this.environment.APP_VERSION,
    };
  }
}
