import { useTranslation } from 'react-i18next';
import type { AuditEventView } from '@rental/contracts';
import { AuditMetadata } from '@/features/audit/components/AuditMetadata';
import { actionTone } from '@/features/audit/lib/audit-presentation';
import { formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';
import { StatusBadge } from '@/shared/ui/StatusBadge';

interface AuditEntryProps {
  event: AuditEventView;
}

export function AuditEntry({ event }: AuditEntryProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <li className="surface-card grid gap-3 p-4" data-audit-action={event.action} data-mobile-card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-lg font-extrabold text-ink">
            {t(`auditActions.${event.action}`, { defaultValue: event.action })}
          </p>
          <p className="text-sm text-ink-muted">
            {t('auditActor')} <span className="font-bold text-ink">{event.actorName}</span> ·{' '}
            {formatDateTime(event.at, locale)}
          </p>
        </div>
        <StatusBadge
          label={t(`auditEntityTypes.${event.entityType}`, { defaultValue: event.entityType })}
          tone={actionTone(event.action)}
        />
      </div>
      <p className="text-sm text-ink-muted">
        {t('auditEntity')}: <span className="font-mono text-xs text-ink">{event.entityId}</span>
      </p>
      <AuditMetadata event={event} />
    </li>
  );
}
