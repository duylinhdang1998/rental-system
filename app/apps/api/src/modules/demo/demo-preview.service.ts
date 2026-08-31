import { Injectable } from '@nestjs/common';
import type { DemoPreview, PreviewModule } from '@rental/contracts';

@Injectable()
export class DemoPreviewService {
  getPreview(moduleName: PreviewModule, sprint: number): DemoPreview {
    return {
      message: `Bản xem trước ${moduleName}`,
      records: 3,
      sprint,
    };
  }
}
