import { ChartAxisLabels } from '@/features/reporting/components/charts/ChartAxisLabels';
import { ChartGrid } from '@/features/reporting/components/charts/ChartGrid';
import { ChartLegend } from '@/features/reporting/components/charts/ChartLegend';
import { ChartLines } from '@/features/reporting/components/charts/ChartLines';
import {
  CHART_HEIGHT,
  CHART_WIDTH,
  chartGeometry,
  type ChartSeriesInput,
} from '@/features/reporting/lib/chart-geometry';

export interface TrendSeries extends ChartSeriesInput {
  label: string;
  /** Tailwind stroke / fill / background utilities for the line, its points and the legend dot. */
  tone: string;
}

interface TrendChartProps {
  ariaLabel: string;
  labels: readonly string[];
  series: readonly TrendSeries[];
}

/**
 * Inline SVG line chart (US-030): no chart library. The table next to it is the accessible
 * fallback, so the SVG is one image with one name and its legend is real text underneath.
 */
export function TrendChart({ ariaLabel, labels, series }: TrendChartProps) {
  const geometry = chartGeometry(labels, series);
  return (
    <figure className="grid gap-2" data-trend-chart>
      <svg
        aria-label={ariaLabel}
        className="h-auto w-full text-ink-muted"
        role="img"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      >
        <ChartGrid ticks={geometry.ticks} zeroY={geometry.zeroY} />
        <ChartLines lines={geometry.lines} series={series} />
        <ChartAxisLabels labels={geometry.xLabels} />
      </svg>
      <ChartLegend series={series} />
    </figure>
  );
}
