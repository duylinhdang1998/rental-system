import type { ReturnQueueItem } from '@rental/contracts';
import { ReturnQueueSection } from '@/features/returns/components/queue/ReturnQueueSection';
import type { QueueSelection } from '@/features/returns/hooks/use-return-queue-page';
import { QUEUE_SECTIONS, groupQueue } from '@/features/returns/lib/queue-presentation';

interface ReturnQueueListProps {
  items: ReturnQueueItem[];
  onReturn: (selection: QueueSelection) => void;
}

export function ReturnQueueList({ items, onReturn }: ReturnQueueListProps) {
  const groups = groupQueue(items);
  return (
    <div className="grid gap-5">
      {QUEUE_SECTIONS.filter((section) => groups[section.kind].length).map((section) => (
        <ReturnQueueSection
          items={groups[section.kind]}
          key={section.kind}
          onReturn={onReturn}
          section={section}
        />
      ))}
    </div>
  );
}
