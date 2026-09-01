import { useTranslation } from 'react-i18next';

interface Props {
  busy?: boolean;
  primaryLabel?: string;
  showBack: boolean;
  onBack: () => void;
}

export function WizardActions({ busy, primaryLabel, showBack, onBack }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap justify-end gap-3 pt-3">
      {showBack ? (
        <button className="button-base border border-line bg-panel" onClick={onBack} type="button">
          {t('contractBack')}
        </button>
      ) : null}
      <button className="button-base button-primary" disabled={busy} type="submit">
        {busy ? '…' : (primaryLabel ?? t('contractNext'))}
      </button>
    </div>
  );
}
