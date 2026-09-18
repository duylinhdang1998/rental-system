import type { RentalContract } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { lifecycleRows, overviewRows } from '@/features/contracts/lib/contract-presentation';
import { formatCurrency, resolveInitialLocale } from '@/shared/i18n/locale';

interface ContractOverviewProps {
  contract: RentalContract;
}

export function ContractOverview({ contract }: ContractOverviewProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  const rows = [...overviewRows(contract, locale), ...lifecycleRows(contract, locale)];
  return (
    <aside className="surface-card h-fit p-5 xl:sticky xl:top-5" data-mobile-card>
      <h2 className="font-extrabold text-ink">{t('contractSummary')}</h2>
      <p className="mt-1 text-sm text-ink-muted">{t('contractTotal')}</p>
      <p className="text-3xl font-black text-brand-ink">
        {formatCurrency(contract.quote.totalVnd, locale)}
      </p>
      <dl className="mt-4 grid gap-3 text-sm">
        {rows.map((row) => (
          <div className="grid gap-0.5" key={row.labelKey}>
            <dt className="text-ink-muted">{t(row.labelKey)}</dt>
            <dd className="font-bold text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
