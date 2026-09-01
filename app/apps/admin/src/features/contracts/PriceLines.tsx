import type { Quote } from '@rental/contracts';

export function PriceLines({ quote }: { quote?: Quote }) {
  return quote?.lines.map((line) => (
    <article className="surface-card p-4" key={line.vehicleId}>
      <div className="flex justify-between gap-3">
        <strong>{line.vehicleCode}</strong>
        <strong>{line.finalSubtotalVnd.toLocaleString()} ₫</strong>
      </div>
      <p className="mt-2 text-sm text-ink-muted">{line.explanation}</p>
    </article>
  ));
}
