import type { Vehicle } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { vehicleStatusTone } from '@/features/fleet/lib/vehicle-status';
import { TableCell } from '@/components/ui/table-cell';
import { TableRow } from '@/components/ui/table-row';
import { formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface VehicleTableRowProps {
  vehicle: Vehicle;
}

export function VehicleTableRow({ vehicle }: VehicleTableRowProps) {
  const { i18n, t } = useTranslation();
  return (
    <TableRow>
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
    </TableRow>
  );
}
