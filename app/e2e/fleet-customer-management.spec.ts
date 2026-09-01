import { expect, test } from '@playwright/test';

async function signInAsStaff(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Tên đăng nhập').fill('staff');
  await page.getByLabel('Mật khẩu').fill('StaffDemo!2026');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL('/');
}

test.describe('Feature: Fleet, customer and catalog foundations', () => {
  test('Staff filters responsive vehicle cards and opens availability calendar', async ({
    page,
  }) => {
    await signInAsStaff(page);
    await page.goto('/vehicles?status=AVAILABLE&typeCode=SCOOTER');
    await expect(page.getByRole('heading', { name: 'Xe' })).toBeVisible();
    await expect(page.getByRole('cell', { name: /43A1-000\.01/ })).toBeVisible();
    await page.getByRole('button', { name: 'Lịch xe' }).click();
    const calendar = page.getByRole('grid', { name: 'Lịch xe' });
    await expect(calendar).toBeVisible();
    await expect(calendar.getByText('Trống', { exact: true }).first()).toBeVisible();
    await expect(calendar.getByText('Đã có lịch thuê', { exact: true }).first()).toBeVisible();
    await calendar.getByRole('button', { name: /Trống/ }).first().click();
    await expect(page).toHaveURL(/\/contracts\?from=\d{4}-\d{2}-\d{2}&vehicleId=/);
  });

  test('Customer search shows duplicate and blacklist guidance', async ({ page }) => {
    await signInAsStaff(page);
    await page.goto('/customers');
    await page.getByRole('searchbox', { name: 'Tìm khách hàng' }).fill('Risk Fixture');
    await expect(page.getByText('Khách hàng cần cảnh giác')).toBeVisible();
    await expect(page.getByText('Synthetic risk fixture')).toBeVisible();
    await page.getByLabel('Tôi đã đọc cảnh báo này').check();
    await expect(page.getByLabel('Tôi đã đọc cảnh báo này')).toBeChecked();
  });

  test('Customer form suggests an existing normalized contact', async ({ page }) => {
    await signInAsStaff(page);
    await page.goto('/customers');
    await page.getByRole('button', { name: 'Thêm khách hàng' }).click();
    await page.getByLabel('Số điện thoại').fill('0909 123 456');
    await expect(page.getByText('Có thể trùng khách hàng')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mở hồ sơ Risk Fixture' })).toBeVisible();
  });

  test('Locale and customer filter survive a route round trip', async ({ page }) => {
    await signInAsStaff(page);
    await page.goto('/customers?search=Risk');
    await page.getByRole('button', { name: 'English' }).click();
    await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible();
    await page
      .getByRole('navigation', { name: 'Điều hướng chính' })
      .getByRole('link', { name: 'Vehicles' })
      .click();
    await expect(page.getByRole('heading', { name: 'Vehicles' })).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/customers\?search=Risk/);
    await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible();
  });

  test('Fleet and customers remain usable at 360 pixels', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await signInAsStaff(page);
    for (const route of ['/vehicles', '/customers']) {
      await page.goto(route);
      await expect(page.locator('[data-mobile-card]').first()).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow).toBe(false);
    }
  });
});
