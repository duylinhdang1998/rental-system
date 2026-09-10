import { FileSpreadsheet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface ReportExportButtonProps {
  disabled: boolean;
  href: string;
}

/** A real link: the download carries the session cookie, no blob juggling in the page. */
export function ReportExportButton({ disabled, href }: ReportExportButtonProps) {
  const { t } = useTranslation();
  if (disabled) {
    return (
      <Button disabled type="button" variant="outline">
        <FileSpreadsheet aria-hidden data-icon="inline-start" />
        {t('reportExport')}
      </Button>
    );
  }
  return (
    <Button asChild variant="outline">
      <a download href={href}>
        <FileSpreadsheet aria-hidden data-icon="inline-start" />
        {t('reportExport')}
      </a>
    </Button>
  );
}
