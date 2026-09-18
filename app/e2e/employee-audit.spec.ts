import { expect, test } from '@playwright/test';
import { signInAs } from './support/auth';

test.describe('Feature: Employee account management — Owner workspace', () => {
  test('Scenario: Owner manages employees and reviews the audit log', async ({ page }) => {
    const username = `nv.e2e${Date.now().toString().slice(-6)}`;
    await signInAs(page, 'owner');
    await page.goto('/employees');
    await expect(page.getByRole('heading', { exact: true, name: 'Nhân viên' })).toBeVisible();
    await expect(page.locator('[data-employee="owner"]').first()).toContainText('Bạn');

    await page.getByRole('button', { name: 'Thêm nhân viên' }).click();
    await page.getByLabel('Họ và tên', { exact: true }).fill('Nhân viên E2E');
    await page.getByLabel('Tên đăng nhập', { exact: true }).fill(username);
    await page.getByLabel('Mật khẩu', { exact: true }).fill('MatKhau!2026x');
    await page.getByRole('button', { name: 'Tạo tài khoản' }).click();

    const row = page.locator(`[data-employee="${username}"]`).first();
    await expect(row).toContainText('Đang làm');
    await page
      .getByRole('button', { name: `Khóa ${username}` })
      .first()
      .click();
    await expect(row).toContainText('Đã khóa');
    await expect(page.getByRole('button', { name: `Mở khóa ${username}` }).first()).toBeVisible();

    await page.goto('/audit');
    await expect(page.getByRole('heading', { exact: true, name: 'Nhật ký' })).toBeVisible();
    const locked = page.locator('[data-audit-action="EMPLOYEE_LOCKED"]').first();
    await expect(locked).toContainText('Chủ cửa hàng');
    await expect(locked.locator('[data-audit-meta="username"]')).toHaveText(username);

    await page.getByLabel('Loại bản ghi').click();
    await page.getByRole('option', { name: 'Tài khoản' }).click();
    await expect(page.locator('[data-audit-action]').first()).toBeVisible();
    for (const entry of await page.locator('[data-audit-action]').all()) {
      await expect(entry).toContainText('Tài khoản');
    }
  });
});
