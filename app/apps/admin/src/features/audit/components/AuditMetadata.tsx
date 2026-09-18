import { useTranslation } from 'react-i18next';
import type { AuditEventView } from '@rental/contracts';
import { metadataRows } from '@/features/audit/lib/audit-presentation';
import { resolveInitialLocale } from '@/shared/i18n/locale';

interface AuditMetadataProps {
  event: AuditEventView;
}

/** Reason, old and new values (US-020) rendered as a definition list; empty when none. */
export function AuditMetadata({ event }: AuditMetadataProps) {
  const { i18n, t } = useTranslation();
  const rows = metadataRows(event, resolveInitialLocale(i18n.language));
  if (rows.length === 0) return null;
  return (
    <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
      {rows.map((row) => (
        <div className="contents" key={row.key}>
          <dt className="font-bold text-ink-muted">
            {t(`auditMeta.${row.key}`, { defaultValue: row.key })}
          </dt>
          <dd className="break-words text-ink" data-audit-meta={row.key}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
