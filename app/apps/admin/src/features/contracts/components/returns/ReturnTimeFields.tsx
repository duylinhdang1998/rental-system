import { useTranslation } from 'react-i18next';
import type { ReturnFieldsProps } from '@/features/contracts/components/returns/ReturnChargeFields';
import { ReturnLateFeePreview } from '@/features/contracts/components/returns/ReturnLateFeePreview';
import type { ReturnTarget } from '@/features/contracts/lib/return-form';
import { TextField } from '@/shared/ui/TextField';

interface ReturnTimeFieldsProps extends ReturnFieldsProps {
  target: ReturnTarget;
}

export function ReturnTimeFields({ onChange, target, values }: ReturnTimeFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4">
      <TextField
        data-dialog-autofocus=""
        id="return-actual-at"
        label={t('returnActualAt')}
        onChange={(event) => onChange('actualLocal', event.target.value)}
        required
        type="datetime-local"
        value={values.actualLocal}
      />
      <ReturnLateFeePreview actualLocal={values.actualLocal} target={target} />
    </div>
  );
}
