import type { FleetSummary } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { fleetSharePercent } from '@/features/dashboard/lib/board-presentation';

interface FleetStatusProps {
  fleet: FleetSummary;
}

export function FleetStatus({ fleet }: FleetStatusProps) {
  const { t } = useTranslation();
  return (
    <section className="surface-card p-5 lg:p-6">
      <h2 className="text-lg font-extrabold text-ink">{t('fleetStatus')}</h2>
      <p className="mt-3 text-ink-muted">{t('fleetSummary', fleet)}</p>
      <Progress
        aria-label={t('fleetStatus')}
        className="mt-6"
        max={fleet.total || 1}
        value={fleet.available}
      />
      <p className="mt-4 text-sm font-bold text-positive">
        {t('fleetAvailable', { percent: fleetSharePercent(fleet) })}
      </p>
      <Button asChild className="mt-4" variant="outline">
        <Link to="/vehicles">{t('emptyAction')}</Link>
      </Button>
    </section>
  );
}
