import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { CustomerInput } from '@rental/contracts';
import { useCreateCustomer } from '../hooks/use-customers';
import { fetchDuplicates } from '../api/customers-api';

interface CustomerFields {
  email: string;
  name: string;
  nationality: string;
  phone: string;
}
const EMPTY_FIELDS: CustomerFields = { email: '', name: '', nationality: 'VN', phone: '' };
const MIN_DUPLICATE_SEARCH_LENGTH = 9;

export function useCustomerForm(onCreated: () => void) {
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const create = useCreateCustomer();
  const duplicates = useQuery({
    enabled: fields.phone.replace(/\D/g, '').length >= MIN_DUPLICATE_SEARCH_LENGTH,
    queryFn: () => fetchDuplicates(fields.phone),
    queryKey: ['customer-duplicates', fields.phone],
  });
  const change = (field: keyof CustomerFields, value: string) =>
    setFields((current) => ({ ...current, [field]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const contacts: CustomerInput['contacts'] = [
      { primary: true, type: 'PHONE', value: fields.phone },
    ];
    if (fields.email) contacts.push({ primary: false, type: 'EMAIL', value: fields.email });
    create.mutate(
      { contacts, name: fields.name, nationality: fields.nationality, tags: [] },
      {
        onSuccess: () => {
          setFields(EMPTY_FIELDS);
          onCreated();
        },
      },
    );
  };
  return { change, create, duplicates, fields, submit };
}
