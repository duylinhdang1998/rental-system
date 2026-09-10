import { expect, test, type Page } from '@playwright/test';
import { signInAsStaff } from './support/auth';

interface RentalPeriod {
  endAt: string;
  startAt: string;
}

/** Own window for the conflict test so the parallel creation test's XE-001 booking never collides. */
const CONFLICT_PERIOD: RentalPeriod = { endAt: '2026-11-11T08:00', startAt: '2026-11-10T08:00' };

async function reachConfirmation(page: Page, period?: RentalPeriod) {
  await page.goto('/contracts/new');
  await page.getByRole('radio', { name: 'Khách hàng mẫu' }).check();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  if (period) {
    await page.getByLabel('Giờ nhận xe').fill(period.startAt);
    await page.getByLabel('Giờ trả xe').fill(period.endAt);
  }
  await page.getByRole('checkbox', { name: /XE-001/ }).check();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await expect(page.getByText(/1 ngày × 150.000/)).toBeVisible();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await page.getByLabel('Tiền cọc (VNĐ)').fill('1000000');
  await page.getByLabel('Giấy tờ giữ lại').fill('CCCD 1234');
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
}

test.describe('Feature: Responsive contract creation', () => {
  test('Staff creates a contract and receives a bilingual PDF action', async ({ page }) => {
    await signInAsStaff(page);
    await reachConfirmation(page);
    await page.getByLabel(/Tôi xác nhận giá/).check();
    await page.getByRole('button', { name: 'Tạo hợp đồng' }).click();
    await expect(page.getByText(/Đã tạo hợp đồng HD-/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tải PDF Việt–Anh' })).toHaveAttribute(
      'href',
      /\/api\/contracts\/.+\/pdf/,
    );
  });

  test('A conflict returns to vehicles while preserving the contract draft', async ({ page }) => {
    await signInAsStaff(page);
    await reachConfirmation(page, CONFLICT_PERIOD);
    await page.getByLabel(/Tôi xác nhận giá/).check();
    await page.route('**/api/contracts', async (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Xe XE-001 vừa có lịch thuê trùng thời gian' }),
        status: 409,
      }),
    );
    await page.getByRole('button', { name: 'Tạo hợp đồng' }).click();
    await expect(page.getByRole('alert')).toContainText('trùng thời gian');
    await expect(page.getByRole('checkbox', { name: /XE-001/ })).toBeChecked();
    const saved = await page.evaluate(() => sessionStorage.getItem('rental-contract-draft-v1'));
    expect(saved).toContain('demo-customer');
    expect(saved).toContain('1000000');
  });

  test('The five-step workflow has no page overflow at 360 pixels', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await signInAsStaff(page);
    await page.goto('/contracts/new');
    await expect(page.getByText('Bước 1/5')).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});
