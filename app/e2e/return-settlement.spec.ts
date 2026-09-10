import { expect, test } from '@playwright/test';
import { signInAsStaff } from './support/auth';
import { seedContract } from './support/contracts';

test.describe('Feature: Return and settlement — return queue', () => {
  test.use({ timezoneId: 'Asia/Ho_Chi_Minh' });

  test('Scenario: Staff receives both vehicles from the queue, adds a damage charge and settles the receivable', async ({
    page,
  }) => {
    await signInAsStaff(page);
    const contract = await seedContract(page, {
      activate: true,
      depositVnd: 0,
      endAt: '2026-08-03T08:00:00.000Z',
      startAt: '2026-08-01T08:00:00.000Z',
      vehicleIds: ['vehicle-001', 'vehicle-002'],
    });
    await page.goto('/returns');
    await expect(page.getByRole('heading', { name: 'Trả xe' })).toBeVisible();
    const item = page.locator(`[data-queue-item="${contract.code}"]`);
    await expect(item).toContainText('Đã nhận 0/2 xe');
    await expect(item).toContainText('Trễ');

    await item
      .locator('[data-queue-line="XE-001"]')
      .getByRole('button', { name: 'Nhận xe' })
      .click();
    const dialog = page.getByRole('dialog', { name: 'Nhận xe' });
    await dialog.getByLabel('Giờ trả thực tế').fill('2026-08-03T15:00');
    await expect(dialog.locator('[data-late-fee-preview]')).toContainText('Trả đúng giờ');
    await dialog.getByLabel('Số tiền (VNĐ)').fill('100000');
    await dialog.getByLabel('Nội dung').fill('Trầy yếm trước');
    await dialog.getByRole('button', { name: 'Xác nhận nhận xe' }).click();
    await expect(dialog).toBeHidden();
    await expect(item).toContainText('Đã nhận 1/2 xe');
    await expect(item.locator('[data-queue-line="XE-001"]')).toHaveCount(0);

    await item
      .locator('[data-queue-line="XE-002"]')
      .getByRole('button', { name: 'Nhận xe' })
      .click();
    await dialog.getByLabel('Giờ trả thực tế').fill('2026-08-03T15:00');
    await dialog.getByRole('button', { name: 'Xác nhận nhận xe' }).click();
    await expect(dialog).toBeHidden();
    await expect(item).toHaveCount(0);

    await page.goto(`/contracts/${contract.id}`);
    await expect(page.getByText('Đã trả', { exact: true })).toBeVisible();
    await expect(page.locator('[data-line-inspection]')).toHaveCount(2);
    const settlement = page.locator('[data-settlement]');
    await expect(settlement).toContainText('Cần thu thêm');
    await expect(settlement).toContainText('700.000');
    await expect(settlement.locator('[data-settlement-items]')).toContainText('Trầy yếm trước');

    await page.getByRole('button', { name: 'Tất toán hợp đồng' }).click();
    const settleDialog = page.getByRole('dialog', { name: 'Tất toán hợp đồng' });
    await settleDialog.getByLabel('Đã trả giấy tờ giữ lại', { exact: false }).check();
    await settleDialog.getByRole('button', { name: 'Xác nhận tất toán' }).click();
    await expect(settleDialog).toBeHidden();
    await expect(page.getByText('Đã tất toán', { exact: true })).toBeVisible();
    await expect(page.locator('[data-timeline]')).toContainText('Tất toán');
    await expect(page.getByRole('button', { name: 'Ghi phụ phí' })).toHaveCount(0);
  });
});
