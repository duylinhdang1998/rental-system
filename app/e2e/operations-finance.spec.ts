import { expect, type Locator, type Page, test } from '@playwright/test';
import { signInAs, signInAsStaff } from './support/auth';
import { recordPayment, seedContract } from './support/contracts';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);
const RETURN_PERIOD = { endAt: '2026-06-12T08:00:00.000Z', startAt: '2026-06-10T08:00:00.000Z' };
/** Two rental days at 150 000 with no deposit, so a 200 000 cash collection stays under the cap. */
const SHIFT_PERIOD = { endAt: '2026-06-22T08:00:00.000Z', startAt: '2026-06-20T08:00:00.000Z' };
const CASH_PAYMENT_VND = 200_000;
const SHORTFALL_VND = 20_000;
const OPENING_FLOAT_VND = 1_000_000;

function uniqueCode() {
  return `E2E${Date.now().toString().slice(-6)}`;
}

/** The current-shift card prints the expected cash as "1.200.000 ₫"; keep only the digits. */
async function expectedCash(page: Page): Promise<number> {
  const text = await page.locator('[data-cash-shift-expected]').innerText();
  return Number(text.replace(/\D/g, ''));
}

async function closeShift(page: Page, countedVnd: number, note: string) {
  await page.getByRole('button', { name: 'Đóng ca' }).click();
  const dialog = page.getByRole('dialog', { name: 'Đóng ca' });
  await dialog.getByLabel('Tiền đếm được (VNĐ)').fill(String(countedVnd));
  if (note !== '') await dialog.getByLabel('Ghi chú').fill(note);
  await dialog.getByRole('button', { name: 'Xác nhận đóng ca' }).click();
  await expect(dialog).toBeHidden();
}

/** A previous run may have left a shift open on the shared dev server; close it at par first. */
async function ensureNoOpenShift(page: Page) {
  const closeButton = page.getByRole('button', { name: 'Đóng ca' });
  await expect(page.locator('[data-cash-shift-current], [data-cash-shift-empty]')).toBeVisible();
  if (await closeButton.isVisible()) {
    await closeShift(page, await expectedCash(page), '');
  }
  await expect(page.locator('[data-cash-shift-empty]')).toBeVisible();
}

async function createDamageItem(page: Page, code: string, name: string, priceVnd: number) {
  await page.getByRole('button', { name: 'Thêm hạng mục' }).click();
  const dialog = page.getByRole('dialog', { name: 'Thêm hạng mục hư hỏng' });
  await dialog.getByLabel('Mã (viết hoa, không dấu)').fill(code);
  await dialog.getByLabel('Tên hạng mục').fill(name);
  await dialog.getByLabel('Giá (VNĐ)').fill(String(priceVnd));
  await dialog.getByRole('button', { name: 'Lưu hạng mục' }).click();
  await expect(dialog).toBeHidden();
}

async function returnWithCatalogItem(page: Page, item: Locator, itemName: string) {
  await item.locator('[data-queue-line="XE-001"]').getByRole('button', { name: 'Nhận xe' }).click();
  const dialog = page.getByRole('dialog', { name: 'Nhận xe' });
  await dialog.getByLabel('Giờ trả thực tế').fill('2026-06-12T15:00');
  await dialog.getByLabel('Hạng mục hư hỏng').click();
  await page.getByRole('option', { name: new RegExp(itemName) }).click();
  await expect(dialog.getByLabel('Số tiền (VNĐ)')).toHaveValue('180000');
  await expect(dialog.getByLabel('Nội dung')).toHaveValue(itemName);
  await dialog
    .getByLabel('Ảnh nhận xe (tối đa 5)')
    .setInputFiles({ buffer: PNG_1X1, mimeType: 'image/png', name: 'front.png' });
  await expect(dialog).toContainText('1 tệp đã chọn');
  await dialog.getByRole('button', { name: 'Xác nhận nhận xe' }).click();
  await expect(dialog).toBeHidden();
  await expect(item).toHaveCount(0);
}

