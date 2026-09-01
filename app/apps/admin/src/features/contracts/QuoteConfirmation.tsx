import type { Quote } from '@rental/contracts';
import { useTranslation } from 'react-i18next';

export function QuoteConfirmation({ quote }: { quote?: Quote }) {
  const { t } = useTranslation();
  return (
    <div className="surface-card grid gap-3 p-5">
      <h2 className="text-lg font-extrabold">{t('contractSummary')}</h2>
      {quote?.lines.map((line) => (
        <div className="flex justify-between gap-3" key={line.vehicleId}>
          <span>{line.vehicleCode}</span>
          <strong>{line.finalSubtotalVnd.toLocaleString()} ₫</strong>
        </div>
      ))}
      <div className="flex justify-between border-t border-line pt-3 text-lg">
        <span>{t('contractTotal')}</span>
        <strong>{quote?.totalVnd.toLocaleString()} ₫</strong>
      </div>
    </div>
  );
}
