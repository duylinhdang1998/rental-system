import { expect, test } from '@playwright/test';

const RESPONSIVE_WIDTHS = [768, 1024, 1440] as const;

test('opens the linkable showroom without business API traffic', async ({ page }) => {
  const apiRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/')) apiRequests.push(request.url());
  });
  await page.goto('/ui-kit');
  await expect(page.getByRole('heading', { level: 1, name: 'UI Foundation' })).toBeVisible();
  await page.getByRole('link', { name: 'Buttons' }).click();
  await expect(page).toHaveURL(/#buttons$/);
  await expect(page.getByRole('heading', { level: 2, name: 'Buttons' })).toBeVisible();
  expect(apiRequests).toEqual([]);
});

test('compares action, field, data and feedback states', async ({ page }) => {
  await page.goto('/ui-kit');
  for (const name of ['Thêm mới', 'Lưu nháp', 'Hủy', 'Xem chi tiết', 'Xóa']) {
    await expect(page.getByRole('button', { name })).toBeVisible();
  }
  await expect(page.getByLabel('Tên khách hàng')).toHaveValue('');
  await expect(page.getByLabel('Đã có dữ liệu')).toHaveValue('Nguyễn Văn An');
  await expect(page.getByLabel('Không thể chỉnh sửa')).toBeDisabled();
  await expect(page.getByLabel('Trạng thái lỗi')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('CreatedAt', { exact: true })).toBeVisible();
  await expect(page.getByText('Không thể tải tổng quan')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(
    page.getByRole('heading', { level: 3, name: 'Không thể tải tổng quan' }),
  ).toBeVisible();
  const readyBox = await page.getByTestId('ready-save').boundingBox();
  const loadingBox = await page.getByTestId('loading-save').boundingBox();
  expect(loadingBox?.width).toBe(readyBox?.width);
});

test('operates selection primitives and dialog by keyboard', async ({ page }) => {
  await page.goto('/ui-kit');
  const select = page.getByRole('combobox', { name: 'Loại xe' });
  await select.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await expect(select).toHaveText('Xe côn tay');
  const checkbox = page.getByRole('checkbox', { name: 'Kèm mũ bảo hiểm' });
  await checkbox.focus();
  await page.keyboard.press('Space');
  await expect(checkbox).not.toBeChecked();
  const cash = page.getByRole('radio', { name: 'Tiền mặt' });
  await cash.focus();
  await page.keyboard.press('ArrowDown');
  const transfer = page.getByRole('radio', { name: 'Chuyển khoản' });
  await expect(transfer).toBeFocused();
  await page.keyboard.press('Space');
  await expect(transfer).toBeChecked();
  expect(await cash.evaluate((element) => getComputedStyle(element).outlineWidth)).not.toBe('0px');
});

test('traps dialog focus and returns it to the trigger', async ({ page }) => {
  await page.goto('/ui-kit');
  const trigger = page.getByRole('button', { name: 'Mở dialog mẫu' });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Tab');
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('fits 360px, keeps touch targets usable and has no page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/ui-kit');
  await expect(page.getByRole('navigation', { name: 'Danh mục component' })).toBeVisible();
  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    expandedUndersized: [...document.querySelectorAll('[role=checkbox], [role=radio]')]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const target = getComputedStyle(element, '::after');
        return {
          height: rect.height - Number.parseFloat(target.top) - Number.parseFloat(target.bottom),
          width: rect.width - Number.parseFloat(target.left) - Number.parseFloat(target.right),
        };
      })
      .filter((rect) => rect.width < 44 || rect.height < 44).length,
    undersized: [
      ...document.querySelectorAll(
        'button:not(:disabled):not([role=checkbox]):not([role=radio]), a[href], [role=combobox]',
      ),
    ]
      .map((element) => element.getBoundingClientRect())
      .filter((rect) => Math.max(rect.width, rect.height) < 44).length,
  }));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
  expect(layout.expandedUndersized).toBe(0);
  expect(layout.undersized).toBe(0);
});

for (const width of RESPONSIVE_WIDTHS) {
  test(`has no page overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/ui-kit');
    const layout = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
  });
}
