import { PreviewPage } from '../../../shared/pages/PreviewPage';
import { PREVIEW_SPRINTS } from '@rental/contracts';

export function EmployeePreview() {
  return <PreviewPage routeKey="employees" sprint={PREVIEW_SPRINTS.employees} />;
}
