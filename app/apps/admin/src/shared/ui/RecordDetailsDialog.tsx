import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '@/components/ui/dialog';
import { DialogContent } from '@/components/ui/dialog-content';
import { DialogHeader } from '@/components/ui/dialog-header';
import { DialogTitle } from '@/components/ui/dialog-title';
import { DialogDescription } from '@/components/ui/dialog-description';
import { RecordDetailsList } from '@/shared/ui/RecordDetailsList';

interface RecordDetailsDialogProps {
  title: string;
  description: string;
  details: { label: string; value: ReactNode }[];
  children?: ReactNode;
  onClose: () => void;
}

export function RecordDetailsDialog({
  title,
  description,
  details,
  children,
  onClose,
}: RecordDetailsDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      open
    >
      <DialogContent className="form-dialog-content sm:max-w-lg" closeLabel={t('close')}>
        <DialogHeader className="pr-10">
          <DialogTitle className="break-words">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <RecordDetailsList details={details} />
        {children}
      </DialogContent>
    </Dialog>
  );
}
