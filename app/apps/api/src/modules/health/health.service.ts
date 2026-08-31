import { Injectable } from '@nestjs/common';

export interface HealthStatus {
  service: string;
  status: 'ok';
}

@Injectable()
export class HealthService {
  getStatus(): HealthStatus {
    return { service: 'rental-api', status: 'ok' };
  }
}
