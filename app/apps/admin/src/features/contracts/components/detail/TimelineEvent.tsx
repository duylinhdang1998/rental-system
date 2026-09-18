import type { ContractEvent } from '@rental/contracts';
import {
  AlertCircle,
  BadgeCheck,
  Ban,
  CalendarPlus,
  CheckCircle2,
  FilePlus2,
  HandCoins,
  KeyRound,
  PackageCheck,
  Receipt,
  Repeat,
  Undo2,
  Wallet,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { describeEvent } from '@/features/contracts/lib/contract-presentation';
import { formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface TimelineEventProps {
  event: ContractEvent;
}

const EVENT_ICONS = {
  ACTIVATED: KeyRound,
  CANCELLED: Ban,
  CHARGE_ADDED: Receipt,
  COMPLETED: CheckCircle2,
  CREATED: FilePlus2,
  DEPOSIT_REFUNDED: HandCoins,
  EXTENDED: CalendarPlus,
  LINE_RETURNED: PackageCheck,
  OVERDUE: AlertCircle,
  PAYMENT_RECORDED: Wallet,
  REFUND_RECORDED: Undo2,
  SETTLED: BadgeCheck,
  SWAPPED: Repeat,
};
const EVENT_TONES = {
  ACTIVATED: 'bg-information-soft text-information',
  CANCELLED: 'bg-panel-subtle text-ink-muted',
  CHARGE_ADDED: 'bg-caution-soft text-caution',
  COMPLETED: 'bg-positive-soft text-positive',
  CREATED: 'bg-brand-soft text-brand-ink',
  DEPOSIT_REFUNDED: 'bg-caution-soft text-caution',
  EXTENDED: 'bg-caution-soft text-caution',
  LINE_RETURNED: 'bg-positive-soft text-positive',
  OVERDUE: 'bg-negative-soft text-negative',
  PAYMENT_RECORDED: 'bg-positive-soft text-positive',
  REFUND_RECORDED: 'bg-caution-soft text-caution',
  SETTLED: 'bg-brand-soft text-brand-ink',
  SWAPPED: 'bg-information-soft text-information',
};

export function TimelineEvent({ event }: TimelineEventProps) {
  const { i18n, t } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  const Icon = EVENT_ICONS[event.type];
  const detail = describeEvent(event, locale);
  const actor = event.actorId === 'system' ? t('contractSystemActor') : event.actorId;
  return (
    <li className="flex gap-3 rounded-card border border-line p-3">
      <span className={`rounded-control p-2 ${EVENT_TONES[event.type]}`}>
        <Icon aria-hidden className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="font-bold text-ink">{t(`contractEvent.${event.type}`)}</p>
        <p className="text-xs text-ink-muted">
          {formatDateTime(event.occurredAt, locale)} · {actor}
        </p>
        {detail ? <p className="mt-1 text-sm text-ink">{detail}</p> : null}
      </div>
    </li>
  );
}
