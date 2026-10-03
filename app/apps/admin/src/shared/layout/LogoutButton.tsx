import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLogout } from '@/shared/hooks/use-logout';
import { LoadingButton } from '@/shared/ui/LoadingButton';

export function LogoutButton() {
  const { t } = useTranslation();
  const { pending, error, logout } = useLogout();
  return (
    <div className="grid gap-2">
      <LoadingButton
        className="w-full"
        loading={pending}
        onClick={() => void logout()}
        type="button"
        variant="outline"
      >
        <LogOut aria-hidden className="size-4" />
        {t('logout')}
      </LoadingButton>
      {error ? (
        <p className="text-sm text-negative" role="alert">
          {t('logoutError')}
        </p>
      ) : null}
    </div>
  );
}
