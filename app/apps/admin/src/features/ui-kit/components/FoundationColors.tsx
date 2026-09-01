const COLORS = [
  ['Brand', 'bg-brand', '#6D5DD3'],
  ['Brand soft', 'bg-brand-soft', '#EEEAFE'],
  ['Positive', 'bg-positive', '#167A59'],
  ['Caution', 'bg-caution', '#9A5B08'],
  ['Negative', 'bg-negative', '#B52E3A'],
  ['Information', 'bg-information', '#2468B4'],
] as const;

export function FoundationColors() {
  return (
    <div>
      <h3 className="mb-3 text-sm font-extrabold text-ink">Màu ngữ nghĩa</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {COLORS.map(([name, color, value]) => (
          <div className="rounded-control border border-line p-3" key={name}>
            <span className={`mb-3 block h-12 rounded-control ${color}`} />
            <p className="text-sm font-bold text-ink">{name}</p>
            <p className="text-xs text-ink-muted">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
