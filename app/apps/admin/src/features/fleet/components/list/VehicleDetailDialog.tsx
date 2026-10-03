import type { Vehicle } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { RecordDetailsDialog } from '@/shared/ui/RecordDetailsDialog';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { vehicleStatusTone } from '@/features/fleet/lib/vehicle-status';
import { formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface VehicleDetailDialogProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export function VehicleDetailDialog({ vehicle, onClose }: VehicleDetailDialogProps) {
  const { i18n, t } = useTranslation();
  const details = [
    { label: t('vehicleType'), value: vehicle.typeCode },
    { label: t('vehicleModel'), value: vehicle.model },
    {
      label: t('status'),
      value: (
        <StatusBadge
          label={t(`vehicleStatus.${vehicle.status}`)}
          tone={vehicleStatusTone(vehicle.status)}
        />
      ),
    },
    {
      label: t('createdAt'),
      value: formatDateTime(vehicle.createdAt, resolveInitialLocale(i18n.language)),
    },
  ];
  return (
    <RecordDetailsDialog
      title={vehicle.plate}
      description={`${t('vehicleDetails')} · ${vehicle.code}`}
      details={details}
      onClose={onClose}
    />
  );
}
