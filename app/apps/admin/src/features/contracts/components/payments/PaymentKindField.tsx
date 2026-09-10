import type { PaymentKind } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { PAYMENT_KINDS } from '@/features/contracts/lib/payment-presentation';
import { SelectField } from '@/shared/ui/SelectField';

interface PaymentKindFieldProps {
  onChange: (kind: PaymentKind) => void;
  value: PaymentKind;
}

/** Collection or refund is chosen explicitly, never inferred from a sign (BR-04). */
export function PaymentKindField({ onChange, value }: PaymentKindFieldProps) {
  const { t } = useTranslation();
  return (
    <SelectField
      id="payment-kind"
      label={t('paymentKind')}
      onChange={(next) => onChange(next as PaymentKind)}
      options={PAYMENT_KINDS.map((kind) => ({
        label: t(`paymentKindOption.${kind}`),
        value: kind,
      }))}
      value={value}
    />
  );
}
