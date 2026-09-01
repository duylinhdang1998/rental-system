import { LoaderCircle } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Button as ShadcnButton } from '@/components/ui/button';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
}

export function LoadingButton({
  children,
  className = '',
  loading = false,
  ...props
}: LoadingButtonProps) {
  return (
    <ShadcnButton className={className} disabled={loading || props.disabled} {...props}>
      {loading ? (
        <LoaderCircle aria-hidden className="animate-spin" data-icon="inline-start" />
      ) : null}
      {children}
    </ShadcnButton>
  );
}
