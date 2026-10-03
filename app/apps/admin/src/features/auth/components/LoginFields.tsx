import { TextField } from '@/shared/ui/TextField';
import { LoginPasswordField } from '@/features/auth/components/LoginPasswordField';
import { useTranslation } from 'react-i18next';

interface LoginFieldsProps {
  password: string;
  setPassword: (value: string) => void;
  setUsername: (value: string) => void;
  username: string;
}

export function LoginFields(props: LoginFieldsProps) {
  const { t } = useTranslation();
  return (
    <>
      <TextField
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        id="username"
        label={t('username')}
        onChange={(event) => props.setUsername(event.target.value)}
        required
        value={props.username}
      />
      <LoginPasswordField password={props.password} setPassword={props.setPassword} />
    </>
  );
}
