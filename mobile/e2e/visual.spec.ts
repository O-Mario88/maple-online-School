/**
 * Visual snapshots (Nov 2026 audit, ENG-01): the design-system gallery at four widths and the key page
 * of each portal on a phone and a desktop, compared with the pictures in e2e/visual.spec.ts-snapshots.
 *
 * The clock is frozen so greetings and countdowns don't move. Fonts draw differently on Linux, so the
 * pictures are macOS ones and CI skips this file; run it locally with `npm run test:visual`, and
 * `npm run test:visual -- --update-snapshots` after an intended change (look at the diff first).
 */
import { expect, type Page, test } from '@playwright/test';

/** 6 November 2026, 10:00 in Kampala: a school morning. */
const FROZEN = new Date('2026-11-06T07:00:00Z');
const MAX_DIFF = 0.01;

const PAGES: readonly [string, string][] = [
  ['welcome', '/welcome'],
  ['pricing', '/schools/pricing'],
  ['learner-home', '/?as=learner'],
  ['library', '/learn/library?as=learner'],
  ['careers', '/learn/careers?as=learner'],
  ['teacher-home', '/?as=teacher'],
  ['school-home', '/?as=school'],
  ['fees', '/admin/finance/fees?as=school'],
  ['parent-home', '/?as=parent'],
  ['command', '/command/overview?as=command'],
];

test.skip(process.platform !== 'darwin', 'The snapshots are macOS pictures; Linux draws fonts differently.');

async function settle(page: Page, url: string): Promise<void> {
  await page.clock.setFixedTime(FROZEN);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(url);
  await expect.poll(() => page.evaluate(() => document.body.innerText.length), { timeout: 120_000 }).toBeGreaterThan(200);
  await page.evaluate(() => document.fonts.ready);
}

for (const width of [320, 768, 1024, 1440]) {
  test(`the design-system gallery at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await settle(page, '/design-system?as=learner');
    await expect(page).toHaveScreenshot(`gallery-${width}.png`, { maxDiffPixelRatio: MAX_DIFF, animations: 'disabled' });
  });
}

for (const [name, url] of PAGES) {
  for (const width of [375, 1440]) {
    test(`${name} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await settle(page, url);
      await expect(page).toHaveScreenshot(`${name}-${width}.png`, { maxDiffPixelRatio: MAX_DIFF, animations: 'disabled' });
    });
  }
}
