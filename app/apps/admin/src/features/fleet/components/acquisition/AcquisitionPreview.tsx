import { useTranslation } from 'react-i18next';
import {
  acquisitionPreview,
  type AcquisitionFormValues,
} from '@/features/fleet/lib/acquisition-presentation';
import { resolveInitialLocale } from '@/shared/i18n/locale';

interface AcquisitionPreviewProps {
  form: AcquisitionFormValues;
}

/** Live depreciation figures: the Owner sees the report numbers before saving. */
export function AcquisitionPreview({ form }: AcquisitionPreviewProps) {
  const { i18n, t } = useTranslation();
  const rows = acquisitionPreview(form, new Date(), resolveInitialLocale(i18n.language));
  if (!rows) return null;
  return (
    <section className="rounded-control bg-panel-subtle p-3" data-acquisition-preview>
      <h3 className="text-sm font-bold text-ink-muted">{t('acquisitionPreviewTitle')}</h3>
      <dl className="mt-2 grid gap-1 sm:grid-cols-2">
        {rows.map((row) => (
          <div className="flex justify-between gap-3 text-sm" key={row.key}>
            <dt className="text-ink-muted">{t(`acquisitionPreview.${row.key}`)}</dt>
            <dd className="font-bold tabular-nums text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
