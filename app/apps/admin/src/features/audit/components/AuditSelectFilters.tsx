import { useTranslation } from 'react-i18next';
import type { AuditPage } from '@/features/audit/hooks/use-audit-page';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@/features/audit/lib/audit-presentation';
import { SelectField } from '@/shared/ui/SelectField';

interface AuditSelectFiltersProps {
  page: AuditPage;
}

export function AuditSelectFilters({ page }: AuditSelectFiltersProps) {
  const { t } = useTranslation();
  const entityOptions = [
    { label: t('auditAllEntities'), value: '' },
    ...AUDIT_ENTITY_TYPES.map((type) => ({ label: t(`auditEntityTypes.${type}`), value: type })),
  ];
  const actionOptions = [
    { label: t('auditAllActions'), value: '' },
    ...AUDIT_ACTIONS.map((action) => ({ label: t(`auditActions.${action}`), value: action })),
  ];
  return (
    <>
      <SelectField
        id="audit-entity-type"
        label={t('auditFilterEntityType')}
        onChange={(value) => page.change('entityType', value)}
        options={entityOptions}
        value={page.filters.entityType}
      />
      <SelectField
        id="audit-action"
        label={t('auditFilterAction')}
        onChange={(value) => page.change('action', value)}
        options={actionOptions}
        value={page.filters.action}
      />
    </>
  );
}
