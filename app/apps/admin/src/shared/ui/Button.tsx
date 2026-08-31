import { LoaderCircle } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
}

export function Button({ children, className = '', loading = false, ...props }: ButtonProps) {
  return (
    <button
      className={`button-base button-primary ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : null}
      <span>{children}</span>
    </button>
  );
}
