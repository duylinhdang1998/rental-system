import type { CustomerSummary } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';
import { CheckboxField } from '@/shared/ui/CheckboxField';

interface Props {
  acknowledged: boolean;
  customer?: CustomerSummary;
  onAcknowledge: (value: boolean) => void;
}

export function RiskAcknowledgement({ acknowledged, customer, onAcknowledge }: Props) {
  const { t } = useTranslation();
  if (customer?.warning?.code !== 'BLACKLIST') return null;
  return (
    <div className="rounded-control border border-negative bg-negative-soft p-4 font-bold text-negative">
      <p className="flex items-center gap-2">
        <ShieldAlert aria-hidden className="size-5" /> {customer.warning.reason}
      </p>
      <CheckboxField
        checked={acknowledged}
        className="mt-3"
        id="contract-risk-acknowledgement"
        label={t('acknowledgeWarning')}
        onChange={onAcknowledge}
        required
      />
    </div>
  );
}
