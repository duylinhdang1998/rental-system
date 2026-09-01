import { expect, test } from '@playwright/test';
import { signInAsStaff } from './support/auth';

test.describe('Feature: Approved frontend architecture and operational interaction patterns', () => {
  test('Fleet actions use Inter and stay usable at 360 pixels', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await signInAsStaff(page);
    await page.goto('/vehicles');

    await expect(page.locator('html')).toHaveCSS('font-family', /Inter/);
    for (const name of ['Lịch xe', 'Thêm xe']) {
      const action = page.getByRole('button', { name, exact: true });
      await expect(action).toBeVisible();
      const metrics = await action.evaluate((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return { height: rect.height, whiteSpace: style.whiteSpace };
      });
      expect(metrics.whiteSpace).toBe('nowrap');
      expect(metrics.height).toBeGreaterThanOrEqual(44);
      expect(metrics.height).toBeLessThanOrEqual(52);
    }

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });

  test('Vehicle creation and availability use dedicated accessible overlays', async ({ page }) => {
    await signInAsStaff(page);
    await page.goto('/vehicles?status=AVAILABLE');

    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.getByRole('button', { name: 'Thêm xe', exact: true }).click();
    const vehicleDialog = page.getByRole('dialog', { name: 'Thêm xe' });
    await expect(vehicleDialog).toBeVisible();
    await expect(vehicleDialog.getByLabel('Mã xe')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(vehicleDialog).toBeHidden();
    await expect(page).toHaveURL(/vehicles\?status=AVAILABLE/);

    await page.getByRole('button', { name: 'Lịch xe', exact: true }).click();
    const calendarDialog = page.getByRole('dialog', { name: 'Lịch xe' });
    await expect(calendarDialog).toBeVisible();
    await expect(calendarDialog.getByRole('grid', { name: 'Lịch xe' })).toBeVisible();
    await calendarDialog.getByRole('button', { name: 'Đóng' }).click();
    await expect(calendarDialog).toBeHidden();
    await expect(page).toHaveURL(/vehicles\?status=AVAILABLE/);
  });

  test('Customer creation uses a dialog and lists show creation time', async ({ page }) => {
    await signInAsStaff(page);
    await page.goto('/customers');

    await expect(page.getByRole('columnheader', { name: 'Ngày tạo' })).toBeVisible();
    await page.getByRole('button', { name: 'Thêm khách hàng', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Thêm khách hàng' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel('Tên khách hàng')).toBeFocused();
    await page.keyboard.press('Escape');

    await page.goto('/vehicles');
    await expect(page.getByRole('columnheader', { name: 'Ngày tạo' })).toBeVisible();
  });
});
