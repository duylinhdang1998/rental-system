import { PreviewPage } from '../../shared/pages/PreviewPage';
import { PREVIEW_SPRINTS } from '@rental/contracts';

export function VehiclePreview() {
  return <PreviewPage routeKey="vehicles" sprint={PREVIEW_SPRINTS.vehicles} />;
}
