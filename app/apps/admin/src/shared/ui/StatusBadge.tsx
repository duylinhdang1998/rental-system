import { Circle, CircleAlert, CircleCheck, Clock3 } from 'lucide-react';

interface StatusBadgeProps {
  label: string;
  tone: 'danger' | 'info' | 'success' | 'warning';
}

const ICONS = { danger: CircleAlert, info: Clock3, success: CircleCheck, warning: Circle };
const CLASSES = {
  danger: 'bg-negative-soft text-negative',
  info: 'bg-information-soft text-information',
  success: 'bg-positive-soft text-positive',
  warning: 'bg-caution-soft text-caution',
};

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  const Icon = ICONS[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold ${CLASSES[tone]}`}
    >
      <Icon aria-hidden className="size-3.5" />
      {label}
    </span>
  );
}
