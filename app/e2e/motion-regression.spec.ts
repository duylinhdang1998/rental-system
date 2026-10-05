import { expect, test, type Page } from '@playwright/test';

interface MotionSample {
  slot: string;
  state: string;
  duration: string;
  connected: boolean;
  scales: number[];
  opacities: (string | number | undefined)[];
  translate: string;
}

type MotionWindow = Window & { motionSamples: MotionSample[] };

async function observeAnimations(page: Page) {
  await page.evaluate(() => {
    const targetWindow = window as MotionWindow;
    targetWindow.motionSamples = [];
    document.addEventListener('animationstart', (event) => {
      const element = event.target;
      if (!(element instanceof HTMLElement) || !element.dataset.slot) return;
      const animation = element
        .getAnimations()
        .find((item) => item instanceof CSSAnimation && item.animationName === event.animationName);
      const frames = animation?.effect?.getKeyframes() ?? [];
      const style = getComputedStyle(element);
      targetWindow.motionSamples.push({
        slot: element.dataset.slot,
        state: element.dataset.state ?? '',
        duration: style.animationDuration,
        connected: element.isConnected,
        scales: frames.map((frame) => new DOMMatrix(String(frame.transform ?? 'none')).a),
        opacities: frames.map((frame) => frame.opacity as string | number | undefined),
        translate: style.translate,
      });
    });
  });
}

async function animationSample(page: Page, slot: string, state: string) {
  const read = () =>
    page.evaluate(
      ({ slot, state }) =>
        (window as MotionWindow).motionSamples.find(
          (sample) => sample.slot === slot && sample.state === state,
        ),
      { slot, state },
    );
  await expect.poll(read).toBeTruthy();
  return (await read())!;
}

test('dialog and select run real token-timed animations and retain dialog exit', async ({
  page,
}) => {
  await page.goto('/ui-kit');
  await observeAnimations(page);
  const trigger = page.getByRole('button', { name: 'Mở dialog mẫu' });
  await expect(trigger).toHaveCSS(
    'transition-property',
    'background-color, color, border-color, opacity, translate',
  );
  await trigger.click();
  const enter = await animationSample(page, 'dialog-content', 'open');
  expect(enter.duration).toBe('0.2s');
  expect(Math.min(...enter.scales)).toBeCloseTo(0.95, 5);
  expect(enter.opacities.map(Number)).toContain(0);
  expect((await animationSample(page, 'dialog-overlay', 'open')).duration).toBe('0.2s');
  await page.keyboard.press('Escape');
  const exit = await animationSample(page, 'dialog-content', 'closed');
  expect(exit.connected).toBe(true);
  expect(Math.min(...exit.scales)).toBeCloseTo(0.95, 5);
  await expect(page.locator('[data-slot="dialog-content"]')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  const select = page.getByRole('combobox', { name: 'Loại xe' });
  await select.click();
  const selectEnter = await animationSample(page, 'select-content', 'open');
  expect(selectEnter.duration).toBe('0.15s');
  expect(selectEnter.scales.every((scale) => scale === 1)).toBe(true);
  expect(selectEnter.opacities.map(Number)).toContain(0);
  await page.getByRole('option', { name: 'Xe côn tay' }).click();
  await expect(select).toHaveText('Xe côn tay');
  await expect(select).toBeFocused();
});

test('reduced motion keeps static loading feedback and centered dialog fades', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ui-kit');
  const loading = page.getByTestId('loading-save');
  await expect(loading).toHaveAccessibleName('Lưu dữ liệu');
  await expect(loading).toHaveAttribute('aria-busy', 'true');
  await expect(loading.locator('.animate-spin')).toBeVisible();
  await expect(loading.locator('.animate-spin')).toHaveCSS('animation-name', 'none');
  const loadingState = page.locator('section[aria-busy="true"]');
  await expect(loadingState.locator('.animate-spin')).toBeVisible();
  await expect(loadingState.locator('.animate-spin')).toHaveCSS('animation-name', 'none');
  await expect(loadingState.getByRole('heading')).toBeVisible();
  await expect(loadingState.locator('p')).not.toHaveText('');
  await observeAnimations(page);
  const trigger = page.getByRole('button', { name: 'Mở dialog mẫu' });
  await trigger.hover();
  await page.mouse.down();
  await expect(trigger).toHaveCSS('translate', 'none');
  await page.mouse.up();
  const enter = await animationSample(page, 'dialog-content', 'open');
  expect(enter.scales.every((scale) => scale === 1)).toBe(true);
  expect(enter.opacities.map(Number)).toContain(0);
  expect(enter.translate).toBe('-50% -50%');
  expect(enter.duration).toBe('0.2s');
  await page.keyboard.press('Escape');
  const exit = await animationSample(page, 'dialog-content', 'closed');
  expect(exit.scales.every((scale) => scale === 1)).toBe(true);
  await expect(page.locator('[data-slot="dialog-content"]')).toHaveCount(0);
  const button = page.getByTestId('ready-save');
  await button.scrollIntoViewIfNeeded();
  await button.hover();
  await page.mouse.down();
  await expect(button).toHaveCSS('translate', 'none');
  await page.mouse.up();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(loading.locator('.animate-spin')).toHaveCSS('animation-name', 'spin');
  await button.hover();
  await page.mouse.down();
  await expect
    .poll(() => button.evaluate((element) => getComputedStyle(element).translate))
    .toBe('0px 1px');
  await page.mouse.up();
  await expect(button).toHaveCSS(
    'transition-property',
    'background-color, color, border-color, opacity, translate',
  );
});
