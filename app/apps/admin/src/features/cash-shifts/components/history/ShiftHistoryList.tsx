import type { CashShift } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { ShiftHistoryCard } from '@/features/cash-shifts/components/history/ShiftHistoryCard';
import { ShiftHistoryTable } from '@/features/cash-shifts/components/history/ShiftHistoryTable';

interface ShiftHistoryListProps {
  items: CashShift[];
}

/** Table on wide screens, cards on phones — the same closed shifts either way. */
export function ShiftHistoryList({ items }: ShiftHistoryListProps) {
  const { t } = useTranslation();
  return (
    <section className="grid gap-3">
      <h2 className="text-xl font-extrabold text-ink">{t('cashShiftHistory')}</h2>
      <ShiftHistoryTable items={items} />
      <ul className="grid gap-3 sm:hidden">
        {items.map((item) => (
          <ShiftHistoryCard key={item.id} shift={item} />
        ))}
      </ul>
    </section>
  );
}
