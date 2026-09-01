import { expect, test } from '@playwright/test';

async function signInAsStaff(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Tên đăng nhập').fill('staff');
  await page.getByLabel('Mật khẩu').fill('StaffDemo!2026');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
}

test.describe('Feature: Secure responsive operations preview — responsive workspace', () => {
  test.use({ viewport: { width: 360, height: 800 } });

  test('Scenario: Staff navigates at a 360 pixel viewport', async ({ page }) => {
    await signInAsStaff(page);

    for (const route of ['/', '/vehicles', '/customers', '/contracts', '/returns']) {
      await page.goto(route);
      await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
      await expect(page.locator('[data-mobile-card]').first()).toBeVisible();
    }

    const navTarget = page
      .getByRole('navigation', { name: 'Điều hướng di động' })
      .getByRole('link')
      .first();
    const box = await navTarget.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('Scenario: Dashboard prioritizes today’s operational work', async ({ page }) => {
    await signInAsStaff(page);
    await expect(page.getByText('Dữ liệu minh họa', { exact: false })).toBeVisible();
    await expect(page.getByText('Xe sẵn sàng')).toBeVisible();
    await expect(page.getByText('Đang cho thuê')).toBeVisible();
    await expect(page.getByText('Trả hôm nay')).toBeVisible();
    await expect(page.getByText('Quá hạn')).toBeVisible();
    expect(await page.locator('article svg').count()).toBeGreaterThanOrEqual(4);
    await expect(page.getByText('18 khả dụng · 12 đang chạy · 4 ở trạng thái khác')).toBeVisible();

    const priorities = await page.locator('[data-priority-item]').allTextContents();
    expect(priorities[0]).toContain('Quá hạn');
  });

  test('Scenario: Locale persists while route and filters are preserved', async ({ page }) => {
    await signInAsStaff(page);
    await page.getByRole('button', { name: 'English' }).click();
    await expect(page.getByRole('heading', { name: 'Today’s overview' })).toBeVisible();
    await expect(page.getByText('08/31/2026')).toBeVisible();
    await expect(page.getByText('Demo data', { exact: false })).toBeVisible();
    await page.goto('/vehicles?status=AVAILABLE');
    await expect(page.getByRole('heading', { name: 'Vehicles' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '43A1-000.01' })).toBeVisible();
    await page.reload();
    await expect(page).toHaveURL(/status=AVAILABLE/);
    await expect(page.getByRole('heading', { name: 'Vehicles' })).toBeVisible();
  });

  test('Scenario: Dashboard explains its loading state', async ({ page }) => {
    await page.route('**/api/demo/dashboard', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1_000));
      await route.continue();
    });
    await signInAsStaff(page);
    await expect(page.getByRole('heading', { name: 'Đang tải tổng quan' })).toBeVisible();
  });

  test('Scenario: Dashboard explains its empty state', async ({ page }) => {
    await page.route('**/api/demo/dashboard', (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          activeRentals: 0,
          availableVehicles: 0,
          dueToday: 0,
          overdue: 0,
          revenueMonth: 0,
        }),
      }),
    );
    await signInAsStaff(page);
    await expect(page.getByRole('heading', { name: 'Không có việc gấp hôm nay' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Xem danh sách xe' })).toBeVisible();
  });

  test('Scenario: Dashboard explains its error state', async ({ page }) => {
    await page.route('**/api/demo/dashboard', (route) => route.fulfill({ status: 503 }));
    await signInAsStaff(page);
    await expect(page.getByRole('heading', { name: 'Không thể tải tổng quan' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thử lại' })).toBeVisible();
  });
});
