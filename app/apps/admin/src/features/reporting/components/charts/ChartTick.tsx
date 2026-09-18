import { PLOT_LEFT, PLOT_RIGHT } from '@/features/reporting/lib/chart-geometry';

interface ChartTickProps {
  label: string;
  y: number;
}

const TICK_LABEL_GAP = 8;
const TICK_LABEL_BASELINE = 4;

/** One dashed guide line with its money label to the left of the plot. */
export function ChartTick({ label, y }: ChartTickProps) {
  return (
    <g>
      <line
        className="stroke-line"
        strokeDasharray="4 4"
        x1={PLOT_LEFT}
        x2={PLOT_RIGHT}
        y1={y}
        y2={y}
      />
      <text
        className="fill-current text-[11px]"
        textAnchor="end"
        x={PLOT_LEFT - TICK_LABEL_GAP}
        y={y + TICK_LABEL_BASELINE}
      >
        {label}
      </text>
    </g>
  );
}
