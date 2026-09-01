import { ISO_DATE_LENGTH, type Quote } from '@rental/contracts';
import { useTranslation } from 'react-i18next';

export function ContractSummary({ quote }: { quote?: Quote }) {
  const { t } = useTranslation();
  return (
    <aside className="surface-card h-fit p-5 lg:sticky lg:top-5">
      <h2 className="font-extrabold">{t('contractSummary')}</h2>
      <p className="mt-3 text-sm text-ink-muted">
        {quote
          ? `${quote.lines.length} xe · ${quote.startAt.slice(0, ISO_DATE_LENGTH)} → ${quote.endAt.slice(0, ISO_DATE_LENGTH)}`
          : '—'}
      </p>
      <p className="mt-4 text-2xl font-black text-brand">
        {quote ? `${quote.totalVnd.toLocaleString()} ₫` : '0 ₫'}
      </p>
    </aside>
  );
}
