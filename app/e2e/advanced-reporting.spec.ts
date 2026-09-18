import { expect, test } from '@playwright/test';
import { signInAs } from './support/auth';
import { returnContract, seedContract } from './support/contracts';
import { seedExpense } from './support/expenses';

/** A three-day rental on XE-003 (3 × 130 000) inside a window no other spec touches. */
const AUGUST_RENTAL = { endAt: '2026-08-13T08:00:00.000Z', startAt: '2026-08-10T08:00:00.000Z' };
const AUGUST_RANGE = { from: '2026-08-05', to: '2026-08-31' };

test.describe('Feature: Advanced reporting — analytics, profit and loss, trend charts', () => {
  test.use({ timezoneId: 'Asia/Ho_Chi_Minh' });

  test('Scenario: The Owner reads the analytics page and exports the workbook', async ({
    page,
  }) => {
    await signInAs(page, 'owner');
    const contract = await seedContract(page, {
      ...AUGUST_RENTAL,
      activate: true,
      depositVnd: 0,
      vehicleIds: ['vehicle-003'],
    });
    // Returned on time so the revenue stays 390 000 and XE-003 is free for the other journeys.
    await returnContract(page, contract.id, AUGUST_RENTAL.endAt);

    await page.goto('/reports/analytics');
    await expect(page.getByRole('heading', { name: 'Phân tích doanh thu' })).toBeVisible();
    await page.getByLabel('Từ ngày').fill(AUGUST_RANGE.from);
    await page.getByLabel('Đến ngày').fill(AUGUST_RANGE.to);
    await expect(page.locator('[data-analytics-totals]')).toContainText('390.000');

    await expect(
      page.locator('[data-dimension-table="type"] [data-dimension-row="Xe tay ga"]'),
    ).toContainText('390.000');
    const vehicle = page.locator('[data-dimension-table="vehicle"] [data-dimension-row="XE-003"]');
    await expect(vehicle).toContainText('390.000');
    await expect(vehicle).toContainText('100%');
    await expect(page.locator('[data-dimension-row="VN"]')).toContainText('390.000');
    await expect(page.locator('[data-month-row="2026-08"]')).toContainText('08/2026');
    await expect(page.locator('[data-surcharge-row="net"]')).toBeVisible();
    const utilisation = page.locator('[data-utilisation-row="XE-003"]');
    await expect(utilisation).toContainText('3/27');
    await expect(utilisation).toContainText('11%');
    await expect(page.locator('[data-utilisation-row="Toàn đội"]')).toBeVisible();

    const chart = page.locator('[data-month-section] [data-trend-chart] svg');
    await expect(chart).toHaveAttribute('role', 'img');
    await expect(chart).toHaveAttribute('aria-label', /Doanh thu theo tháng/);
    await expect(chart.locator('[data-trend-series="revenueVnd"] circle')).toHaveCount(1);

    const link = page.getByRole('link', { name: 'Xuất Excel' });
    const href = await link.getAttribute('href');
    expect(href).toContain('/api/reports/analytics/export?from=2026-08-05&to=2026-08-31');
    const download = await page.request.get(href ?? '');
    expect(download.ok()).toBe(true);
    expect(download.headers()['content-type']).toContain('spreadsheetml');
    expect(download.headers()['content-disposition']).toContain('phan-tich-2026-08-05-2026-08-31');
  });

  test('Scenario: The range form refuses more than 366 days before any request is sent', async ({
    page,
  }) => {
    await signInAs(page, 'owner');
    await page.goto('/reports/analytics');
    let requests = 0;
    page.on('request', (request) => {
      if (request.url().includes('/api/reports/analytics?from=2025-01-01')) requests += 1;
    });
    await page.getByLabel('Từ ngày').fill('2025-01-01');
    await page.getByLabel('Đến ngày').fill('2026-09-18');
    await expect(page.getByRole('alert')).toContainText('Báo cáo tối đa 366 ngày');
    await expect(page.getByRole('button', { name: 'Xuất Excel' })).toBeDisabled();
    expect(requests).toBe(0);
  });

  test('Scenario: The Owner reads the twelve-month profit and loss with the trend chart', async ({
    page,
  }) => {
    await signInAs(page, 'owner');
    await seedExpense(page, {
      amountVnd: 9_000_000,
      description: 'Bảo hiểm cả năm',
      paidOn: '2026-03-15',
    });

    await page.goto('/reports/pnl');
    await expect(page.getByRole('heading', { name: 'Lãi lỗ theo tháng' })).toBeVisible();
    await expect(page.getByLabel('Số tháng')).toContainText('12 tháng');
    await expect(page.locator('[data-pnl-totals]')).toBeVisible();
    await expect(page.locator('[data-pnl-table] [data-pnl-row]')).toHaveCount(13);
    const march = page.locator('[data-pnl-row="2026-03"]');
    await expect(march).toContainText('9.000.000');
    await expect(march).toContainText('−');

    const chart = page.locator('[data-pnl-trend] svg');
    await expect(chart).toHaveAttribute('aria-label', /Xu hướng 12 tháng/);
    for (const key of ['revenueVnd', 'expensesVnd', 'profitVnd']) {
      await expect(chart.locator(`[data-trend-series="${key}"] circle`)).toHaveCount(12);
    }
    await expect(page.locator('[data-pnl-trend] figcaption')).toContainText('Lãi lỗ');

    const href = await page.getByRole('link', { name: 'Xuất Excel' }).getAttribute('href');
    expect(href).toContain('/api/reports/pnl/export?months=12&to=');
    const download = await page.request.get(href ?? '');
    expect(download.ok()).toBe(true);
    expect(download.headers()['content-disposition']).toContain('lai-lo-');

    await page.getByLabel('Số tháng').click();
    await page.getByRole('option', { name: '6 tháng' }).click();
    await expect(chart).toHaveAttribute('aria-label', /Xu hướng 6 tháng/);
    await expect(chart.locator('[data-trend-series="profitVnd"] circle')).toHaveCount(6);
    await expect(page.locator('[data-pnl-table] [data-pnl-row]')).toHaveCount(7);
  });

  test('Scenario: Staff cannot open the analytics or profit and loss pages', async ({ page }) => {
    await signInAs(page, 'staff');
    for (const route of ['/reports/analytics', '/reports/pnl']) {
      await page.goto(route);
      await expect(
        page.getByRole('heading', { name: 'Bạn không có quyền xem trang này' }),
      ).toBeVisible();
    }
    const denied = await page.request.get('/api/reports/pnl');
    expect(denied.status()).toBe(403);
  });
});
