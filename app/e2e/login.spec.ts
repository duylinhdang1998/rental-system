import { expect, test } from '@playwright/test';

test.describe('Feature: Secure responsive operations preview — login', () => {
  test('Scenario: Active Owner signs in successfully', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Tên đăng nhập').fill('owner');
    await page.getByLabel('Mật khẩu').fill('OwnerDemo!2026');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Tổng quan hôm nay' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Báo cáo' })).toBeVisible();
  });

  test('Scenario: Invalid credentials do not reveal whether an account exists', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.getByLabel('Tên đăng nhập').fill('unknown');
    await page.getByLabel('Mật khẩu').fill('incorrect');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();

    await expect(page.getByRole('alert')).toHaveText('Thông tin đăng nhập không hợp lệ');
  });
});
