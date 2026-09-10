import type { UseQueryResult } from '@tanstack/react-query';
import type { RentalContract, SettlementStatement } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { SettlementFigureList } from '@/features/contracts/components/settlement/SettlementFigureList';
import { SettlementItemList } from '@/features/contracts/components/settlement/SettlementItemList';
import { SettlementStatus } from '@/features/contracts/components/settlement/SettlementStatus';

interface SettlementPanelProps {
  contract: RentalContract;
  statement: UseQueryResult<SettlementStatement, Error>;
}

/** Statement + figures; a live preview until settled, then the frozen snapshot (BR-07). */
export function SettlementPanel({ contract, statement }: SettlementPanelProps) {
  const { t } = useTranslation();
  return (
    <section className="surface-card p-5" data-mobile-card data-settlement>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-ink">{t('settlementTitle')}</h2>
        <SettlementStatus contract={contract} statement={statement.data} />
      </div>
      {statement.data ? (
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <SettlementItemList items={statement.data.items} />
          <SettlementFigureList figures={statement.data} />
        </div>
      ) : (
        <p className="mt-3 text-sm text-ink-muted">
          {statement.isError ? t('errorBody') : t('loadingBody')}
        </p>
      )}
    </section>
  );
}
