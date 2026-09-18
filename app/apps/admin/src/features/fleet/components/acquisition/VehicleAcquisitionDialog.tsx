import type { Vehicle } from '@rental/contracts';
import { LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LifecycleDialogShell } from '@/features/contracts/components/lifecycle/LifecycleDialogShell';
import { MutationAlert } from '@/features/contracts/components/lifecycle/MutationAlert';
import { VehicleAcquisitionForm } from '@/features/fleet/components/acquisition/VehicleAcquisitionForm';
import { useVehicleAcquisition } from '@/features/fleet/hooks/use-vehicle-acquisition';

interface VehicleAcquisitionDialogProps {
  onClose: () => void;
  vehicle: Vehicle;
}

/** Loads the stored cost first so the form is keyed on real data, not on an empty default. */
export function VehicleAcquisitionDialog({ onClose, vehicle }: VehicleAcquisitionDialogProps) {
  const { t } = useTranslation();
  const view = useVehicleAcquisition(vehicle.id);
  return (
    <LifecycleDialogShell
      description={t('acquisitionBody')}
      onClose={onClose}
      title={t('acquisitionTitle', { code: vehicle.code })}
    >
      {view.isPending ? (
        <p className="flex items-center gap-2 text-ink-muted" role="status">
          <LoaderCircle aria-hidden className="size-4 animate-spin" />
          {t('acquisitionLoading')}
        </p>
      ) : null}
      {view.isError ? <MutationAlert error={view.error} /> : null}
      {view.isSuccess ? (
        <VehicleAcquisitionForm
          acquisition={view.data.acquisition}
          onClose={onClose}
          vehicleId={vehicle.id}
        />
      ) : null}
    </LifecycleDialogShell>
  );
}
