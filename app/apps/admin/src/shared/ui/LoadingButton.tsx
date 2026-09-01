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
    <ShadcnButton
      aria-busy={loading}
      className={`relative ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      <span className={loading ? 'opacity-0' : undefined}>{children}</span>
      {loading ? <LoaderCircle aria-hidden className="absolute animate-spin" /> : null}
    </ShadcnButton>
  );
}
