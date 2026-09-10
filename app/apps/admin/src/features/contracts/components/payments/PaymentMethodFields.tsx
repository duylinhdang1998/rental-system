import type { PaymentMethod } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { NotesField } from '@/features/contracts/components/lifecycle/NotesField';
import {
  PAYMENT_METHODS,
  type PaymentFieldChange,
  type PaymentFormValues,
} from '@/features/contracts/lib/payment-presentation';
import { SelectField } from '@/shared/ui/SelectField';
import { TextField } from '@/shared/ui/TextField';

const MAX_REFERENCE = 120;

interface PaymentMethodFieldsProps {
  onChange: PaymentFieldChange;
  values: PaymentFormValues;
}

export function PaymentMethodFields({ onChange, values }: PaymentMethodFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4">
      <SelectField
        id="payment-method"
        label={t('paymentMethod')}
        onChange={(value) => onChange('method', value as PaymentMethod)}
        options={PAYMENT_METHODS.map((method) => ({
          label: t(`paymentMethodOption.${method}`),
          value: method,
        }))}
        value={values.method}
      />
      <TextField
        id="payment-reference"
        label={t('paymentReference')}
        maxLength={MAX_REFERENCE}
        onChange={(event) => onChange('reference', event.target.value)}
        value={values.reference}
      />
      <NotesField
        id="payment-notes"
        labelKey="paymentNotes"
        onChange={(value) => onChange('notes', value)}
        value={values.notes}
      />
    </div>
  );
}
