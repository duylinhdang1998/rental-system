const TYPE_SCALE = [
  ['Display', 'type-display', '32 / 700'],
  ['Heading', 'type-h2', '22 / 700'],
  ['Body', 'type-body', '14 / 450'],
  ['Label', 'type-label', '13 / 650'],
] as const;

export function FoundationTypography() {
  return (
    <div>
      <h3 className="mb-3 text-sm font-extrabold text-ink">Inter &amp; tỷ lệ chữ</h3>
      <div className="grid gap-3">
        {TYPE_SCALE.map(([name, style, meta]) => (
          <div
            className="flex items-baseline justify-between gap-4 border-b border-line pb-3"
            key={name}
          >
            <p className={style}>{name}</p>
            <span className="text-xs text-ink-muted">{meta}</span>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm leading-6 text-ink-muted">
        Radius mềm 12–16px, bóng đổ nhẹ và khoảng cách theo nhịp 4px.
      </p>
    </div>
  );
}
