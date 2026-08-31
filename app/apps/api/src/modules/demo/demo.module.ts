import { Module } from '@nestjs/common';
import { DemoDashboardController } from './demo-dashboard.controller.js';
import { DemoDashboardService } from './demo-dashboard.service.js';
import { DemoPreviewController } from './demo-preview.controller.js';
import { DemoPreviewService } from './demo-preview.service.js';

@Module({
  controllers: [DemoDashboardController, DemoPreviewController],
  providers: [DemoDashboardService, DemoPreviewService],
})
export class DemoModule {}
