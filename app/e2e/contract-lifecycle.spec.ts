import { expect, test } from '@playwright/test';
import { signInAsStaff } from './support/auth';
import { seedContract } from './support/contracts';

test.describe('Feature: Contract lifecycle and daily operations', () => {
  test.use({ timezoneId: 'Asia/Ho_Chi_Minh' });

  test('Scenario: Staff lists contracts and filters by status', async ({ page }) => {
    await signInAsStaff(page);
    await page.goto('/contracts');
    await expect(page.getByRole('heading', { exact: true, name: 'Hợp đồng' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'HD-2026-DEMO0001' }).first()).toBeVisible();

    await page.goto('/contracts?status=CONFIRMED');
    await expect(page.getByRole('link', { name: 'HD-2026-DEMO0002' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'HD-2026-DEMO0001' })).toHaveCount(0);

    await page.getByLabel('Tìm kiếm').fill('DEMO0001');
    await expect(page).toHaveURL(/search=DEMO0001/);
  });

  test('Scenario: Staff hands over, receives the vehicle late and settles the refund', async ({
    page,
  }) => {
    await signInAsStaff(page);
    const contract = await seedContract(page, {
      endAt: '2026-07-03T08:00:00.000Z',
      startAt: '2026-07-01T08:00:00.000Z',
      vehicleIds: ['vehicle-002'],
    });
    await page.goto(`/contracts/${contract.id}`);
    await expect(page.getByRole('heading', { name: contract.code })).toBeVisible();
    await expect(page.getByText('Đặt trước', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Bàn giao xe' }).click();
    const dialog = page.getByRole('dialog', { name: 'Bàn giao xe' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Xác nhận bàn giao' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText('Đang thuê', { exact: true })).toBeVisible();
    await expect(page.locator('[data-timeline]')).toContainText('Bàn giao xe');
    await expect(page.getByRole('button', { name: 'Hủy hợp đồng' })).toHaveCount(0);

    await page.getByRole('button', { name: 'Nhận xe' }).click();
    const returnDialog = page.getByRole('dialog', { name: 'Nhận xe' });
    await returnDialog.getByLabel('Giờ trả thực tế').fill('2026-07-03T17:30');
    await expect(returnDialog.locator('[data-late-fee-preview]')).toContainText('40.000');
    await returnDialog.getByRole('button', { name: 'Xác nhận nhận xe' }).click();
    await expect(returnDialog).toBeHidden();
    await expect(page.getByText('Đã trả', { exact: true })).toBeVisible();
    const settlement = page.locator('[data-settlement]');
    await expect(settlement).toContainText('Cần hoàn cọc');
    await expect(settlement).toContainText('160.000');

    await page.getByRole('button', { name: 'Tất toán hợp đồng' }).click();
    const settleDialog = page.getByRole('dialog', { name: 'Tất toán hợp đồng' });
    await settleDialog.getByLabel('Đã trả giấy tờ giữ lại', { exact: false }).check();
    await settleDialog.getByLabel('Đã hoàn cọc cho khách').check();
    await settleDialog.getByRole('button', { name: 'Xác nhận tất toán' }).click();
    await expect(settleDialog).toBeHidden();
    await expect(page.getByText('Đã tất toán', { exact: true })).toBeVisible();
    await expect(page.getByText('Hợp đồng đã đóng', { exact: false })).toBeVisible();
  });

  test('Scenario: Cancelling requires a reason and keeps the record', async ({ page }) => {
    await signInAsStaff(page);
    const contract = await seedContract(page, {
      endAt: '2027-04-03T08:00:00.000Z',
      startAt: '2027-04-01T08:00:00.000Z',
      vehicleIds: ['vehicle-002'],
    });
    await page.goto(`/contracts/${contract.id}`);
    await page.getByRole('button', { name: 'Hủy hợp đồng' }).click();
    const dialog = page.getByRole('dialog', { name: 'Hủy hợp đồng' });
    await expect(dialog.getByLabel('Lý do hủy')).toBeFocused();
    await dialog.getByLabel('Lý do hủy').fill('Khách đổi lịch bay');
    await dialog.getByRole('button', { name: 'Xác nhận hủy' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText('Đã hủy', { exact: true })).toBeVisible();
    await expect(page.locator('[data-timeline]')).toContainText('Khách đổi lịch bay');

    await page.goto('/contracts?status=CANCELLED');
    await expect(page.getByRole('link', { name: contract.code }).first()).toBeVisible();
  });

  test('Scenario: Extension reports a conflict, then reprices the whole period', async ({
    page,
  }) => {
    await signInAsStaff(page);
    const contract = await seedContract(page, {
      activate: true,
      endAt: '2027-05-03T08:00:00.000Z',
      startAt: '2027-05-01T08:00:00.000Z',
      vehicleIds: ['vehicle-002'],
    });
    await seedContract(page, {
      endAt: '2027-05-07T08:00:00.000Z',
      startAt: '2027-05-05T08:00:00.000Z',
      vehicleIds: ['vehicle-002'],
    });
    await page.goto(`/contracts/${contract.id}`);
    await expect(page.getByText('300.000 ₫').first()).toBeVisible();
    await page.getByRole('button', { name: 'Gia hạn' }).click();
    const dialog = page.getByRole('dialog', { name: 'Gia hạn' });
    await dialog.getByLabel('Giờ trả mới').fill('2027-05-06T15:00');
    await dialog.getByRole('button', { name: 'Xác nhận gia hạn' }).click();
    await expect(dialog.getByRole('alert')).toContainText('trùng thời gian');

    await dialog.getByLabel('Giờ trả mới').fill('2027-05-04T15:00');
    await dialog.getByRole('button', { name: 'Xác nhận gia hạn' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText('390.000 ₫').first()).toBeVisible();
    await expect(page.locator('[data-timeline]')).toContainText('Gia hạn');
  });

  test('Scenario: Swapping a vehicle keeps the total and links both lines', async ({ page }) => {
    await signInAsStaff(page);
    const contract = await seedContract(page, {
      activate: true,
      endAt: '2027-06-03T08:00:00.000Z',
      startAt: '2027-06-01T08:00:00.000Z',
      vehicleIds: ['vehicle-002'],
    });
    await page.goto(`/contracts/${contract.id}`);
    await page.getByRole('button', { name: 'Đổi xe' }).click();
    const dialog = page.getByRole('dialog', { name: 'Đổi xe' });
    await dialog.getByLabel('Xe thay thế').click();
    await page.getByRole('option', { name: /XE-003/ }).click();
    await dialog.getByLabel('Lý do đổi xe').fill('Xe hỏng đèn');
    await dialog.getByRole('button', { name: 'Xác nhận đổi xe' }).click();
    await expect(dialog).toBeHidden();

    await expect(page.locator('[data-line-status="replaced"]')).toContainText('XE-002');
    await expect(page.locator('[data-line-status="active"]')).toContainText('XE-003');
    await expect(page.getByText('Thay cho XE-002', { exact: true })).toBeVisible();
    await expect(page.getByText('300.000 ₫').first()).toBeVisible();
    await expect(page.locator('[data-timeline]')).toContainText('XE-002 → XE-003');
  });

  test('Scenario: The dashboard links today’s work to contract details', async ({ page }) => {
    await signInAsStaff(page);
    await expect(page.getByRole('heading', { name: 'Tổng quan hôm nay' })).toBeVisible();
    await expect(
      page.getByText(/\d+ khả dụng · \d+ đang chạy · \d+ ở trạng thái khác/),
    ).toBeVisible();
    const link = page.getByRole('link', { name: /HD-2026-DEMO000/ }).first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/contracts\/.+/);
    await expect(page.getByRole('heading', { name: /HD-2026-DEMO000/ })).toBeVisible();
  });
});
