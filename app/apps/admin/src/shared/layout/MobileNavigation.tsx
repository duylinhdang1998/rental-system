import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { useSession } from '@/features/auth/hooks/use-session';
import { navigationForRole } from '@/shared/navigation/routes';

const MOBILE_ITEM_COUNT = 5;

export function MobileNavigation() {
  const { t } = useTranslation();
  const { user } = useSession();
  if (!user) return null;
  const items = navigationForRole(user.role).slice(0, MOBILE_ITEM_COUNT);
  return (
    <nav
      aria-label="Điều hướng di động"
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-line bg-panel px-1 pb-1 lg:hidden"
    >
      {items.map(({ icon: Icon, key, path }) => (
        <NavLink
          className={({ isActive }) =>
            `flex min-h-touch flex-col items-center justify-center gap-1 rounded-control text-xs font-bold ${isActive ? 'bg-brand-soft text-brand' : 'text-ink-muted'}`
          }
          end={path === '/'}
          key={path}
          to={path}
        >
          <Icon aria-hidden className="size-5" />
          <span>{t(key)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
