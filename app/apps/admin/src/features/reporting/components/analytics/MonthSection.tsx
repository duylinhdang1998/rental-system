import type { MonthRow } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { MonthTable } from '@/features/reporting/components/analytics/MonthTable';
import { TrendChart } from '@/features/reporting/components/charts/TrendChart';
import { monthSeries } from '@/features/reporting/lib/analytics-presentation';

interface MonthSectionProps {
  rows: readonly MonthRow[];
}

/** Chart first, table underneath: the table is the fallback the chart's name points to. */
export function MonthSection({ rows }: MonthSectionProps) {
  const { t } = useTranslation();
  const chart = monthSeries(rows);
  return (
    <section className="surface-card grid gap-4 p-4" data-month-section>
      <h2 className="text-lg font-extrabold text-ink">{t('analyticsSections.month')}</h2>
      <TrendChart
        ariaLabel={t('analyticsChartLabel', { count: rows.length })}
        labels={chart.labels}
        series={[
          {
            key: 'revenueVnd',
            label: t('dimensionColumns.revenue'),
            tone: 'stroke-positive fill-positive bg-positive',
            values: chart.values,
          },
        ]}
      />
      <MonthTable rows={rows} />
    </section>
  );
}
