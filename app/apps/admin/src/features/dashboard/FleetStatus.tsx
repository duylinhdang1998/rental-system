import { useTranslation } from 'react-i18next';

export function FleetStatus() {
  const { t } = useTranslation();
  return (
    <section className="surface-card p-5 lg:p-6">
      <h2 className="text-lg font-extrabold text-ink">{t('fleetStatus')}</h2>
      <p className="mt-3 text-ink-muted">{t('fleetSummary')}</p>
      <div className="mt-6 h-3 overflow-hidden rounded-full bg-panel-subtle">
        <div className="h-full w-1/2 rounded-full bg-positive" />
      </div>
      <p className="mt-4 text-sm font-bold text-positive">{t('fleetAvailable')}</p>
    </section>
  );
}
