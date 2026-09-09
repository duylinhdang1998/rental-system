import { LoaderCircle } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Button as ShadcnButton } from '@/components/ui/button';

export type ButtonVariant = 'default' | 'destructive' | 'outline';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  variant?: ButtonVariant;
}

export function LoadingButton({
  children,
  className = '',
  loading = false,
  variant = 'default',
  ...props
}: LoadingButtonProps) {
  return (
    <ShadcnButton
      aria-busy={loading}
      className={`relative ${className}`}
      disabled={loading || props.disabled}
      variant={variant}
      {...props}
    >
      <span className={loading ? 'opacity-0' : undefined}>{children}</span>
      {loading ? <LoaderCircle aria-hidden className="absolute animate-spin" /> : null}
    </ShadcnButton>
  );
}
