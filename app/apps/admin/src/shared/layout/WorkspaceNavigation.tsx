import type { UserRole } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { navigationForRole } from '@/shared/navigation/routes';
import { useNavigationPrefetch } from '@/shared/hooks/use-navigation-prefetch';

export function WorkspaceNavigation({
  role,
  onNavigate,
}: {
  role: UserRole;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const prefetch = useNavigationPrefetch();
  return (
    <nav aria-label={t('navigation')} className="grid min-h-0 gap-1 overflow-y-auto">
      {navigationForRole(role).map(({ icon: Icon, key, path }) => (
        <NavLink
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          end={path === '/'}
          key={path}
          onClick={onNavigate}
          onMouseEnter={() => prefetch(path)}
          onFocus={() => prefetch(path)}
          onPointerDown={() => prefetch(path)}
          to={path}
        >
          <Icon aria-hidden className="size-5 shrink-0" />
          {t(key)}
        </NavLink>
      ))}
    </nav>
  );
}
