import { PreviewPage } from '../../shared/pages/PreviewPage';
import { PREVIEW_SPRINTS } from '@rental/contracts';

export function ContractPreview() {
  return <PreviewPage routeKey="contracts" sprint={PREVIEW_SPRINTS.contracts} />;
}
