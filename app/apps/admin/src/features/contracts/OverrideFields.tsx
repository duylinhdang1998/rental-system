import { useTranslation } from 'react-i18next';
import { OverrideAmountField } from './OverrideAmountField';
import { OverrideReasonField } from './OverrideReasonField';

interface Props {
  busy: boolean;
  onChange: (field: 'deliveryFeeVnd' | 'overrideAmount' | 'overrideReason', value: string) => void;
  onRecalculate: () => void;
  overrideAmount: string;
  overrideReason: string;
}

export function OverrideFields(props: Props) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-3 rounded-control border border-line p-3 sm:grid-cols-2">
      <OverrideAmountField
        onChange={(value) => props.onChange('overrideAmount', value)}
        value={props.overrideAmount}
      />
      <OverrideReasonField
        amount={props.overrideAmount}
        onChange={(value) => props.onChange('overrideReason', value)}
        value={props.overrideReason}
      />
      <button
        className="button-base border border-brand text-brand sm:col-span-2"
        disabled={props.busy}
        onClick={props.onRecalculate}
        type="button"
      >
        {t('contractRecalculate')}
      </button>
    </div>
  );
}
