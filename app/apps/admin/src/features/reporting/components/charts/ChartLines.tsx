import type { ChartLine, ChartSeriesInput } from '@/features/reporting/lib/chart-geometry';

interface ChartLinesProps {
  lines: readonly ChartLine[];
  series: readonly (ChartSeriesInput & { tone: string })[];
}

const POINT_RADIUS = 3;

/** One path and its points per series; the tone class colours both. */
export function ChartLines({ lines, series }: ChartLinesProps) {
  return (
    <g data-chart-lines>
      {lines.map((line, index) => (
        <g className={series[index]?.tone} data-trend-series={line.key} key={line.key}>
          <path d={line.path} fill="none" strokeLinejoin="round" strokeWidth={2} />
          {line.points.map((point) => (
            <circle cx={point.x} cy={point.y} key={point.x} r={POINT_RADIUS} />
          ))}
        </g>
      ))}
    </g>
  );
}
