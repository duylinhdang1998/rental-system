import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { AuditDateFilters } from '@/features/audit/components/AuditDateFilters';
import { AuditSelectFilters } from '@/features/audit/components/AuditSelectFilters';
import type { AuditPage } from '@/features/audit/hooks/use-audit-page';

interface AuditFiltersProps {
  page: AuditPage;
}

export function AuditFilters({ page }: AuditFiltersProps) {
  const { t } = useTranslation();
  return (
    <section
      aria-label={t('auditFilterAction')}
      className="surface-card grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-5"
      data-mobile-card
    >
      <AuditSelectFilters page={page} />
      <AuditDateFilters page={page} />
      <div className="flex items-end">
        <Button onClick={page.reset} type="button" variant="outline">
          {t('auditReset')}
        </Button>
      </div>
    </section>
  );
}
