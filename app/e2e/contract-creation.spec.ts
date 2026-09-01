import { expect, test, type Page } from '@playwright/test';

async function signIn(page: Page, role: 'owner' | 'staff' = 'staff') {
  await page.goto('/login');
  await page.getByLabel('Tên đăng nhập').fill(role);
  await page.getByLabel('Mật khẩu').fill(role === 'owner' ? 'OwnerDemo!2026' : 'StaffDemo!2026');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL('/');
}

async function reachConfirmation(page: Page) {
  await page.goto('/contracts');
  await page.getByRole('radio', { name: 'Khách hàng mẫu' }).check();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await page.getByRole('checkbox', { name: /XE-001/ }).check();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await expect(page.getByText(/1 ngày × 150.000/)).toBeVisible();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await page.getByLabel('Tiền cọc (VNĐ)').fill('1000000');
  await page.getByLabel('Giấy tờ giữ lại').fill('CCCD 1234');
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
}

test.describe('Feature: Responsive contract creation', () => {
  test('Staff creates a contract and receives a bilingual PDF action', async ({ page }) => {
    await signIn(page);
    await reachConfirmation(page);
    await page.getByLabel(/Tôi xác nhận giá/).check();
    await page.getByRole('button', { name: 'Tạo hợp đồng' }).click();
    await expect(page.getByText(/Đã tạo hợp đồng HD-/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tải PDF Việt–Anh' })).toHaveAttribute(
      'href',
      /\/api\/contracts\/.+\/pdf/,
    );
  });

  test('A conflict returns to vehicles while preserving the contract draft', async ({ page }) => {
    await signIn(page);
    await reachConfirmation(page);
    await page.getByLabel(/Tôi xác nhận giá/).check();
    await page.route('**/api/contracts', async (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Xe XE-001 vừa có lịch thuê trùng thời gian' }),
        status: 409,
      }),
    );
    await page.getByRole('button', { name: 'Tạo hợp đồng' }).click();
    await expect(page.getByRole('alert')).toContainText('trùng thời gian');
    await expect(page.getByRole('checkbox', { name: /XE-001/ })).toBeChecked();
    const saved = await page.evaluate(() => sessionStorage.getItem('rental-contract-draft-v1'));
    expect(saved).toContain('demo-customer');
    expect(saved).toContain('1000000');
  });

  test('The five-step workflow has no page overflow at 360 pixels', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await signIn(page);
    await page.goto('/contracts');
    await expect(page.getByText('Bước 1/5')).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});
