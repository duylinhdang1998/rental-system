import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export function PasswordVisibilityButton({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Button
      aria-label={t(visible ? 'hidePassword' : 'showPassword')}
      aria-pressed={visible}
      className="absolute right-1 bottom-1"
      onClick={onToggle}
      size="icon-sm"
      type="button"
      variant="ghost"
    >
      {visible ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
    </Button>
  );
}
