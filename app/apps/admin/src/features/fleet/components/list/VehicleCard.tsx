import type { Vehicle } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { vehicleStatusTone } from '@/features/fleet/lib/vehicle-status';
import { Button } from '@/components/ui/button';
import { formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';
import { VehicleCardMetadata } from '@/features/fleet/components/list/VehicleCardMetadata';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const { i18n, t } = useTranslation();
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
      <VehicleCardMetadata
        createdAt={formatDateTime(vehicle.createdAt, resolveInitialLocale(i18n.language))}
        model={vehicle.model}
        typeCode={vehicle.typeCode}
      />
      <Button type="button" variant="outline">
        {t('viewDetails')}
      </Button>
    </article>
  );
}
