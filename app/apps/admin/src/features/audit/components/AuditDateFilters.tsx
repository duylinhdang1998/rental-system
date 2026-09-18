import { useTranslation } from 'react-i18next';
import type { AuditPage } from '@/features/audit/hooks/use-audit-page';
import { TextField } from '@/shared/ui/TextField';

interface AuditDateFiltersProps {
  page: AuditPage;
}

export function AuditDateFilters({ page }: AuditDateFiltersProps) {
  const { t } = useTranslation();
  return (
    <>
      <TextField
        id="audit-from"
        label={t('auditFrom')}
        onChange={(event) => page.change('from', event.target.value)}
        type="date"
        value={page.filters.from}
      />
      <TextField
        id="audit-to"
        label={t('auditTo')}
        onChange={(event) => page.change('to', event.target.value)}
        type="date"
        value={page.filters.to}
      />
    </>
  );
}
