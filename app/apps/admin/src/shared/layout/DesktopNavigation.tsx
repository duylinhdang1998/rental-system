import { Bike } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { useSession } from '../../features/auth/use-session';
import { navigationForRole } from '../navigation/routes';

const ROLE_LABELS = { OWNER: 'Chủ cửa hàng', STAFF: 'Nhân viên' } as const;

export function DesktopNavigation() {
  const { t } = useTranslation();
  const { user } = useSession();
  if (!user) return null;
  return (
    <aside className="sticky top-0 hidden h-screen border-r border-line bg-panel p-4 lg:flex lg:flex-col">
      <div className="mb-8 flex min-h-touch items-center gap-3 px-3 text-xl font-extrabold text-brand">
        <Bike aria-hidden /> MotoRental
      </div>
      <nav aria-label="Điều hướng chính" className="grid gap-1">
        {navigationForRole(user.role).map(({ icon: Icon, key, path }) => (
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            end={path === '/'}
            key={path}
            to={path}
          >
            <Icon aria-hidden className="size-5" />
            {t(key)}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto border-t border-line px-3 pt-4">
        <p className="font-bold text-ink">{user.name}</p>
        <p className="text-sm text-ink-muted">{ROLE_LABELS[user.role]}</p>
      </div>
    </aside>
  );
}
