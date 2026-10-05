import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { useSession } from '@/features/auth/hooks/use-session';
import { navigationForRole } from '@/shared/navigation/routes';
import { useNavigationPrefetch } from '@/shared/hooks/use-navigation-prefetch';

const MOBILE_ITEM_COUNT = 5;

export function MobileNavigation() {
  const { t } = useTranslation();
  const { user } = useSession();
  const prefetch = useNavigationPrefetch();
  if (!user) return null;
  const items = navigationForRole(user.role).slice(0, MOBILE_ITEM_COUNT);
  return (
    <nav
      aria-label={t('quickNavigation')}
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-line bg-panel px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      {items.map(({ icon: Icon, key, path }) => (
        <NavLink
          className={({ isActive }) =>
            `flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-control text-xs font-medium ${isActive ? 'bg-brand-soft text-brand-ink' : 'text-ink-muted'}`
          }
          end={path === '/'}
          key={path}
          onFocus={() => prefetch(path)}
          onPointerDown={() => prefetch(path)}
          to={path}
        >
          <Icon aria-hidden className="size-5" />
          <span>{t(key)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
