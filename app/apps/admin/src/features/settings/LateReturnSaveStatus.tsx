import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { LateReturnForm } from './use-late-return-form';

interface LateReturnSaveStatusProps {
  publish: LateReturnForm['publish'];
}

export function LateReturnSaveStatus({ publish }: LateReturnSaveStatusProps) {
  const { t } = useTranslation();
  if (publish.isError)
    return (
      <p className="rounded-control bg-negative-soft p-3 font-semibold text-negative" role="alert">
        {publish.error.message}
      </p>
    );
  if (!publish.isSuccess) return null;
  return (
    <p
      className="flex items-center gap-2 rounded-control bg-positive-soft p-3 font-semibold text-positive"
      role="status"
    >
      <CheckCircle2 aria-hidden className="size-5" />
      {t('lateReturnSaved', { version: publish.data.version })}
    </p>
  );
}
