import type { BoardItem } from '@rental/contracts';
import { AlertCircle, CalendarClock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PriorityItem } from '@/features/dashboard/components/PriorityItem';
import { Button } from '@/components/ui/button';

interface PriorityWorkListProps {
  items: BoardItem[];
}

const PRIORITY_LIMIT = 5;

export function PriorityWorkList({ items }: PriorityWorkListProps) {
  const { t } = useTranslation();
  return (
    <section className="surface-card p-5 lg:p-6">
      <div className="mb-4 flex items-center gap-2">
        <AlertCircle aria-hidden className="size-5 text-negative" />
        <h2 className="text-lg font-extrabold text-ink">{t('priorityTitle')}</h2>
      </div>
      <div className="grid gap-3">
        {items.slice(0, PRIORITY_LIMIT).map((item) => (
          <PriorityItem item={item} key={item.contractId} />
        ))}
      </div>
      <Button asChild className="mt-4" variant="ghost">
        <Link to="/contracts?status=ACTIVE">
          <CalendarClock aria-hidden data-icon="inline-start" />
          {t('priorityAll')}
        </Link>
      </Button>
    </section>
  );
}
