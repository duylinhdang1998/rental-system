import { useTranslation } from 'react-i18next';
import { Dialog } from '@/components/ui/dialog';
import { DialogContent } from '@/components/ui/dialog-content';
import { DialogDescription } from '@/components/ui/dialog-description';
import { DialogHeader } from '@/components/ui/dialog-header';
import { DialogTitle } from '@/components/ui/dialog-title';
import { AvailabilityCalendar } from './AvailabilityCalendar';

interface AvailabilityCalendarDialogProps {
  from: string;
  onFromChange: (date: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  typeCode?: string;
}

export function AvailabilityCalendarDialog(props: AvailabilityCalendarDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog onOpenChange={props.onOpenChange} open={props.open}>
      <DialogContent className="calendar-dialog-content" closeLabel={t('close')}>
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">{t('fleetCalendar')}</DialogTitle>
          <DialogDescription>{t('fleetSubtitle')}</DialogDescription>
        </DialogHeader>
        <AvailabilityCalendar
          from={props.from}
          onFromChange={props.onFromChange}
          typeCode={props.typeCode}
        />
      </DialogContent>
    </Dialog>
  );
}
