import { ISO_DATE_LENGTH, type Quote } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { formatCurrency, resolveInitialLocale } from '@/shared/i18n/locale';

export function ContractSummary({ quote }: { quote?: Quote }) {
  const { i18n, t } = useTranslation();
  return (
    <aside className="surface-card h-fit p-5 lg:sticky lg:top-5">
      <h2 className="text-base font-semibold">{t('contractSummary')}</h2>
      <p className="mt-3 text-sm text-ink-muted">
        {quote
          ? `${quote.lines.length} xe · ${quote.startAt.slice(0, ISO_DATE_LENGTH)} → ${quote.endAt.slice(0, ISO_DATE_LENGTH)}`
          : t('quotePending')}
      </p>
      {quote ? (
        <p className="mt-4 text-2xl font-semibold tabular-nums text-brand-ink">
          {formatCurrency(quote.totalVnd, resolveInitialLocale(i18n.language))}
        </p>
      ) : null}
    </aside>
  );
}
