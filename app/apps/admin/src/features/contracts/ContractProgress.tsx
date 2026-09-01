import { useTranslation } from 'react-i18next';

const STEP_KEYS = [
  'contractCustomer',
  'contractVehicles',
  'contractPrice',
  'contractHandover',
  'contractConfirm',
];

export function ContractProgress({ step }: { step: number }) {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t('contractStep', { current: step + 1, total: 5 })}
      className="surface-card p-3"
    >
      <p className="mb-2 text-sm font-bold text-brand sm:hidden">
        {t('contractStep', { current: step + 1, total: 5 })}
      </p>
      <ol className="grid grid-cols-5 gap-1">
        {STEP_KEYS.map((key, index) => (
          <li
            className={`rounded-control px-2 py-2 text-center text-xs font-bold ${index === step ? 'bg-brand text-white' : index < step ? 'bg-positive-soft text-positive' : 'bg-panel-subtle text-ink-muted'}`}
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
