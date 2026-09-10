import type { LedgerEntry } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { LedgerEntryItem } from '@/features/contracts/components/payments/LedgerEntryItem';

interface LedgerEntryListProps {
  entries: LedgerEntry[];
}

export function LedgerEntryList({ entries }: LedgerEntryListProps) {
  const { t } = useTranslation();
  if (!entries.length) {
    return <p className="text-sm text-ink-muted">{t('ledgerEmpty')}</p>;
  }
  const newestFirst = [...entries].reverse();
  return (
    <ol className="grid gap-2" data-ledger-entries>
      {newestFirst.map((entry) => (
        <LedgerEntryItem entry={entry} key={entry.id} />
      ))}
    </ol>
  );
}
