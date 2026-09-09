import type { ContractLine } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { ContractLineItem } from '@/features/contracts/components/detail/ContractLineItem';

interface ContractLineListProps {
  lines: ContractLine[];
}

export function ContractLineList({ lines }: ContractLineListProps) {
  const { t } = useTranslation();
  return (
    <section className="surface-card p-5" data-mobile-card>
      <h2 className="text-lg font-extrabold text-ink">{t('contractLines')}</h2>
      <ul className="mt-4 grid gap-3">
        {lines.map((line) => (
          <ContractLineItem
            key={line.id}
            line={line}
            replacedCode={lines.find((item) => item.id === line.replacedByLineId)?.vehicleCode}
            replacesCode={lines.find((item) => item.id === line.replacesLineId)?.vehicleCode}
          />
        ))}
      </ul>
    </section>
  );
}
