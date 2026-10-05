import { expect, test, type Page } from '@playwright/test';
import { signInAs } from './support/auth';

const RESPONSE_DELAY_MS = 700;

test('pointer navigation fades both the destination and delayed content without blocking controls', async ({
  page,
}) => {
  await signInAs(page, 'owner');
  await delayCustomers(page);
  await page.evaluate(() => {
    document.addEventListener('animationstart', (event) => {
      if (!(event.target instanceof HTMLElement) || event.animationName !== 'page-content-fade-in')
        return;
      if (event.target.classList.contains('page-content')) {
        document.documentElement.dataset.pageFade = 'started';
        document.documentElement.dataset.pageFadeOpacity = getComputedStyle(event.target).opacity;
      }
      if (event.target.classList.contains('query-content'))
        document.documentElement.dataset.contentFade = 'started';
    });
  });
  await page
    .getByRole('navigation', { name: 'Điều hướng chính' })
    .getByRole('link', { name: 'Khách hàng', exact: true })
    .click();
  await expect(page.getByRole('searchbox', { name: 'Tìm khách hàng' })).toBeEnabled();
  await expect(page.locator('html')).toHaveAttribute('data-page-fade', 'started');
  expect(Number(await page.locator('html').getAttribute('data-page-fade-opacity'))).toBeLessThan(1);
  await expect(page.getByTestId('query-region')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('html')).toHaveAttribute('data-content-fade', 'started');
});

test('history and direct links resynchronize local filter values', async ({ page }) => {
  await signInAs(page, 'owner');
  await page.goto('/customers');
  const search = page.getByRole('searchbox', { name: 'Tìm khách hàng' });
  await search.fill('V');
  await expect(page).toHaveURL(/search=V$/);
  await search.fill('VIP');
  await expect(page).toHaveURL(/search=VIP$/);
  await page.goBack();
  await expect(search).toHaveValue('V');
  await page.goForward();
  await expect(search).toHaveValue('VIP');
  await page
    .getByRole('navigation', { name: 'Điều hướng chính' })
    .getByRole('link', { name: 'Khách hàng', exact: true })
    .click();
  await expect(search).toHaveValue('');
});

test('vehicle search retains every typed character and its latest query', async ({ page }) => {
  await signInAs(page, 'owner');
  await page.goto('/vehicles');
  await expect(page.getByTestId('query-region')).toHaveAttribute('aria-busy', 'false');
  await page.route('**/api/fleet/vehicles?**', async (route) => {
    const response = await route.fetch();
    await new Promise((resolve) => setTimeout(resolve, RESPONSE_DELAY_MS));
    await route.fulfill({ response });
  });
  const search = page.getByRole('searchbox', { name: 'Tìm xe' });
  await search.pressSequentially('XE-001');
  await expect(search).toHaveValue('XE-001');
  await expect(search).toBeFocused();
  await expect(page).toHaveURL(/search=XE-001/);
  await expect(page.getByTestId('query-region')).toHaveAttribute('aria-busy', 'false');
  await expect(page.getByRole('row', { name: /XE-001/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /XE-002/ })).toHaveCount(0);
});

async function delayCustomers(page: Page) {
  await page.route('**/api/customers**', async (route) => {
    const response = await route.fetch();
    await new Promise((resolve) => setTimeout(resolve, RESPONSE_DELAY_MS));
    await route.fulfill({ response });
  });
}

