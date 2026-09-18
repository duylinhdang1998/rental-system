import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

type ReportTab = 'fleet' | 'revenue';

interface ReportTabsProps {
  active: ReportTab;
}

const TABS: { key: ReportTab; path: string }[] = [
  { key: 'revenue', path: '/reports' },
  { key: 'fleet', path: '/reports/fleet' },
];

/** Plain links styled as tabs: each report keeps its own URL and its own Owner-only route. */
export function ReportTabs({ active }: ReportTabsProps) {
  const { t } = useTranslation();
  return (
    <nav aria-label={t('reportTabsLabel')} className="flex flex-wrap gap-2" data-report-tabs>
      {TABS.map((tab) => (
        <Button asChild key={tab.key} variant={tab.key === active ? 'default' : 'outline'}>
          <Link aria-current={tab.key === active ? 'page' : undefined} to={tab.path}>
            {t(`reportTabs.${tab.key}`)}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
