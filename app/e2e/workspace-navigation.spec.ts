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

    for (const route of ['/returns', '/reports', '/employees']) {
      await page.goto(route);
      await expect(page.getByText('Dữ liệu minh họa', { exact: false })).toBeVisible();
      await expect(page.getByText(/Có trong Sprint|Bản xem trước/).first()).toBeVisible();
    }
    await page.goto('/contracts');
    await expect(page.getByRole('heading', { name: 'Tạo hợp đồng' })).toBeVisible();
    await page.goto('/vehicles');
    await expect(page.getByRole('heading', { name: 'Xe' })).toBeVisible();
    await page.goto('/customers');
    await expect(page.getByRole('heading', { exact: true, name: 'Khách hàng' })).toBeVisible();
    await page.goto('/settings');
    await expect(page.getByRole('heading', { exact: true, name: 'Cài đặt' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Phí trả xe trễ' })).toBeVisible();
  });

  test('Scenario: Owner configures the late-return policy for new contracts', async ({ page }) => {
    await signIn(page, 'owner');
    await page.goto('/settings');
    await page.getByLabel('Số phút trả trễ miễn phí').fill('90');
    await page.getByLabel('Phí mỗi giờ bắt đầu (VND)').fill('30000');
    await expect(page.getByText(/Miễn phí 90 phút đầu/)).toBeVisible();
    await page.getByRole('button', { name: 'Lưu chính sách trả trễ' }).click();
    await expect(page.getByRole('status')).toContainText('Hợp đồng cũ không thay đổi');
    await expect(page.getByLabel('Số phút trả trễ miễn phí')).toHaveValue('90');
    await expect(page.getByLabel('Phí mỗi giờ bắt đầu (VND)')).toHaveValue('30000');
  });
});
