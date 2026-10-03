import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { signInAs } from './support/auth';

test('Primary color updates components and survives reload and navigation', async ({ page }) => {
  await signInAs(page, 'owner');
  const selector = page.getByRole('combobox', { name: /Màu chủ đạo/ });
  await selector.click();
  await page.getByRole('option', { name: 'Xanh dương', exact: true }).click();
  const add = page.getByRole('link', { name: 'Tạo hợp đồng', exact: true });
  await expect(add).toHaveCSS('background-color', 'rgb(37, 99, 235)');
  await page.reload();
  await expect(selector).toHaveAccessibleName('Màu chủ đạo: Xanh dương');
  await page.goto('/vehicles');
  await expect(selector).toHaveAccessibleName('Màu chủ đạo: Xanh dương');
  await expect(page.getByRole('button', { name: 'Thêm xe', exact: true })).toHaveCSS(
    'background-color',
    'rgb(37, 99, 235)',
  );
});

test('Mobile color selector supports all palettes without overflow or accessibility regressions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await signInAs(page, 'owner');
  const selector = page.getByRole('combobox', { name: /Màu chủ đạo/ });
  for (const name of ['Tím', 'Xanh dương', 'Xanh lá', 'Đỏ', 'Hồng', 'Cam', 'Trung tính']) {
    await selector.click();
    await page.getByRole('option', { name, exact: true }).click();
    await expect(selector).toHaveAccessibleName(`Màu chủ đạo: ${name}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  await selector.focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Home');
  await page.keyboard.press('Enter');
  await expect(selector).toHaveAccessibleName('Màu chủ đạo: Tím');
});

test('Unknown saved color falls back safely to Violet', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('rental-primary-color', 'unknown'));
  await signInAs(page, 'owner');
  await expect(page.getByRole('combobox', { name: /Màu chủ đạo/ })).toHaveAccessibleName(
    'Màu chủ đạo: Tím',
  );
});
