import { PreviewPage } from '../../shared/pages/PreviewPage';
import { PREVIEW_SPRINTS } from '@rental/contracts';

export function CustomerPreview() {
  return <PreviewPage routeKey="customers" sprint={PREVIEW_SPRINTS.customers} />;
}
