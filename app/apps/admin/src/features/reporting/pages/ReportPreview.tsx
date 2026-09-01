import { PreviewPage } from '@/shared/pages/PreviewPage';
import { PREVIEW_SPRINTS } from '@rental/contracts';

export function ReportPreview() {
  return <PreviewPage routeKey="reports" sprint={PREVIEW_SPRINTS.reports} />;
}
