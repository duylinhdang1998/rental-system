import type { LedgerEntry } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { paymentMethodLabel, signedAmount } from '@/features/contracts/lib/payment-presentation';
import { formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface LedgerEntryItemProps {
  entry: LedgerEntry;
}

export function LedgerEntryItem({ entry }: LedgerEntryItemProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  const detail = [entry.reference, entry.notes].filter(Boolean).join(' · ');
  return (
    <li className="rounded-card border border-line p-3" data-ledger-entry={entry.id}>
      <div className="flex items-baseline justify-between gap-3">
        <p className={`font-black ${entry.kind === 'REFUND' ? 'text-caution' : 'text-positive'}`}>
          {signedAmount(entry.kind, entry.amountVnd, locale)}
        </p>
        <p className="text-sm font-semibold text-ink">{paymentMethodLabel(entry.method, locale)}</p>
      </div>
      <p className="text-xs text-ink-muted">
        {formatDateTime(entry.receivedAt, locale)} ·{' '}
        {t('ledgerReceivedBy', { name: entry.receivedByName })}
      </p>
      {detail ? <p className="mt-1 text-sm text-ink">{detail}</p> : null}
    </li>
  );
}
