import { PreviewPage } from '../../shared/pages/PreviewPage';
import { PREVIEW_SPRINTS } from '@rental/contracts';

export function SettingsPreview() {
  return <PreviewPage routeKey="settings" sprint={PREVIEW_SPRINTS.settings} />;
}
