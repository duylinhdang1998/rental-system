import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface CashShiftHeaderProps {
  hasOpenShift: boolean;
  onOpenShift: () => void;
}

export function CashShiftHeader({ hasOpenShift, onOpenShift }: CashShiftHeaderProps) {
  const { t } = useTranslation();
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold text-ink">{t('cashShifts')}</h1>
        <p className="mt-2 text-ink-muted">{t('cashShiftSubtitle')}</p>
      </div>
      {hasOpenShift ? null : (
        <Button onClick={onOpenShift} type="button">
          <Plus aria-hidden data-icon="inline-start" />
          {t('cashShiftOpen')}
        </Button>
      )}
    </header>
  );
}
