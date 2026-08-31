import { Controller, Get, UseGuards } from '@nestjs/common';
import { PREVIEW_SPRINTS, type DemoPreview } from '@rental/contracts';
import { AuthenticationGuard } from '../../common/guards/authentication.guard.js';
import { OwnerAuthorizationGuard } from '../../common/guards/authorization.guard.js';
import { DemoPreviewService } from './demo-preview.service.js';

@Controller('demo')
@UseGuards(AuthenticationGuard)
export class DemoPreviewController {
  constructor(private readonly previewService: DemoPreviewService) {}

  @Get('vehicles') vehicles(): DemoPreview {
    return this.previewService.getPreview('vehicles', PREVIEW_SPRINTS.vehicles);
  }
  @Get('customers') customers(): DemoPreview {
    return this.previewService.getPreview('customers', PREVIEW_SPRINTS.customers);
  }
  @Get('contracts') contracts(): DemoPreview {
    return this.previewService.getPreview('contracts', PREVIEW_SPRINTS.contracts);
  }
  @Get('returns') returns(): DemoPreview {
    return this.previewService.getPreview('returns', PREVIEW_SPRINTS.returns);
  }

  @Get('reports')
  @UseGuards(OwnerAuthorizationGuard)
  reports(): DemoPreview {
    return this.previewService.getPreview('reports', PREVIEW_SPRINTS.reports);
  }

  @Get('employees')
  @UseGuards(OwnerAuthorizationGuard)
  employees(): DemoPreview {
    return this.previewService.getPreview('employees', PREVIEW_SPRINTS.employees);
  }

  @Get('settings')
  @UseGuards(OwnerAuthorizationGuard)
  settings(): DemoPreview {
    return this.previewService.getPreview('settings', PREVIEW_SPRINTS.settings);
  }
}
