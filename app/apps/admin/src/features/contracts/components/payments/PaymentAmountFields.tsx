import { useTranslation } from 'react-i18next';
import type {
  PaymentFieldChange,
  PaymentFormValues,
} from '@/features/contracts/lib/payment-presentation';
import { formatCurrency, resolveInitialLocale } from '@/shared/i18n/locale';
import { TextField } from '@/shared/ui/TextField';

interface PaymentAmountFieldsProps {
  cap: number;
  onChange: PaymentFieldChange;
  values: PaymentFormValues;
}

/** The cap is the API rule made visible: the remaining receivable, or the net collected for refunds. */
export function PaymentAmountFields({ cap, onChange, values }: PaymentAmountFieldsProps) {
  const { i18n, t } = useTranslation();
  return (
    <div className="grid gap-2">
      <TextField
        data-dialog-autofocus=""
        id="payment-amount"
        inputMode="numeric"
        label={t('paymentAmount')}
        max={cap}
        min={1}
        onChange={(event) => onChange('amount', event.target.value)}
        required
        type="number"
        value={values.amount}
      />
      <p className="text-sm text-ink-muted" data-payment-cap>
        {t('paymentCap', { amount: formatCurrency(cap, resolveInitialLocale(i18n.language)) })}
      </p>
    </div>
  );
}
