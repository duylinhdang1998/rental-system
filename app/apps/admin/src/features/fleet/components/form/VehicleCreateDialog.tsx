import { useTranslation } from 'react-i18next';
import { Dialog } from '@/components/ui/dialog';
import { DialogContent } from '@/components/ui/dialog-content';
import { DialogDescription } from '@/components/ui/dialog-description';
import { DialogHeader } from '@/components/ui/dialog-header';
import { DialogTitle } from '@/components/ui/dialog-title';
import { VehicleForm } from '@/features/fleet/components/form/VehicleForm';
import { focusDialogPrimaryField } from '@/shared/ui/dialog-focus';

interface VehicleCreateDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function VehicleCreateDialog({ onOpenChange, open }: VehicleCreateDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className="form-dialog-content sm:max-w-2xl"
        closeLabel={t('close')}
        onOpenAutoFocus={focusDialogPrimaryField}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">{t('addVehicle')}</DialogTitle>
          <DialogDescription>{t('vehicleFormHelp')}</DialogDescription>
        </DialogHeader>
        <VehicleForm onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
