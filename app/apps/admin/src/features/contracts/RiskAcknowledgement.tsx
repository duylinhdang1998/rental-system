import type { CustomerSummary } from '@rental/contracts';
import { useTranslation } from 'react-i18next';

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
      <p>⚠ {customer.warning.reason}</p>
      <label className="mt-3 flex items-center gap-2">
        <input
          checked={acknowledged}
          onChange={(event) => onAcknowledge(event.target.checked)}
          required
          type="checkbox"
        />
        {t('acknowledgeWarning')}
      </label>
    </div>
  );
}
