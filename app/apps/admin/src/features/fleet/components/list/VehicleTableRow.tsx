import type { Vehicle } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { vehicleStatusTone } from '@/features/fleet/lib/vehicle-status';
import { TableCell } from '@/components/ui/table-cell';
import { TableRow } from '@/components/ui/table-row';
import { Button } from '@/components/ui/button';
import { VehicleAcquisitionButton } from '@/features/fleet/components/list/VehicleAcquisitionButton';
import { formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface VehicleTableRowProps {
  onAcquisition: () => void;
  onDetails: () => void;
  vehicle: Vehicle;
}

export function VehicleTableRow({ onAcquisition, onDetails, vehicle }: VehicleTableRowProps) {
  const { i18n, t } = useTranslation();
  return (
    <TableRow data-vehicle={vehicle.code}>
      <TableCell className="font-extrabold">
        {vehicle.plate}
        <span className="block text-xs font-semibold text-ink-muted">{vehicle.code}</span>
      </TableCell>
      <TableCell>{vehicle.typeCode}</TableCell>
      <TableCell>{vehicle.model}</TableCell>
      <TableCell>
        <StatusBadge
          label={t(`vehicleStatus.${vehicle.status}`)}
          tone={vehicleStatusTone(vehicle.status)}
        />
      </TableCell>
      <TableCell>
        {formatDateTime(vehicle.createdAt, resolveInitialLocale(i18n.language))}
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <Button onClick={onDetails} size="sm" type="button" variant="outline">
            {t('viewDetails')}
          </Button>
          <VehicleAcquisitionButton code={vehicle.code} onOpen={onAcquisition} />
        </div>
      </TableCell>
    </TableRow>
  );
}
