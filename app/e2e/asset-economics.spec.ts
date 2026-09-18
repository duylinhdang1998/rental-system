import { expect, test } from '@playwright/test';
import { signInAs } from './support/auth';

test.describe('Feature: Vehicle cost, expense ledger and fleet economics', () => {
  test.use({ timezoneId: 'Asia/Ho_Chi_Minh' });

  test('Scenario: Owner sets a cost basis, records and reverses an expense, reads the fleet report', async ({
    page,
  }) => {
    const stamp = Date.now().toString().slice(-6);
    await signInAs(page, 'owner');

    await page.goto('/vehicles');
    await page.getByRole('button', { name: 'Giá vốn xe XE-001' }).first().click();
    const cost = page.getByRole('dialog', { name: 'Giá vốn xe XE-001' });
    await cost.getByLabel('Giá mua (VNĐ)').fill('30000000');
    await cost.getByLabel('Ngày mua').fill('2026-01-15');
    await cost.getByLabel('Giá trị thanh lý (VNĐ)').fill('30000001');
    await expect(cost.getByRole('alert')).toContainText('Giá trị thanh lý không được vượt giá mua');
    await cost.getByLabel('Giá trị thanh lý (VNĐ)').fill('3000000');
    await expect(cost.locator('[data-acquisition-preview]')).toContainText('750.000');
    await cost.getByRole('button', { name: 'Lưu giá vốn' }).click();
    await expect(cost).toBeHidden();

    await page.goto('/expenses');
    await expect(page.getByRole('heading', { exact: true, name: 'Chi phí' })).toBeVisible();
    await page.getByRole('button', { name: 'Ghi chi phí' }).click();
    const record = page.getByRole('dialog', { name: 'Ghi chi phí' });
    await record.getByLabel('Số tiền (VNĐ)').fill('250000');
    await record.getByLabel('Xe (tùy chọn)').click();
    await page.getByRole('option', { name: /XE-001/ }).click();
    await record.getByLabel('Nội dung').fill(`Thay nhớt ${stamp}`);
    await record.getByRole('button', { name: 'Lưu khoản chi' }).click();
    await expect(record).toBeHidden();
    const row = page.locator('[data-expense]', { hasText: `Thay nhớt ${stamp}` }).first();
    await expect(row).toContainText('250.000');
    await expect(row).toContainText('XE-001');

    await row.getByRole('button', { name: 'Đảo' }).click();
    const reverse = page.getByRole('dialog', { name: 'Đảo khoản chi' });
    await expect(reverse).toContainText('250.000');
    await reverse.getByLabel('Lý do đảo').fill('Nhập nhầm xe');
    await reverse.getByRole('button', { name: 'Xác nhận đảo' }).click();
    await expect(reverse).toBeHidden();
    await expect(row).toContainText('Đã đảo');
    const mirror = page.locator('[data-expense]', { hasText: 'Đảo: Nhập nhầm xe' }).first();
    await expect(mirror).toContainText('Bút toán đảo');
    await expect(mirror).toContainText('−250.000');
    await expect(row.getByRole('button', { name: 'Đảo' })).toHaveCount(0);

    await page.goto('/reports/fleet');
    await expect(page.getByRole('heading', { name: 'Hiệu quả đội xe' })).toBeVisible();
    await expect(page.locator('[data-economics-totals]')).toBeVisible();
    const vehicle = page.locator('[data-economics-row="XE-001"]');
    await expect(vehicle).toContainText('30.000.000');
    await expect(vehicle).toContainText('750.000');
    await expect(page.locator('[data-economics-row="unallocated"]')).toBeVisible();
    await expect(page.locator('[data-economics-row="total"]')).toContainText('xe đã hòa vốn');

    const link = page.getByRole('link', { name: 'Xuất Excel' });
    const href = await link.getAttribute('href');
    expect(href).toContain('/api/reports/fleet-economics/export?asOf=');
    const download = await page.request.get(href ?? '');
    expect(download.ok()).toBe(true);
    expect(download.headers()['content-type']).toContain('spreadsheetml');
    expect(download.headers()['content-disposition']).toContain('hieu-qua-doi-xe-');

    await page.getByRole('link', { name: 'Doanh thu' }).click();
    await expect(page.getByRole('heading', { name: 'Báo cáo doanh thu' })).toBeVisible();
  });

  test('Scenario: Staff records an expense but never sees cost basis, reversal or the fleet report', async ({
    page,
  }) => {
    const stamp = Date.now().toString().slice(-6);
    await signInAs(page, 'staff');

    await page.goto('/vehicles');
    await expect(page.getByRole('heading', { name: 'Xe' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Giá vốn/ })).toHaveCount(0);

    await page.goto('/expenses');
    await page.getByRole('button', { name: 'Ghi chi phí' }).click();
    const record = page.getByRole('dialog', { name: 'Ghi chi phí' });
    await record.getByLabel('Số tiền (VNĐ)').fill('120000');
    await record.getByLabel('Nội dung').fill(`Đổ xăng ${stamp}`);
    await record.getByRole('button', { name: 'Lưu khoản chi' }).click();
    await expect(record).toBeHidden();
    const row = page.locator('[data-expense]', { hasText: `Đổ xăng ${stamp}` }).first();
    await expect(row).toContainText('120.000');
    await expect(row).toContainText('Không gắn xe');
    await expect(page.getByRole('button', { name: 'Đảo' })).toHaveCount(0);

    await page.goto('/reports/fleet');
    await expect(
      page.getByRole('heading', { name: 'Bạn không có quyền xem trang này' }),
    ).toBeVisible();
    const denied = await page.request.get('/api/reports/fleet-economics');
    expect(denied.status()).toBe(403);
  });
});
