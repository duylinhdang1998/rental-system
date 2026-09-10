import type { ReturnQueueItem } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { ReturnQueueItemCard } from '@/features/returns/components/queue/ReturnQueueItemCard';
import type { QueueSelection } from '@/features/returns/hooks/use-return-queue-page';
import type { QueueSection } from '@/features/returns/lib/queue-presentation';

interface ReturnQueueSectionProps {
  items: ReturnQueueItem[];
  onReturn: (selection: QueueSelection) => void;
  section: QueueSection;
}

export function ReturnQueueSection({ items, onReturn, section }: ReturnQueueSectionProps) {
  const { t } = useTranslation();
  return (
    <section data-queue-section={section.kind}>
      <h2 className="text-lg font-extrabold text-ink">
        {t(section.labelKey)} · {items.length}
      </h2>
      <ul className="mt-3 grid gap-3">
        {items.map((item) => (
          <ReturnQueueItemCard item={item} key={item.contractId} onReturn={onReturn} />
        ))}
      </ul>
    </section>
  );
}
