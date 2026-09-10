import type { PaymentBalance } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { balanceRows } from '@/features/contracts/lib/payment-presentation';
import { resolveInitialLocale } from '@/shared/i18n/locale';

interface LedgerBalanceProps {
  balance: PaymentBalance;
}

export function LedgerBalance({ balance }: LedgerBalanceProps) {
  const { i18n, t } = useTranslation();
  const rows = balanceRows(balance, resolveInitialLocale(i18n.language));
  return (
    <dl className="grid gap-2 text-sm" data-ledger-balance>
      {rows.map((row) => (
        <div className="flex items-baseline justify-between gap-3" key={row.labelKey}>
          <dt className={row.emphasis ? 'font-bold text-ink' : 'text-ink-muted'}>
            {t(row.labelKey)}
          </dt>
          <dd className={row.emphasis ? 'text-lg font-black text-ink' : 'font-semibold text-ink'}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
