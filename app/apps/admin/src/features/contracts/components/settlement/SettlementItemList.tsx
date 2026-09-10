import type { SettlementItem } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { formatCurrency, resolveInitialLocale } from '@/shared/i18n/locale';

interface SettlementItemListProps {
  items: SettlementItem[];
}

export function SettlementItemList({ items }: SettlementItemListProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <div>
      <h3 className="text-sm font-bold text-ink-muted">{t('settlementItems')}</h3>
      <ul className="mt-2 grid gap-2 text-sm" data-settlement-items>
        {items.map((item) => (
          <li
            className="flex items-baseline justify-between gap-3 border-b border-line pb-2"
            key={item.id}
          >
            <span className="min-w-0">
              <span className="font-bold text-ink">{t(`settlementKind.${item.kind}`)}</span>
              {item.vehicleCode ? (
                <span className="text-ink-muted"> · {item.vehicleCode}</span>
              ) : null}
              <span className="block text-ink-muted">{item.description}</span>
            </span>
            <strong className={item.kind === 'DISCOUNT' ? 'text-positive' : 'text-ink'}>
              {item.kind === 'DISCOUNT' ? '−' : ''}
              {formatCurrency(item.amountVnd, locale)}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