test.describe('Feature: Operations finance — damage catalog, return photos, deposit refund', () => {
  test.use({ timezoneId: 'Asia/Ho_Chi_Minh' });

  test('Scenario: Owner prices a damage item, Staff charges it with a photo and the deposit is refunded after settlement', async ({
    page,
  }) => {
    await signInAs(page, 'owner');
    const code = uniqueCode();
    const itemName = `Gương ${code}`;
    await page.goto('/settings/damage-items');
    await expect(page.getByRole('heading', { name: 'Hạng mục hư hỏng' })).toBeVisible();
    await createDamageItem(page, code, itemName, 150_000);
    const row = page.locator(`[data-damage-item-row="${code}"]:visible`);
    await expect(row).toContainText(itemName);
    await expect(row).toContainText('150.000');
    await expect(row).toContainText('Đang dùng');

    await row.getByRole('button', { name: `Sửa ${code}` }).click();
    const editDialog = page.getByRole('dialog', { name: 'Sửa hạng mục' });
    await editDialog.getByLabel('Giá (VNĐ)').fill('180000');
    await editDialog.getByRole('button', { name: 'Lưu hạng mục' }).click();
    await expect(editDialog).toBeHidden();
    await expect(row).toContainText('180.000');

    const contract = await seedContract(page, {
      ...RETURN_PERIOD,
      activate: true,
      vehicleIds: ['vehicle-001'],
    });
    await page.goto('/returns');
    await returnWithCatalogItem(
      page,
      page.locator(`[data-queue-item="${contract.code}"]`),
      itemName,
    );

    await page.goto(`/contracts/${contract.id}`);
    await expect(page.locator('[data-line-inspection]')).toContainText('Ảnh nhận xe: 1');
    await expect(page.locator('[data-return-photos="1"] img')).toHaveCount(1);
    const settlement = page.locator('[data-settlement]');
    await expect(settlement.locator('[data-settlement-items]')).toContainText(itemName);
    await expect(settlement).toContainText('Hoàn lại');
    await expect(settlement).toContainText('20.000');

    await page.getByRole('button', { name: 'Tất toán hợp đồng' }).click();
    const settleDialog = page.getByRole('dialog', { name: 'Tất toán hợp đồng' });
    await expect(settleDialog.getByLabel('Đã hoàn cọc')).toHaveCount(0);
    await settleDialog.getByLabel('Đã trả giấy tờ giữ lại', { exact: false }).check();
    await settleDialog.getByRole('button', { name: 'Xác nhận tất toán' }).click();
    await expect(settleDialog).toBeHidden();
    await expect(page.locator('[data-deposit-refund-state="pending"]')).toBeVisible();

    await page.getByRole('button', { name: 'Hoàn cọc' }).click();
    const refundDialog = page.getByRole('dialog', { name: 'Hoàn cọc' });
    await expect(refundDialog.locator('[data-deposit-refund-amount]')).toContainText('20.000');
    await refundDialog.getByLabel('Hình thức').click();
    await page.getByRole('option', { name: 'Chuyển khoản' }).click();
    await refundDialog.getByLabel('Mã tham chiếu', { exact: false }).fill('CK-E2E-HOANCOC');
    await refundDialog.getByRole('button', { name: 'Xác nhận hoàn cọc' }).click();
    await expect(refundDialog).toBeHidden();
    await expect(page.locator('[data-deposit-refund-state="done"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Hoàn cọc' })).toHaveCount(0);
    await expect(page.locator('[data-timeline]')).toContainText('Hoàn cọc');
  });
});

test.describe('Feature: Operations finance — cash shift close', () => {
  test.use({ timezoneId: 'Asia/Ho_Chi_Minh' });

  test('Scenario: Staff opens a shift, collects cash and closes it with an explained shortfall', async ({
    page,
  }) => {
    await signInAsStaff(page);
    await page.goto('/cash-shifts');
    await expect(page.getByRole('heading', { name: 'Ca tiền mặt' })).toBeVisible();
    await ensureNoOpenShift(page);

    await page.getByRole('button', { name: 'Mở ca' }).first().click();
    const openDialog = page.getByRole('dialog', { name: 'Mở ca' });
    await openDialog.getByLabel('Tiền đầu ca (VNĐ)').fill(String(OPENING_FLOAT_VND));
    await openDialog.getByRole('button', { name: 'Mở ca' }).click();
    await expect(openDialog).toBeHidden();
    await expect(page.locator('[data-cash-shift-current]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mở ca' })).toHaveCount(0);
    const before = await expectedCash(page);
    expect(before).toBeGreaterThanOrEqual(OPENING_FLOAT_VND);

    const contract = await seedContract(page, {
      ...SHIFT_PERIOD,
      activate: true,
      depositVnd: 0,
      vehicleIds: ['vehicle-003'],
    });
    await recordPayment(page, contract.id, { amountVnd: CASH_PAYMENT_VND, method: 'CASH' });
    await page.reload();
    await expect.poll(() => expectedCash(page)).toBeGreaterThanOrEqual(before + CASH_PAYMENT_VND);
    const expected = await expectedCash(page);

    await page.getByRole('button', { name: 'Đóng ca' }).click();
    const closeDialog = page.getByRole('dialog', { name: 'Đóng ca' });
    await closeDialog.getByLabel('Tiền đếm được (VNĐ)').fill(String(expected - SHORTFALL_VND));
    await expect(closeDialog.locator('[data-cash-shift-variance]')).toContainText('−');
    await expect(closeDialog.getByRole('button', { name: 'Xác nhận đóng ca' })).toBeDisabled();
    await closeDialog.getByLabel('Ghi chú').fill('Thiếu tiền lẻ e2e');
    await closeDialog.getByRole('button', { name: 'Xác nhận đóng ca' }).click();
    await expect(closeDialog).toBeHidden();
    await expect(page.locator('[data-cash-shift-empty]')).toBeVisible();

    const history = page.locator('[data-cash-shift-row]:visible').first();
    await expect(history).toContainText('Thiếu tiền lẻ e2e');
    await expect(history).toContainText('Thiếu');
  });
});
