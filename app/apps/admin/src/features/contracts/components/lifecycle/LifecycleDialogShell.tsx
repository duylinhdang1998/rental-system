import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '@/components/ui/dialog';
import { DialogContent } from '@/components/ui/dialog-content';
import { DialogDescription } from '@/components/ui/dialog-description';
import { DialogHeader } from '@/components/ui/dialog-header';
import { DialogTitle } from '@/components/ui/dialog-title';
import { focusDialogPrimaryField } from '@/shared/ui/dialog-focus';

interface LifecycleDialogShellProps {
  children: ReactNode;
  description: string;
  onClose: () => void;
  title: string;
}

export function LifecycleDialogShell(props: LifecycleDialogShellProps) {
  const { t } = useTranslation();
  return (
    <Dialog onOpenChange={(open) => (open ? undefined : props.onClose())} open>
      <DialogContent
        className="form-dialog-content sm:max-w-lg"
        closeLabel={t('close')}
        onOpenAutoFocus={focusDialogPrimaryField}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">{props.title}</DialogTitle>
          <DialogDescription>{props.description}</DialogDescription>
        </DialogHeader>
        {props.children}
      </DialogContent>
    </Dialog>
  );
}
