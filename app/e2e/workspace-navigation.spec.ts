import { expect, test } from '@playwright/test';

async function signIn(page: import('@playwright/test').Page, role: 'owner' | 'staff') {
  await page.goto('/login');
  await page.getByLabel('Tên đăng nhập').fill(role);
  await page.getByLabel('Mật khẩu').fill(role === 'owner' ? 'OwnerDemo!2026' : 'StaffDemo!2026');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL('/');
}

test.describe('Feature: Secure responsive operations preview — role navigation', () => {
  test('Scenario: Staff cannot access Owner-only routes', async ({ page }) => {
    await signIn(page, 'staff');
    await expect(page.getByRole('link', { name: 'Báo cáo' })).toHaveCount(0);

    for (const route of ['/reports', '/employees', '/settings']) {
      await page.goto(route);
      await expect(
        page.getByRole('heading', { name: 'Bạn không có quyền xem trang này' }),
      ).toBeVisible();
    }
  });

  test('Scenario: Owner can preview all Sprint 1 modules', async ({ page }) => {
    await signIn(page, 'owner');

    for (const route of ['/contracts', '/returns', '/reports', '/employees', '/settings']) {
      await page.goto(route);
      await expect(page.getByText('Dữ liệu minh họa', { exact: false })).toBeVisible();
      await expect(page.getByText(/Có trong Sprint|Bản xem trước/).first()).toBeVisible();
    }
    await page.goto('/vehicles');
    await expect(page.getByRole('heading', { name: 'Xe' })).toBeVisible();
    await page.goto('/customers');
    await expect(page.getByRole('heading', { name: 'Khách hàng' })).toBeVisible();
  });
});
