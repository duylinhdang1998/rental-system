import type { VehicleAcquisition } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { MutationAlert } from '@/features/contracts/components/lifecycle/MutationAlert';
import { AcquisitionPreview } from '@/features/fleet/components/acquisition/AcquisitionPreview';
import { VehicleAcquisitionFields } from '@/features/fleet/components/acquisition/VehicleAcquisitionFields';
import { useAcquisitionForm } from '@/features/fleet/hooks/use-acquisition-form';
import { useSaveAcquisition } from '@/features/fleet/hooks/use-vehicle-acquisition';
import { acquisitionIssue } from '@/features/fleet/lib/acquisition-presentation';
import { FormActions } from '@/shared/ui/FormActions';

interface VehicleAcquisitionFormProps {
  acquisition: VehicleAcquisition | null;
  onClose: () => void;
  vehicleId: string;
}

export function VehicleAcquisitionForm({
  acquisition,
  onClose,
  vehicleId,
}: VehicleAcquisitionFormProps) {
  const { t } = useTranslation();
  const mutation = useSaveAcquisition(vehicleId);
  const form = useAcquisitionForm(acquisition, mutation, onClose);
  const issue = acquisitionIssue(form.form);
  return (
    <form className="grid gap-4" onSubmit={form.submit}>
      <MutationAlert error={mutation.error} />
      <VehicleAcquisitionFields onChange={form.change} values={form.form} />
      {issue === 'salvage' ? (
        <p className="text-sm font-semibold text-negative" role="alert">
          {t(`acquisitionIssue.${issue}`)}
        </p>
      ) : null}
      <AcquisitionPreview form={form.form} />
      <FormActions
        cancelLabel={t('cancel')}
        disabled={issue !== null}
        loading={mutation.isPending}
        onCancel={onClose}
        saveLabel={t('acquisitionSave')}
      />
    </form>
  );
}
