import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { HealthService, type HealthStatus, type ReadinessStatus } from './health.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getStatus(): HealthStatus {
    return this.healthService.getStatus();
  }

  @Get('ready')
  async getReadiness(@Res({ passthrough: true }) response: Response): Promise<ReadinessStatus> {
    const readiness = await this.healthService.getReadiness();
    if (readiness.status === 'unavailable') response.status(HttpStatus.SERVICE_UNAVAILABLE);
    return readiness;
  }
}
