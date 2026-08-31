import { Button } from '../../shared/ui/Button';
import { LoginFields } from './LoginFields';
import { useLoginForm } from './use-login-form';

export function LoginForm() {
  const form = useLoginForm();
  return (
    <form className="grid gap-5" onSubmit={(event) => void form.submit(event)}>
      {form.error ? (
        <p
          className="rounded-control bg-negative-soft p-3 text-sm font-bold text-negative"
          role="alert"
        >
          {form.error}
        </p>
      ) : null}
      <LoginFields {...form} />
      <Button className="w-full" loading={form.submitting} type="submit">
        Đăng nhập
      </Button>
    </form>
  );
}
