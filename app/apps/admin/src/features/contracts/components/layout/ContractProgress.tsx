import { useTranslation } from 'react-i18next';

const STEP_KEYS = [
  'contractCustomer',
  'contractVehicles',
  'contractPrice',
  'contractHandover',
  'contractConfirm',
] as const;

export function ContractProgress({ step }: { step: number }) {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t('contractStep', { current: step + 1, total: 5 })}
      className="surface-card p-3"
    >
      <p className="mb-2 text-sm font-medium text-brand-ink sm:hidden">
        {t('contractStep', { current: step + 1, total: 5 })} · {t(STEP_KEYS[step] ?? STEP_KEYS[0])}
      </p>
      <ol className="grid grid-cols-5 gap-1">
        {STEP_KEYS.map((key, index) => (
          <li
            aria-current={index === step ? 'step' : undefined}
            className={`rounded-control px-2 py-2 text-center text-xs font-medium ${index === step ? 'bg-brand text-primary-foreground' : index < step ? 'bg-positive-soft text-positive' : 'bg-panel-subtle text-ink-muted'}`}
            key={key}
          >
            <span className="sm:hidden">{index + 1}</span>
            <span className="hidden sm:inline">{t(key)}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