test('cold navigation keeps destination controls visible and keyboard navigation has no fade', async ({
  page,
}) => {
  await signInAs(page, 'owner');
  await delayCustomers(page);
  const navigation = page.getByRole('navigation', { name: 'Điều hướng chính' });
  await navigation.getByRole('link', { name: 'Khách hàng', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Khách hàng', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Tìm khách hàng' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Thêm khách hàng', exact: true })).toBeEnabled();
  await expect(page.getByTestId('results-skeleton')).toBeVisible();
  await expect(page.locator('.page-content')).not.toHaveClass(/page-content-enter/);
  await expect(page.getByTestId('query-region')).toHaveAttribute('aria-busy', 'false');
});

test('typing retains the input, caret and previous results while queries change', async ({
  page,
}) => {
  await signInAs(page, 'owner');
  await page.goto('/customers');
  await expect(page.getByTestId('query-region')).toHaveAttribute('aria-busy', 'false');
  await delayCustomers(page);
  const search = page.getByRole('searchbox', { name: 'Tìm khách hàng' });
  const original = await search.elementHandle();
  await search.pressSequentially('VIP');
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('VIP');
  await expect(page.getByTestId('query-region')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('.query-content')).toHaveAttribute('inert', '');
  await expect(page.getByTestId('results-skeleton')).toHaveCount(0);
  await expect(page.getByTestId('query-region')).toHaveAttribute('aria-busy', 'false');
  expect(await original?.evaluate((element) => element.isConnected)).toBe(true);
  await expect(search).toBeFocused();
  await expect(page.getByRole('row', { name: /Khách VIP mẫu/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /Khách hàng mẫu/ })).toHaveCount(0);
  await expect(page.locator('.query-content')).not.toHaveAttribute('inert');
});

test('prefetch fills the same cache, revisits do not refetch, and history is immediate', async ({
  page,
}) => {
  let requests = 0;
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/customers') requests++;
  });
  await signInAs(page, 'owner');
  const navigation = page.getByRole('navigation', { name: 'Điều hướng chính' });
  const customers = navigation.getByRole('link', { name: 'Khách hàng', exact: true });
  const loaded = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/api/customers',
  );
  await customers.hover();
  await (await loaded).finished();
  await page.evaluate(() => {
    document.addEventListener('animationstart', (event) => {
      if (event.target instanceof HTMLElement && event.target.classList.contains('page-content'))
        document.documentElement.dataset.cachedPageFade = event.animationName;
    });
  });
  await customers.click();
  await expect(page.getByTestId('query-region')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('.page-content')).toHaveClass(/page-content-enter/);
  await expect(page.locator('html')).toHaveAttribute(
    'data-cached-page-fade',
    'page-content-fade-in',
  );
  await expect(page.locator('.page-content')).toHaveCSS('animation-duration', '0.3s');
  await navigation.getByRole('link', { name: 'Xe', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Xe', exact: true })).toBeVisible();
  await page.goBack();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Khách hàng', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.page-content')).not.toHaveClass(/page-content-enter/);
  expect(requests).toBe(1);
});

test('failed and empty searches retain controls and allow recovery', async ({ page }) => {
  await signInAs(page, 'owner');
  await page.goto('/customers');
  const search = page.getByRole('searchbox', { name: 'Tìm khách hàng' });
  await expect(page.getByTestId('query-region')).toHaveAttribute('aria-busy', 'false');
  await page.route('**/api/customers**', async (route) => {
    if (new URL(route.request().url()).searchParams.get('search') === 'fail')
      await route.fulfill({ status: 500, json: { message: 'Test failure' } });
    else await route.continue();
  });
  await search.fill('fail');
  await expect(page.getByRole('button', { name: 'Thử lại' })).toBeVisible();
  await expect(search).toBeFocused();
  await search.fill('no-matching-customer-fixture');
  await expect(page.getByRole('heading', { name: 'Không tìm thấy kết quả' })).toBeVisible();
  await expect(search).toBeFocused();
  await search.fill('');
  await expect(page.getByRole('row', { name: /Khách hàng mẫu/ })).toBeVisible();
});

test('mobile pointer navigation is opacity-only and reduced motion retains usable content', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await signInAs(page, 'staff');
  await page
    .getByRole('navigation', { name: 'Điều hướng nhanh' })
    .getByRole('link', { name: 'Khách hàng', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Khách hàng', exact: true }),
  ).toBeVisible();
  const content = page.locator('.page-content');
  await expect(content).toHaveCSS('animation-name', 'none');
  await expect(content).toHaveCSS('opacity', '1');
  await expect(content).toHaveCSS('transform', 'none');
  await expect(page.getByRole('searchbox', { name: 'Tìm khách hàng' })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
});
