import { useTranslation } from 'react-i18next';
import { FormActions } from '../../shared/ui/FormActions';
import { useVehicleForm } from './use-vehicle-form';
import { VehicleFields } from './VehicleFields';

interface VehicleFormProps {
  onClose: () => void;
}

export function VehicleForm({ onClose }: VehicleFormProps) {
  const { t } = useTranslation();
  const form = useVehicleForm(onClose);
  return (
    <form className="surface-card grid gap-4 p-5" onSubmit={form.submit}>
      <div>
        <h2 className="text-xl font-extrabold">{t('addVehicle')}</h2>
        <p className="mt-1 text-sm text-ink-muted">{t('vehicleFormHelp')}</p>
      </div>
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
