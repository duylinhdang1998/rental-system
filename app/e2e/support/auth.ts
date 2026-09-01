import { expect, type Page } from '@playwright/test';

export async function signInAsStaff(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Tên đăng nhập').fill('staff');
  await page.getByLabel('Mật khẩu').fill('StaffDemo!2026');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL('/');
}
