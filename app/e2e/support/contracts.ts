import { expect, type Page } from '@playwright/test';

export interface ContractSeedOptions {
  activate?: boolean;
  depositVnd?: number;
  endAt: string;
  startAt: string;
  vehicleIds: string[];
}

export interface SeededContract {
  code: string;
  id: string;
}

const HANDOVER = {
  deliveryPlace: 'Cửa hàng',
  depositVnd: 500_000,
  fuelPercent: 80,
  imageObjectKeys: [],
  notes: '',
  retainedDocument: 'CCCD e2e',
};

async function csrfToken(page: Page): Promise<string> {
  const cookies = await page.context().cookies();
  const token = cookies.find((cookie) => cookie.name === 'rental_csrf')?.value;
  expect(token).toBeTruthy();
  return token ?? '';
}

function contractPayload(options: ContractSeedOptions) {
  return {
    confirmed: true,
    customerId: 'demo-customer',
    deliveryFeeVnd: 0,
    endAt: options.endAt,
    handover: { ...HANDOVER, depositVnd: options.depositVnd ?? HANDOVER.depositVnd },
    idempotencyKey: crypto.randomUUID(),
    overrides: [],
    startAt: options.startAt,
    vehicleIds: options.vehicleIds,
  };
}

/** Seeds a contract through the API using the signed-in browser session. */
export async function seedContract(page: Page, options: ContractSeedOptions) {
  const headers = { 'x-csrf-token': await csrfToken(page) };
  const created = await page.request.post('/api/contracts', {
    data: contractPayload(options),
    headers,
  });
  expect(created.ok()).toBe(true);
  const contract = (await created.json()) as SeededContract;
  if (options.activate) {
    const activated = await page.request.post(`/api/contracts/${contract.id}/activate`, {
      headers,
    });
    expect(activated.ok()).toBe(true);
  }
  return contract;
}

export interface PaymentSeedOptions {
  amountVnd: number;
  method: 'BANK_TRANSFER' | 'CASH';
  reference?: string;
}

/** Records one payment through the API; the key is fresh so every call is a new ledger row. */
export async function recordPayment(page: Page, contractId: string, options: PaymentSeedOptions) {
  const response = await page.request.post(`/api/contracts/${contractId}/payments`, {
    data: {
      amountVnd: options.amountVnd,
      idempotencyKey: crypto.randomUUID(),
      kind: 'PAYMENT',
      method: options.method,
      reference: options.reference ?? '',
    },
    headers: { 'x-csrf-token': await csrfToken(page) },
  });
  expect(response.ok()).toBe(true);
}
