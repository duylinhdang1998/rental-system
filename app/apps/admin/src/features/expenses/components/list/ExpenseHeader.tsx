import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface ExpenseHeaderProps {
  count: number;
  onRecord: () => void;
}

export function ExpenseHeader({ count, onRecord }: ExpenseHeaderProps) {
  const { t } = useTranslation();
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-brand-ink">
          {t('expenseWorkspace')} · {t('expenseCount', { count })}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-ink">{t('expenses')}</h1>
        <p className="mt-2 text-ink-muted">{t('expenseSubtitle')}</p>
      </div>
      <Button onClick={onRecord} type="button">
        <Plus aria-hidden data-icon="inline-start" />
        {t('expenseRecord')}
      </Button>
    </header>
  );
}
