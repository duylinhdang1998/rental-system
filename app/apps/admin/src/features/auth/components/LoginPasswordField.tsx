import { useTranslation } from 'react-i18next';
import { TextField } from '@/shared/ui/TextField';
import { usePasswordVisibility } from '@/features/auth/hooks/use-password-visibility';
import { PasswordVisibilityButton } from '@/features/auth/components/PasswordVisibilityButton';

export function LoginPasswordField({
  password,
  setPassword,
}: {
  password: string;
  setPassword: (value: string) => void;
}) {
  const { t } = useTranslation();
  const { visible, toggle } = usePasswordVisibility();
  return (
    <div className="relative">
      <TextField
        autoComplete="current-password"
        id="password"
        className="pr-12"
        label={t('password')}
        onChange={(event) => setPassword(event.target.value)}
        required
        type={visible ? 'text' : 'password'}
        value={password}
      />
      <PasswordVisibilityButton onToggle={toggle} visible={visible} />
    </div>
  );
}
