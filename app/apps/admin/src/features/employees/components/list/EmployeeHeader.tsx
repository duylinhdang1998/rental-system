import { UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface EmployeeHeaderProps {
  count: number;
  onAdd: () => void;
}

export function EmployeeHeader({ count, onAdd }: EmployeeHeaderProps) {
  const { t } = useTranslation();
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-brand-ink">
          {t('employeeCount', { count })}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-ink">{t('employees')}</h1>
        <p className="mt-2 text-ink-muted">{t('employeesSubtitle')}</p>
      </div>
      <Button onClick={onAdd} type="button">
        <UserPlus aria-hidden data-icon="inline-start" />
        {t('employeeAdd')}
      </Button>
    </header>
  );
}
