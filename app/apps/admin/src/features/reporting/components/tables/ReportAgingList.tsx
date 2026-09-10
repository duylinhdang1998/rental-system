import type { ReceivableAging } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { agingLabelKey } from '@/features/reporting/lib/report-presentation';
import { formatCurrency, resolveInitialLocale } from '@/shared/i18n/locale';

interface ReportAgingListProps {
  aging: ReceivableAging;
}

/** Open receivables at report time, bucketed by days past due (US-019). */
export function ReportAgingList({ aging }: ReportAgingListProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  const total = t('reportAgingTotal', {
    amount: formatCurrency(aging.totalVnd, locale),
    count: aging.count,
  });
  return (
    <section className="surface-card p-4" data-mobile-card data-report-aging>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-lg font-extrabold text-ink">{t('reportAging')}</h2>
        <p className="text-sm font-semibold text-ink-muted">{total}</p>
      </div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {aging.rows.map((row) => (
          <li className="rounded-card border border-line p-3" key={row.bucket}>
            <p className="text-sm text-ink-muted">{t(agingLabelKey(row.bucket))}</p>
            <p className="text-lg font-black text-ink">{formatCurrency(row.totalVnd, locale)}</p>
            <p className="text-xs text-ink-muted">
              {t('reportKpiContracts', { count: row.count })}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
