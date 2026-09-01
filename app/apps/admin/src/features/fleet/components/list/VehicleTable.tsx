import type { Vehicle } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { VehicleTableRow } from '@/features/fleet/components/list/VehicleTableRow';
import { TableBody } from '@/components/ui/table-body';
import { TableHead } from '@/components/ui/table-head';
import { TableHeader } from '@/components/ui/table-header';
import { Table } from '@/components/ui/table-root';
import { TableRow } from '@/components/ui/table-row';

interface VehicleTableProps {
  vehicles: Vehicle[];
}

export function VehicleTable({ vehicles }: VehicleTableProps) {
  const { t } = useTranslation();
  return (
    <div className="surface-card hidden overflow-hidden sm:block">
      <Table>
        <TableHeader className="bg-panel-subtle text-sm text-ink-muted">
          <TableRow>
            <TableHead>{t('vehiclePlate')}</TableHead>
            <TableHead>{t('vehicleType')}</TableHead>
            <TableHead>{t('vehicleModel')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>{t('createdAt')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <VehicleTableRow key={vehicle.id} vehicle={vehicle} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
