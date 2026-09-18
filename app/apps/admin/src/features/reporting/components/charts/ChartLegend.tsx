interface ChartLegendProps {
  series: readonly { key: string; label: string; tone: string }[];
}

/** Real text outside the SVG so the legend is readable without the image. */
export function ChartLegend({ series }: ChartLegendProps) {
  return (
    <figcaption className="flex flex-wrap gap-4 text-sm font-semibold text-ink-muted">
      {series.map((item) => (
        <span className="inline-flex items-center gap-2" key={item.key}>
          <span aria-hidden className={`inline-block size-3 rounded-full ${item.tone}`} />
          {item.label}
        </span>
      ))}
    </figcaption>
  );
}
