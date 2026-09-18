import type { PnlMonth } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TrendChart } from '@/features/reporting/components/charts/TrendChart';
import { pnlSeries, type PnlSeriesKey } from '@/features/reporting/lib/pnl-presentation';

interface PnlTrendSectionProps {
  months: readonly PnlMonth[];
}

const TONES: Record<PnlSeriesKey, string> = {
  expensesVnd: 'stroke-negative fill-negative bg-negative',
  profitVnd: 'stroke-brand fill-brand bg-brand',
  revenueVnd: 'stroke-positive fill-positive bg-positive',
};

/** Three lines in one chart (US-030); the month table underneath is the accessible fallback. */
export function PnlTrendSection({ months }: PnlTrendSectionProps) {
  const { t } = useTranslation();
  const chart = pnlSeries(months);
  return (
    <section className="surface-card grid gap-3 p-4" data-pnl-trend>
      <h2 className="text-lg font-extrabold text-ink">{t('pnlTrend', { count: months.length })}</h2>
      <TrendChart
        ariaLabel={t('pnlChartLabel', { count: months.length })}
        labels={chart.labels}
        series={chart.series.map((item) => ({
          ...item,
          label: t(`pnlSeries.${item.key}`),
          tone: TONES[item.key],
        }))}
      />
    </section>
  );
}
