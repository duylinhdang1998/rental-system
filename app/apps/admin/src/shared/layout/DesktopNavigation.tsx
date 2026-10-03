import { Bike } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { useSession } from '@/features/auth/hooks/use-session';
import { WorkspaceNavigation } from '@/shared/layout/WorkspaceNavigation';
import { LogoutButton } from '@/shared/layout/LogoutButton';

export function DesktopNavigation() {
  const { t } = useTranslation();
  const { user } = useSession();
  if (!user) return null;
  return (
    <aside className="sticky top-0 hidden h-screen border-r border-line bg-panel p-4 lg:flex lg:flex-col">
      <NavLink
        className="mb-6 flex min-h-touch shrink-0 items-center gap-3 px-3 text-lg font-semibold text-brand-ink"
        to="/"
      >
        <Bike aria-hidden /> MotoRental
      </NavLink>
      <WorkspaceNavigation role={user.role} />
      <div className="mt-auto grid shrink-0 gap-3 border-t border-line pt-4">
        <div className="px-3">
          <p className="break-words font-semibold text-ink">{user.name}</p>
          <p className="text-sm text-ink-muted">{t(`roles.${user.role}`)}</p>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
