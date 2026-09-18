import type { PaymentMethod } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { NotesField } from '@/features/contracts/components/lifecycle/NotesField';
import {
  PAYMENT_METHODS,
  type DepositRefundFormValues,
} from '@/features/contracts/lib/payment-presentation';
import { SelectField } from '@/shared/ui/SelectField';
import { TextField } from '@/shared/ui/TextField';

interface DepositRefundFieldsProps {
  onChange: <TField extends keyof DepositRefundFormValues>(
    field: TField,
    value: DepositRefundFormValues[TField],
  ) => void;
  values: DepositRefundFormValues;
}

const MAX_REFERENCE = 120;

export function DepositRefundFields({ onChange, values }: DepositRefundFieldsProps) {
  const { t } = useTranslation();
  return (
    <>
      <SelectField
        id="deposit-refund-method"
        label={t('paymentMethod')}
        onChange={(value) => onChange('method', value as PaymentMethod)}
        options={PAYMENT_METHODS.map((method) => ({
          label: t(`paymentMethodOption.${method}`),
          value: method,
        }))}
        value={values.method}
      />
      <TextField
        id="deposit-refund-reference"
        label={t('paymentReference')}
        maxLength={MAX_REFERENCE}
        onChange={(event) => onChange('reference', event.target.value)}
        value={values.reference}
      />
      <NotesField
        id="deposit-refund-notes"
        labelKey="paymentNotes"
        onChange={(value) => onChange('notes', value)}
        value={values.notes}
      />
    </>
  );
}
