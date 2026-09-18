import { X_LABEL_Y, type ChartLabel } from '@/features/reporting/lib/chart-geometry';

interface ChartAxisLabelsProps {
  labels: readonly ChartLabel[];
}

export function ChartAxisLabels({ labels }: ChartAxisLabelsProps) {
  return (
    <g data-chart-axis>
      {labels.map((label) => (
        <text
          className="fill-current text-[11px]"
          key={label.x}
          textAnchor="middle"
          x={label.x}
          y={X_LABEL_Y}
        >
          {label.label}
        </text>
      ))}
    </g>
  );
}
