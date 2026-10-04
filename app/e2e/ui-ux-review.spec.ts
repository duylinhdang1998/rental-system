import { expect, test } from '@playwright/test';
import { signInAs } from './support/auth';

test('Mobile Owner can reach reports and settings from navigation', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await signInAs(page, 'owner');
  await page.getByRole('button', { name: 'Mở menu điều hướng' }).click();
  const menu = page.getByRole('dialog');
  await expect(menu.getByRole('link', { name: 'Chi phí', exact: true })).toBeVisible();
  await menu.getByRole('link', { name: 'Báo cáo', exact: true }).click();
  await expect(page).toHaveURL('/reports');
  await expect(menu).not.toBeVisible();
  await page.getByRole('button', { name: 'Mở menu điều hướng' }).click();
  await menu.getByRole('link', { name: 'Cài đặt', exact: true }).click();
  await expect(page).toHaveURL('/settings');
});

test('Mobile Staff menu preserves role restrictions and offers sign out', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await signInAs(page, 'staff');
  await page.getByRole('button', { name: 'Mở menu điều hướng' }).click();
  const menu = page.getByRole('dialog');
  await expect(menu.getByRole('link', { name: 'Báo cáo', exact: true })).toHaveCount(0);
  await expect(menu.getByRole('link', { name: 'Chi phí', exact: true })).toBeVisible();
  await menu.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
  await expect(page).toHaveURL('/login');
  await page.goto('/expenses');
  await expect(page).toHaveURL('/login');
});

test('Vehicle and customer detail actions show the selected record', async ({ page }) => {
  await signInAs(page, 'owner');
  await page.goto('/vehicles');
  await page.getByRole('button', { name: 'Xem chi tiết', exact: true }).first().click();
  await expect(page.getByRole('dialog')).toContainText('43A1-000.01');
  await expect(page.getByRole('dialog')).toContainText('Vision');
  await page.getByRole('button', { name: 'Đóng', exact: true }).click();
  await page.goto('/customers');
  await page.getByRole('button', { name: 'Xem khách hàng', exact: true }).first().click();
  await expect(page.getByRole('dialog')).toContainText('Khách hàng mẫu');
  await expect(page.getByRole('dialog')).toContainText('0900 000 001');
});

test('Empty filtered lists offer a relevant way back and one page heading', async ({ page }) => {
  await signInAs(page, 'owner');
  for (const route of ['/vehicles', '/customers', '/contracts']) {
    await page.goto(`${route}?search=does-not-exist-ux-review`);
    await expect(page.getByRole('heading', { name: 'Không tìm thấy kết quả' })).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    await page
      .getByRole('button', { name: 'Xóa bộ lọc', exact: true })
      .or(page.getByRole('link', { name: 'Xóa bộ lọc', exact: true }))
      .click();
    await expect(page.getByRole('heading', { name: 'Không tìm thấy kết quả' })).not.toBeVisible();
    await expect(page).toHaveURL(route);
  }
});

test('Unknown routes retain the app shell and a way back', async ({ page }) => {
  await signInAs(page, 'owner');
  await page.goto('/missing-ux-review');
  await expect(page.getByRole('heading', { name: 'Không tìm thấy trang' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeVisible();
  await page.getByRole('link', { name: 'Về tổng quan' }).click();
  await expect(page).toHaveURL('/');
});

test('The loaded Inter face is used for Vietnamese and mobile inputs remain 16px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/login');
  // The login form renders after the bundle boots; measuring earlier finds no input.
  await expect(page.getByLabel('Mật khẩu', { exact: true })).toBeVisible();
  const font = await page.evaluate(async () => {
    await document.fonts.ready;
    return {
      family: getComputedStyle(document.body).fontFamily,
      loaded: document.fonts.check('16px "Inter Variable"', 'Tiếng Việt ữ ợ ằ'),
      inputSize: getComputedStyle(document.querySelector('input')!).fontSize,
    };
  });
  expect(font.family).toContain('Inter Variable');
  expect(font.loaded).toBe(true);
  expect(font.inputSize).toBe('16px');
});

test('Login password visibility and locale controls work', async ({ page }) => {
  await page.goto('/login');
  const password = page.getByLabel('Mật khẩu', { exact: true });
  await password.fill('sample-password');
  await page.getByRole('button', { name: 'Hiện mật khẩu' }).click();
  await expect(password).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Ẩn mật khẩu' }).click();
  await expect(password).toHaveAttribute('type', 'password');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
});
