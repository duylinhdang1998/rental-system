import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TABS = [
  { end: true, key: 'settingsTabPricing', to: '/settings' },
  { end: false, key: 'settingsTabDamageItems', to: '/settings/damage-items' },
] as const;

/** Both settings pages share this strip; the active tab carries aria-current="page". */
export function SettingsTabs() {
  const { t } = useTranslation();
  return (
    <nav aria-label={t('settings')} className="flex gap-2 border-b border-line pb-1">
      {TABS.map((tab) => (
        <NavLink
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          end={tab.end}
          key={tab.to}
          to={tab.to}
        >
          {t(tab.key)}
        </NavLink>
      ))}
    </nav>
  );
}
