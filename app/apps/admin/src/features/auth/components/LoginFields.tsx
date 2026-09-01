import { TextField } from '../../../shared/ui/TextField';

interface LoginFieldsProps {
  password: string;
  setPassword: (value: string) => void;
  setUsername: (value: string) => void;
  username: string;
}

export function LoginFields(props: LoginFieldsProps) {
  return (
    <>
      <TextField
        autoComplete="username"
        id="username"
        label="Tên đăng nhập"
        onChange={(event) => props.setUsername(event.target.value)}
        required
        value={props.username}
      />
      <TextField
        autoComplete="current-password"
        id="password"
        label="Mật khẩu"
        onChange={(event) => props.setPassword(event.target.value)}
        required
        type="password"
        value={props.password}
      />
    </>
  );
}
