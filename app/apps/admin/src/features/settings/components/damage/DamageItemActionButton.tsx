import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DamageItemActionButtonProps {
  code: string;
  disabled: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant: 'default' | 'destructive' | 'outline';
}

export function DamageItemActionButton({
  code,
  disabled,
  icon: Icon,
  label,
  onClick,
  variant,
}: DamageItemActionButtonProps) {
  return (
    <Button
      aria-label={`${label} ${code}`}
      disabled={disabled}
      onClick={onClick}
      size="sm"
      type="button"
      variant={variant}
    >
      <Icon aria-hidden data-icon="inline-start" />
      {label}
    </Button>
  );
}
