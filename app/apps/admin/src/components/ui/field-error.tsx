import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function FieldError({ children, className, ...props }: ComponentProps<'div'>) {
  if (!children) return null;
  return (
    <div
      className={cn('text-sm font-normal text-destructive', className)}
      data-slot="field-error"
      role="alert"
      {...props}
    >
      {children}
    </div>
  );
}
