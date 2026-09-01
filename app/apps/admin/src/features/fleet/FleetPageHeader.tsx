import { CalendarDays, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../shared/ui/Button';

interface FleetPageHeaderProps {
  onAdd: () => void;
  onCalendar: () => void;
}

export function FleetPageHeader({ onAdd, onCalendar }: FleetPageHeaderProps) {
  const { t } = useTranslation();
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-brand">
          {t('fleetWorkspace')}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold">{t('vehicles')}</h1>
        <p className="mt-1 text-ink-muted">{t('fleetSubtitle')}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          className="button-base border border-line bg-panel text-brand"
          onClick={onCalendar}
          type="button"
        >
          <CalendarDays aria-hidden className="size-5" />
          {t('fleetCalendar')}
        </button>
        <Button onClick={onAdd} type="button">
          <Plus aria-hidden className="size-5" />
          {t('addVehicle')}
        </Button>
      </div>
    </header>
  );
}
