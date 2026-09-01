import { useTranslation } from 'react-i18next';
import { Dialog } from '@/components/ui/dialog';
import { DialogContent } from '@/components/ui/dialog-content';
import { DialogDescription } from '@/components/ui/dialog-description';
import { DialogHeader } from '@/components/ui/dialog-header';
import { DialogTitle } from '@/components/ui/dialog-title';
import { CustomerForm } from '@/features/customers/components/form/CustomerForm';
import { focusDialogPrimaryField } from '@/shared/ui/dialog-focus';

interface CustomerCreateDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function CustomerCreateDialog({ onOpenChange, open }: CustomerCreateDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className="form-dialog-content sm:max-w-2xl"
        closeLabel={t('close')}
        onOpenAutoFocus={focusDialogPrimaryField}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">{t('addCustomer')}</DialogTitle>
          <DialogDescription>{t('customerFormHelp')}</DialogDescription>
        </DialogHeader>
        <CustomerForm onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
