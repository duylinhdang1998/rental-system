import { useTranslation } from 'react-i18next';
import { LifecycleFormDialog } from '@/features/contracts/components/lifecycle/LifecycleFormDialog';
import { useCashShiftForm } from '@/features/cash-shifts/hooks/use-cash-shift-form';
import { useOpenCashShift } from '@/features/cash-shifts/hooks/use-cash-shifts';
import {
  INITIAL_OPEN_FORM,
  openBlocked,
  toOpenInput,
} from '@/features/cash-shifts/lib/cash-shift-presentation';
import { TextField } from '@/shared/ui/TextField';

interface OpenShiftDialogProps {
  onClose: () => void;
}

const COPY_KEYS = {
  description: 'cashShiftOpenBody',
  save: 'cashShiftOpen',
  title: 'cashShiftOpen',
};

export function OpenShiftDialog({ onClose }: OpenShiftDialogProps) {
  const { t } = useTranslation();
  const mutation = useOpenCashShift();
  const form = useCashShiftForm(INITIAL_OPEN_FORM, toOpenInput, mutation, onClose);
  return (
    <LifecycleFormDialog
      copyKeys={COPY_KEYS}
      mutation={mutation}
      onClose={onClose}
      onSubmit={form.submit}
      submitDisabled={openBlocked(form.form)}
    >
      <TextField
        data-dialog-autofocus=""
        id="cash-shift-opening-float"
        inputMode="numeric"
        label={t('cashShiftOpeningFloatVnd')}
        min={0}
        onChange={(event) => form.change('openingFloatVnd', event.target.value)}
        required
        type="number"
        value={form.form.openingFloatVnd}
      />
    </LifecycleFormDialog>
  );
}
