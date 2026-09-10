import { expect, test } from '@playwright/test';
import { signInAs } from './support/auth';
import { recordPayment, seedContract } from './support/contracts';

/** Past-dated rentals on their own windows; each is activated because bookings are never debts. */
const RENTALS = {
  detail: { endAt: '2026-07-21T08:00:00.000Z', startAt: '2026-07-20T08:00:00.000Z' },
  list: { endAt: '2026-07-24T08:00:00.000Z', startAt: '2026-07-23T08:00:00.000Z' },
  report: { endAt: '2026-07-11T08:00:00.000Z', startAt: '2026-07-10T08:00:00.000Z' },
} as const;

test.describe('Feature: Payments, receivables and reporting', () => {
  test.use({ timezoneId: 'Asia/Ho_Chi_Minh' });

  test('Scenario: Staff collects a partial payment from the contract detail page', async ({
    page,
  }) => {
    await signInAs(page, 'staff');
    const contract = await seedContract(page, {
      ...RENTALS.detail,
      activate: true,
      depositVnd: 0,
      vehicleIds: ['vehicle-003'],
    });
    await page.goto(`/contracts/${contract.id}`);
    const ledger = page.locator('[data-ledger]');
    await expect(ledger).toContainText('Chưa ghi nhận khoản thu nào');

    await page.getByRole('button', { exact: true, name: 'Thu tiền' }).click();
    const dialog = page.getByRole('dialog', { name: 'Thu tiền' });
    await expect(dialog.locator('[data-payment-cap]')).toContainText('150.000');
    await dialog.getByLabel('Số tiền (VNĐ)').fill('100000');
    await dialog.getByLabel('Ghi chú').fill('Thu lần 1');
    await dialog.getByRole('button', { name: 'Xác nhận thu tiền' }).click();
    await expect(dialog).toBeHidden();
    await expect(ledger.locator('[data-ledger-entries]')).toContainText('+100.000');
    await expect(ledger.locator('[data-ledger-entries]')).toContainText('Thu lần 1');
    await expect(ledger.locator('[data-ledger-balance]')).toContainText(/Còn phải thu\s*50\.000/);
    await expect(page.locator('[data-timeline]')).toContainText('Thu tiền');
  });

  test('Scenario: Staff clears a receivable from the list and never reads revenue aggregates', async ({
    page,
  }) => {
    await signInAs(page, 'staff');
    const contract = await seedContract(page, {
      ...RENTALS.list,
      activate: true,
      depositVnd: 0,
      vehicleIds: ['vehicle-003'],
    });
    await recordPayment(page, contract.id, { amountVnd: 100_000, method: 'CASH' });

    await page.goto('/receivables');
    await expect(page.getByRole('heading', { name: 'Công nợ' })).toBeVisible();
    const row = page.locator(`[data-receivable="${contract.code}"]`).first();
    await expect(row.locator('td').nth(3)).toHaveText(/50\.000/);
    await row.getByRole('button', { exact: true, name: 'Thu tiền' }).click();
    const collect = page.getByRole('dialog', { name: 'Thu tiền' });
    await expect(collect.locator('[data-payment-cap]')).toContainText('50.000');
    await collect.getByLabel('Số tiền (VNĐ)').fill('50000');
    await collect.getByRole('button', { name: 'Xác nhận thu tiền' }).click();
    await expect(collect).toBeHidden();
    await expect(page.locator(`[data-receivable="${contract.code}"]`)).toHaveCount(0);

    const denied = await page.request.get('/api/reports/revenue?from=2026-07-01&to=2026-07-31');
    expect(denied.status()).toBe(403);
  });

  test('Scenario: Owner reads the revenue report and downloads the Excel workbook', async ({
    page,
  }) => {
    await signInAs(page, 'owner');
    const contract = await seedContract(page, {
      ...RENTALS.report,
      depositVnd: 0,
      vehicleIds: ['vehicle-001'],
    });
    await recordPayment(page, contract.id, {
      amountVnd: 120_000,
      method: 'BANK_TRANSFER',
      reference: 'CK-E2E',
    });

    await page.goto('/reports');
    await expect(page.getByRole('heading', { name: 'Báo cáo doanh thu' })).toBeVisible();
    await expect(page.locator('[data-report-totals]')).toBeVisible();
    const row = page.locator(`[data-report-row="${contract.code}"]`);
    await expect(row).toContainText('120.000');
    await expect(row).toContainText('XE-001');
    await expect(page.locator('[data-report-section="employees"]')).toContainText('Chủ cửa hàng');
    await expect(page.locator('[data-report-aging]')).toBeVisible();

    const link = page.getByRole('link', { name: 'Xuất Excel' });
    const href = await link.getAttribute('href');
    expect(href).toContain('/api/reports/revenue/export?from=');
    const download = await page.request.get(href ?? '');
    expect(download.ok()).toBe(true);
    expect(download.headers()['content-type']).toContain('spreadsheetml');
    expect(download.headers()['content-disposition']).toContain('doanh-thu-');

    await page.getByLabel('Đến ngày').fill('2026-01-01');
    await expect(page.getByRole('alert')).toContainText('Ngày kết thúc phải sau hoặc bằng');
    await expect(page.getByRole('button', { name: 'Xuất Excel' })).toBeDisabled();
  });
});
