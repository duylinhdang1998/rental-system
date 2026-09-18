import { AxeBuilder } from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { signInAs } from './support/auth';

const ROUTES = [
  '/',
  '/vehicles',
  '/customers',
  '/contracts',
  '/contracts/new',
  '/returns',
  '/receivables',
  '/expenses',
  '/cash-shifts',
  '/reports',
  '/reports/fleet',
  '/reports/analytics',
  '/reports/pnl',
  '/employees',
  '/audit',
  '/settings',
  '/settings/damage-items',
];
const VIEWPORTS = { desktop: { height: 900, width: 1280 }, phone: { height: 800, width: 360 } };
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const BLOCKING_IMPACTS = new Set(['critical', 'serious']);

async function expectAccessiblePage(page: Page) {
  await expect(page.locator('h1').first()).toBeVisible();
  expect(await page.locator('h1').count()).toBe(1);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const blocking = results.violations
    .filter((violation) => BLOCKING_IMPACTS.has(violation.impact ?? ''))
    .map(
      (violation) =>
        `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(' | ')}`,
    );
  expect(blocking).toEqual([]);
}

for (const [name, viewport] of Object.entries(VIEWPORTS)) {
  test.describe(`Feature: Accessibility and overflow sweep — ${name}`, () => {
    test.use({ viewport });

    test('Scenario: The login page passes the sweep', async ({ page }) => {
      await page.goto('/login');
      await expectAccessiblePage(page);
    });

    for (const route of ROUTES) {
      test(`Scenario: ${route} passes the sweep for the Owner`, async ({ page }) => {
        await signInAs(page, 'owner');
        await page.goto(route);
        await expectAccessiblePage(page);
      });
    }
  });
}
