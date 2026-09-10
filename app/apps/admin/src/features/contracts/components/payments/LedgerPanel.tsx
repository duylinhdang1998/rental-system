import type { UseQueryResult } from '@tanstack/react-query';
import type { ContractLedger } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { LedgerBalance } from '@/features/contracts/components/payments/LedgerBalance';
import { LedgerEntryList } from '@/features/contracts/components/payments/LedgerEntryList';

interface LedgerPanelProps {
  ledger: UseQueryResult<ContractLedger, Error>;
}

/** Immutable ledger rows plus the live balance (FR-08); refunds are separate rows, never edits. */
export function LedgerPanel({ ledger }: LedgerPanelProps) {
  const { t } = useTranslation();
  return (
    <section className="surface-card p-5" data-ledger data-mobile-card>
      <h2 className="text-lg font-extrabold text-ink">{t('ledgerTitle')}</h2>
      {ledger.data ? (
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <LedgerEntryList entries={ledger.data.entries} />
          <LedgerBalance balance={ledger.data.balance} />
        </div>
      ) : (
        <p className="mt-3 text-sm text-ink-muted">
          {ledger.isError ? t('errorBody') : t('loadingBody')}
        </p>
      )}
    </section>
  );
}
