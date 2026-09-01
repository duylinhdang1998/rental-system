import type { CustomerContact } from '@rental/contracts';
import { Mail, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CustomerContactsProps {
  contacts: CustomerContact[];
}

export function CustomerContacts({ contacts }: CustomerContactsProps) {
  const { t } = useTranslation();
  return (
    <ul className="grid gap-2 text-sm text-ink-muted">
      {contacts.map((contact) => (
        <li className="flex items-center gap-2" key={`${contact.type}-${contact.value}`}>
          {contact.type === 'PHONE' ? (
            <Phone aria-hidden className="size-4" />
          ) : (
            <Mail aria-hidden className="size-4" />
          )}
          <span>{contact.value}</span>
          {contact.primary ? (
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand">
              {t('primary')}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
