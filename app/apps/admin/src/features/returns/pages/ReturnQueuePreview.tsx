import { PreviewPage } from '@/shared/pages/PreviewPage';
import { PREVIEW_SPRINTS } from '@rental/contracts';

export function ReturnQueuePreview() {
  return <PreviewPage routeKey="returns" sprint={PREVIEW_SPRINTS.returns} />;
}
