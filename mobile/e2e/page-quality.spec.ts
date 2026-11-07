/**
 * The page-quality gates from the Nov 2026 audit, on the key pages of every portal (sample-data build):
 * one h1 per page, no sideways scroll on a 320px phone, and no label cut off with "…" on a desktop.
 */
import { expect, type Page, test } from '@playwright/test';

/** The audit's key pages, each in the role that sees it. */
const PAGES: readonly string[] = [
  '/welcome',
  '/schools/pricing',
  '/?as=learner',
  '/learn/library?as=learner',
  '/learn/careers?as=learner',
  '/learn/plan?as=learner',
  '/learn/lessons?as=learner',
  '/?as=teacher',
  '/teach/studio?as=teacher',
  '/?as=school',
  '/admin/finance/fees?as=school',
  '/admin/finance/ledger?as=school',
  '/?as=parent',
  '/command/overview?as=command',
];

/** Waits until the page has drawn its content (the dev server bundles each page on first visit). */
async function open(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await expect.poll(() => page.evaluate(() => document.body.innerText.length), { timeout: 120_000 }).toBeGreaterThan(200);
  await expect(page.getByText(/^Bundling/)).toHaveCount(0);
  // The page itself, in the role the address names, not the notice for a page outside the role.
  await expect(page.getByText("This page isn't part of your account").filter({ visible: true })).toHaveCount(0);
}

/** Visible text that the browser is cutting off with "…" (one line or a line clamp). */
function cutLabels(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll('body *')]
      .filter((el) => el.checkVisibility() && [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim()))
      .filter((el) => {
        const cs = getComputedStyle(el);
        const clipped = cs.textOverflow === 'ellipsis' || cs.webkitLineClamp !== 'none';
        return clipped && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
      })
      .map((el) => el.textContent?.trim().slice(0, 40) ?? ''),
  );
}

function headingOnes(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll('h1,[role=heading][aria-level="1"]')].filter((el) => el.checkVisibility()).map((el) => el.textContent?.trim().slice(0, 40) ?? ''),
  );
}

for (const url of PAGES) {
  test.describe(url, () => {
    test('on a desktop it has one h1 and no label is cut off', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await open(page, url);
      expect(await headingOnes(page), 'the h1s on this page').toHaveLength(1);
      expect(await cutLabels(page), 'labels cut off at 1440px').toEqual([]);
      await page.setViewportSize({ width: 1024, height: 900 });
      await open(page, url);
      expect(await cutLabels(page), 'labels cut off at 1024px').toEqual([]);
    });

    test('on a 320px phone it has one h1 and nothing scrolls sideways', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await open(page, url);
      expect(await headingOnes(page), 'the h1s on this page').toHaveLength(1);
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(width, 'the page is wider than the phone').toBeLessThanOrEqual(320);
    });
  });
}

test("the learner's top menu shows at most seven pages, each read out by the label it shows", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 900 });
  await open(page, '/?as=learner');
  const tabs = await page.evaluate(() =>
    // The top bar is the page's first tab strip (pages have their own further down).
    [...([...document.querySelectorAll('[role=tablist]')].find((l) => l.checkVisibility())?.querySelectorAll('[role=tab]') ?? [])]
      .filter((el) => el.checkVisibility())
      .map((el) => ({ name: el.getAttribute('aria-label') ?? '', shown: (el as HTMLElement).innerText.trim() })),
  );
  expect(tabs.length).toBeGreaterThan(3);
  expect(tabs.length).toBeLessThanOrEqual(7);
  for (const t of tabs) expect(t.name, `the "${t.shown}" tab`).toBe(t.shown);
});
