import { expect, type Page } from '@playwright/test';
import { csrfToken } from './contracts';

export interface ExpenseSeedOptions {
  amountVnd: number;
  description: string;
  paidOn: string;
  vehicleId?: string | null;
}

/** Records one expense through the API with the signed-in browser session; the key is fresh. */
export async function seedExpense(page: Page, options: ExpenseSeedOptions) {
  const response = await page.request.post('/api/expenses', {
    data: {
      amountVnd: options.amountVnd,
      category: 'MAINTENANCE',
      description: options.description,
      idempotencyKey: crypto.randomUUID(),
      method: 'CASH',
      paidOn: options.paidOn,
      vehicleId: options.vehicleId ?? null,
    },
    headers: { 'x-csrf-token': await csrfToken(page) },
  });
  expect(response.ok()).toBe(true);
}
