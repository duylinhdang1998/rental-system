import { useTranslation } from 'react-i18next';

interface ContractLineNotesProps {
  overrideReason?: string;
  replacedCode?: string;
  replacesCode?: string;
}

export function ContractLineNotes({
  overrideReason,
  replacedCode,
  replacesCode,
}: ContractLineNotesProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-1 text-sm">
      {overrideReason ? (
        <p className="text-caution">
          {t('contractOverrideReason')}: {overrideReason}
        </p>
      ) : null}
      {replacedCode ? (
        <p className="font-semibold">{t('contractLineReplaced', { code: replacedCode })}</p>
      ) : null}
      {replacesCode ? (
        <p className="font-semibold text-information">
          {t('contractLineReplaces', { code: replacesCode })}
        </p>
      ) : null}
    </div>
  );
}
