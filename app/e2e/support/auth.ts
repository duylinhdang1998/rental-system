import { expect, type Page } from '@playwright/test';

export type DemoRole = 'owner' | 'staff';

const PASSWORDS: Record<DemoRole, string> = {
  owner: 'OwnerDemo!2026',
  staff: 'StaffDemo!2026',
};

/** Signs in through the UI and waits for the session cookies before the test navigates on. */
export async function signInAs(page: Page, role: DemoRole) {
  await page.goto('/login');
  await page.getByLabel('Tên đăng nhập').fill(role);
  await page.getByLabel('Mật khẩu').fill(PASSWORDS[role]);
  const login = page.waitForResponse((response) => response.url().includes('/api/auth/login'));
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  const response = await login;
  await response.finished();
  expect(response.ok()).toBe(true);
  await expect(page).toHaveURL('/');
}

export async function signInAsStaff(page: Page) {
  await signInAs(page, 'staff');
}
