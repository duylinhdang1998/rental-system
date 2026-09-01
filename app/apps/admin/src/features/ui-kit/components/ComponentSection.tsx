import type { ReactNode } from 'react';

interface ComponentSectionProps {
  children: ReactNode;
  description: string;
  id: string;
  title: string;
}

export function ComponentSection({ children, description, id, title }: ComponentSectionProps) {
  return (
    <section aria-labelledby={`${id}-title`} className="scroll-mt-6" id={id}>
      <div className="mb-5">
        <p className="mb-1 text-xs font-bold tracking-widest text-brand uppercase">Component</p>
        <h2 className="type-h2 tracking-tight text-ink" id={`${id}-title`}>
          {title}
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-muted">{description}</p>
      </div>
      <div className="surface-card p-4 sm:p-6">{children}</div>
    </section>
  );
}
