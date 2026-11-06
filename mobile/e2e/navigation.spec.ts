/**
 * Moving around a portal keeps one frame: the same top bar and sidebar at the same place, the same
 * signed-in person, no reload and no dark frame between pages. Each portal mixes pages that draw the
 * frame themselves with pages the layout frames (components/shell/PortalScreen), which used to swap
 * to the generic shell.
 */
import { expect, type Locator, type Page, test } from '@playwright/test';

/** A colour channel below this on every sampled point is a black screen, not a dark card. */
const DARK_CHANNEL = 40;
/** Fewer sampled frames than this would make "no dark frames" meaningless. */
const MIN_FRAMES = 30;

declare global {
  interface Window {
    navProbe?: { frames: number; dark: number };
    sameVisit?: boolean;
  }
}

test.beforeEach(async ({ page }) => {
  // Samples two points of the page area on every animation frame; both near-black counts as a dark frame.
  await page.addInitScript((limit: number) => {
    const probe = { frames: 0, dark: 0 };
    window.navProbe = probe;
    const darkAt = (x: number, y: number): boolean => {
      for (const el of document.elementsFromPoint(x, y)) {
        const m = /rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/.exec(getComputedStyle(el).backgroundColor);
        if (!m || (m[4] !== undefined && Number(m[4]) < 0.9)) continue;
        return Math.max(Number(m[1]), Number(m[2]), Number(m[3])) < limit;
      }
      return false;
    };
    const tick = () => {
      if (document.body) {
        probe.frames += 1;
        if (darkAt(innerWidth * 0.6, innerHeight * 0.55) && darkAt(innerWidth * 0.35, innerHeight * 0.8)) probe.dark += 1;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, DARK_CHANNEL);
});

/** The one copy of an element on the page in front (pages behind it stay mounted but hidden). */
function shown(l: Locator): Locator {
  return l.filter({ visible: true }).first();
}

async function box(l: Locator): Promise<{ x: number; y: number; w: number; h: number }> {
  const b = await shown(l).boundingBox();
  if (!b) throw new Error('The frame element has no box on screen');
  return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
}

/** Opens the first page, waits for its frame, then starts counting frames from a settled screen. */
async function start(page: Page, url: string, frameItem: Locator): Promise<void> {
  await page.goto(url);
  await expect(shown(frameItem)).toBeVisible();
  await page.evaluate(() => {
    window.sameVisit = true;
    if (window.navProbe) Object.assign(window.navProbe, { frames: 0, dark: 0 });
  });
}

/** Follows a menu link and waits until its page alone is on screen (the fade has finished). */
async function go(page: Page, link: Locator, path: string, frameItem: Locator): Promise<void> {
  await shown(link).click();
  await expect.poll(() => new URL(page.url()).pathname).toBe(path);
  await expect(frameItem.filter({ visible: true })).toHaveCount(1);
}

async function expectSmooth(page: Page): Promise<void> {
  const r = await page.evaluate(() => ({ same: window.sameVisit === true, frames: window.navProbe?.frames ?? 0, dark: window.navProbe?.dark ?? -1 }));
  expect(r.same, 'the app reloaded instead of moving within it').toBe(true);
  expect(r.dark, `${r.dark} of ${r.frames} sampled frames were dark`).toBe(0);
  expect(r.frames).toBeGreaterThan(MIN_FRAMES);
}

test('the school portal keeps one admin frame and one signed-in person on every page', async ({ page }) => {
  const menu = (name: string) => page.getByRole('menuitem', { name, exact: true });
  const person = page.getByRole('button', { name: /School Administrator\. Switch mode$/ });
  const first = menu('Dashboard');
  await start(page, '/?as=school', first);
  const frame = await box(first);
  const who = await shown(person).getAttribute('aria-label');

  const route: readonly [string, string][] = [
    ['Fees & Finance', '/admin/finance/fees'],
    ['Communication', '/messages'],
    ['School Growth', '/admin/growth'],
    ['Communication', '/messages'],
    ['Dashboard', '/'],
  ];
  for (const [item, path] of route) {
    await go(page, menu(item), path, first);
    expect(await box(first), `the sidebar moved on ${path}`).toEqual(frame);
    await expect(shown(person)).toHaveAttribute('aria-label', who ?? '');
  }
  await expectSmooth(page);
});

test('a parent page the layout frames keeps what you typed when you come back to it', async ({ page }) => {
  const menu = (name: string) => page.getByRole('menuitem', { name, exact: true });
  const first = menu('Home');
  await start(page, '/family/academics?as=parent', first);
  const frame = await box(first);

  await go(page, menu('Calendar'), '/family/attendance', first);
  expect(await box(first), 'the sidebar moved on Attendance').toEqual(frame);
  const note = shown(page.getByRole('textbox', { name: 'Note (optional)' }));
  await note.fill('Fever, back on Monday');
  await note.evaluate((el) => el.setAttribute('data-nav-probe', 'kept'));

  await go(page, menu('Academics'), '/family/academics', first);
  expect(await box(first), 'the sidebar moved on Academics').toEqual(frame);
  await go(page, menu('Calendar'), '/family/attendance', first);
  // The same input element, so the page was kept, not rebuilt.
  await expect(shown(page.locator('input[data-nav-probe="kept"]'))).toHaveValue('Fever, back on Monday');
  await expectSmooth(page);
});

test('the teacher top bar stays put between designed pages and Classes', async ({ page }) => {
  const tab = (name: string) => page.getByRole('tab', { name, exact: true });
  const person = page.getByRole('button', { name: /Mode\. Switch mode$/ });
  const first = tab('Home');
  await start(page, '/teach/studio?as=teacher', first);
  const frame = await box(first);
  const who = await shown(person).getAttribute('aria-label');

  const route: readonly [string, string][] = [
    ['Classes', '/learn/live'],
    ['Studio', '/teach/studio'],
    ['Classes', '/learn/live'],
  ];
  for (const [item, path] of route) {
    await go(page, tab(item), path, first);
    expect(await box(first), `the top bar moved on ${path}`).toEqual(frame);
    await expect(shown(person)).toHaveAttribute('aria-label', who ?? '');
  }
  await expectSmooth(page);
});

test.describe('on a tablet', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('the public navbar opens every section from its menu, and the site footer ends the page', async ({ page }) => {
    await page.goto('/welcome');
    await shown(page.getByRole('button', { name: 'Menu', exact: true })).click();
    const schools = shown(page.getByRole('link', { name: 'For Schools', exact: true }));
    await expect(schools).toBeVisible();
    await schools.click();
    await expect.poll(() => new URL(page.url()).pathname).toBe('/schools');
    // One footer, in the web build, at the end of the page.
    await expect(page.getByRole('contentinfo').filter({ visible: true })).toHaveCount(1);
    await expect(shown(page.getByRole('link', { name: 'Get it on Google Play' }))).toBeVisible();
    await expect(shown(page.getByRole('link', { name: 'Download on the App Store' }))).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(768);
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("each portal's pages keep the portal's own tab bar", async ({ page }) => {
    const tab = (name: string) => page.getByRole('tab', { name, exact: true });
    await page.goto('/learn/live?as=teacher');
    await expect(shown(tab('Classes'))).toBeVisible();
    await expect(shown(tab('Assignments'))).toBeVisible();
    // The desktop top bar (which has a Studio tab) stays off phones.
    await expect(tab('Studio').filter({ visible: true })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);

    await page.goto('/messages?as=school');
    await expect(shown(tab('Dashboard'))).toBeVisible();
    await expect(page.getByRole('menuitem').filter({ visible: true })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  });

  test('Messages opens a conversation on its own page, and a reply shows in it', async ({ page }) => {
    await page.goto('/messages?as=learner');
    await shown(page.getByRole('button', { name: /^Mary’s weekly progress/ })).click();
    await expect.poll(() => new URL(page.url()).pathname).toBe('/messages/1');
    const reply = shown(page.getByRole('textbox', { name: 'Reply' }));
    await reply.fill('Thanks, I will keep practising.');
    await shown(page.getByRole('button', { name: 'Send', exact: true })).click();
    // The page stays up (a reply once replaced it with the error card) and shows what was sent.
    await expect(shown(page.getByText('Thanks, I will keep practising.', { exact: true }))).toBeVisible();
    await expect(page.getByText("This page couldn't load")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  });

  test('a new conversation opens once sent, and a broken link explains itself', async ({ page }) => {
    await page.goto('/messages/new?as=learner');
    await shown(page.getByRole('textbox', { name: 'Subject' })).fill('Homework this week');
    await shown(page.getByRole('textbox', { name: 'Message' })).fill('Could we talk about the maths homework?');
    await shown(page.getByRole('button', { name: 'Send', exact: true })).click();
    await expect.poll(() => new URL(page.url()).pathname).toMatch(/^\/messages\/\d+$/);
    await expect(shown(page.getByRole('heading', { name: 'Homework this week' }))).toBeVisible();
    await expect(shown(page.getByText('Could we talk about the maths homework?', { exact: true }))).toBeVisible();

    await page.goto('/messages/undefined?as=learner');
    await expect(shown(page.getByText("This conversation can't be found"))).toBeVisible();
  });
});
