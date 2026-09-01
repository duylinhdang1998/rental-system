import type { Vehicle } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from '../../shared/ui/StatusBadge';
import { vehicleStatusTone } from './vehicle-status';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const { t } = useTranslation();
  return (
    <article className="surface-card grid gap-3 p-4 sm:hidden" data-mobile-card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-ink-muted">{vehicle.code}</p>
          <h2 className="text-lg font-extrabold text-ink">{vehicle.plate}</h2>
        </div>
        <StatusBadge
          label={t(`vehicleStatus.${vehicle.status}`)}
          tone={vehicleStatusTone(vehicle.status)}
        />
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-ink-muted">{t('vehicleType')}</dt>
          <dd className="font-bold text-ink">{vehicle.typeCode}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">{t('vehicleModel')}</dt>
          <dd className="font-bold text-ink">{vehicle.model}</dd>
        </div>
      </dl>
      <button className="button-base border border-line bg-panel text-brand" type="button">
        {t('viewDetails')}
      </button>
    </article>
  );
}
