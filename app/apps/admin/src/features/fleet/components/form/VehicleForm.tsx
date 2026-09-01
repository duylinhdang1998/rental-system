import { useTranslation } from 'react-i18next';
import { FormActions } from '@/shared/ui/FormActions';
import { useVehicleForm } from '@/features/fleet/hooks/use-vehicle-form';
import { VehicleFields } from '@/features/fleet/components/form/VehicleFields';

interface VehicleFormProps {
  onClose: () => void;
}

export function VehicleForm({ onClose }: VehicleFormProps) {
  const { t } = useTranslation();
  const form = useVehicleForm(onClose);
  return (
    <form className="grid gap-4" onSubmit={form.submit}>
      {form.create.error ? (
        <p
          className="rounded-control bg-negative-soft p-3 font-semibold text-negative"
          role="alert"
        >
          {form.create.error.message}
        </p>
      ) : null}
      <VehicleFields change={form.change} input={form.input} />
      <FormActions
        cancelLabel={t('cancel')}
        loading={form.create.isPending}
        onCancel={onClose}
        saveLabel={t('saveVehicle')}
      />
    </form>
  );
}
