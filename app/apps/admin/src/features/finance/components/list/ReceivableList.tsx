import type { ReceivableItem } from '@rental/contracts';
import { ReceivableCard } from '@/features/finance/components/list/ReceivableCard';
import { ReceivableTable } from '@/features/finance/components/list/ReceivableTable';

interface ReceivableListProps {
  items: ReceivableItem[];
  onCollect: (item: ReceivableItem) => void;
}

/** Table on wide screens, cards on phones — the same rows either way. */
export function ReceivableList({ items, onCollect }: ReceivableListProps) {
  return (
    <>
      <ReceivableTable items={items} onCollect={onCollect} />
      <ul className="grid gap-3 sm:hidden">
        {items.map((item) => (
          <ReceivableCard item={item} key={item.contractId} onCollect={() => onCollect(item)} />
        ))}
      </ul>
    </>
  );
}
