import { useTranslation } from 'react-i18next';
import { ChartTick } from '@/features/reporting/components/charts/ChartTick';
import {
  PLOT_LEFT,
  PLOT_RIGHT,
  type ChartTick as Tick,
} from '@/features/reporting/lib/chart-geometry';
import { resolveInitialLocale } from '@/shared/i18n/locale';

interface ChartGridProps {
  ticks: readonly Tick[];
  zeroY: number;
}

/** Dashed guide per tick with a compact money label, plus the solid zero line. */
export function ChartGrid({ ticks, zeroY }: ChartGridProps) {
  const { i18n } = useTranslation();
  const compact = new Intl.NumberFormat(resolveInitialLocale(i18n.language), {
    maximumFractionDigits: 1,
    notation: 'compact',
  });
  return (
    <g data-chart-grid>
      {ticks.map((tick) => (
        <ChartTick key={tick.value} label={compact.format(tick.value)} y={tick.y} />
      ))}
      <line className="stroke-line-strong" x1={PLOT_LEFT} x2={PLOT_RIGHT} y1={zeroY} y2={zeroY} />
    </g>
  );
}
