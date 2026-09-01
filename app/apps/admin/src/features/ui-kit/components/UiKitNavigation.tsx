import { UI_KIT_SECTIONS } from '@/features/ui-kit/lib/ui-kit-sections';

export function UiKitNavigation() {
  return (
    <nav aria-label="Danh mục component" className="min-w-0 lg:sticky lg:top-6">
      <p className="mb-2 px-3 text-xs font-bold tracking-widest text-ink-muted uppercase">
        Danh mục
      </p>
      <div className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
        {UI_KIT_SECTIONS.map(({ id, title }) => (
          <a className="nav-link shrink-0" href={`#${id}`} key={id}>
            {title}
          </a>
        ))}
      </div>
    </nav>
  );
}
