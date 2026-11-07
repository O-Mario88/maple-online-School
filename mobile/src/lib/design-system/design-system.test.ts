/// <reference types="node" />
import fs from 'fs';
import path from 'path';

import { Maple } from '@/constants/maple';

import { contrast, isAccentBlue, isPurple } from './color';

const SRC = path.resolve(__dirname, '../..');
/** Token files are where colours are allowed to be written as hex. */
const TOKEN_FILES = new Set(['constants/maple.ts', 'constants/theme.ts', 'constants/palette.ts', 'lib/design-system/color.ts']);

function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Sample data is not interface code.
        if (entry.name !== 'mock' && entry.name !== 'node_modules') walk(full);
      } else if (/\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
        out.push(full);
      }
    }
  };
  walk(SRC);
  return out;
}

function hexLiterals(): { file: string; hex: string }[] {
  return sourceFiles()
    .filter((file) => !TOKEN_FILES.has(path.relative(SRC, file)))
    .flatMap((file) => {
      const text = fs.readFileSync(file, 'utf8');
      return [...text.matchAll(/['"`](#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?|#[0-9A-Fa-f]{3})['"`]/g)].map((m) => ({
        file: path.relative(SRC, file),
        hex: m[1],
      }));
    });
}

describe('Maple palette contrast (WCAG 2.2 AA)', () => {
  it.each([
    ['navy headings on white', Maple.navy, Maple.surface],
    ['body text on the canvas', Maple.body, Maple.canvas],
    ['secondary text on white', Maple.secondary, Maple.surface],
    ['white on a primary button', Maple.white, Maple.blue],
    ['white on a hovered primary button', Maple.white, Maple.blueHover],
    ['blue text on a selected tab or chip', Maple.blueText, Maple.blueSelected],
    ['blue link text on white', Maple.blue, Maple.surface],
    ['success text on its tint', Maple.successText, Maple.successSoft],
    ['warning text on its tint', Maple.warningText, Maple.warningSoft],
    ['error text on its tint', Maple.errorText, Maple.errorSoft],
    ['navy on an accent button', Maple.navy, Maple.goldSoft],
    ['navy on a hovered accent button', Maple.navy, Maple.goldHover],
    ['white text on the deep hero', Maple.white, Maple.navyDeep],
    ['muted text on the blue hero', Maple.onBlueMuted, Maple.blue],
  ])('%s meets 4.5:1', (_label, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps an accent button visible as a 3:1 shape on the blue hero', () => {
    expect(contrast(Maple.goldSoft, Maple.blue)).toBeGreaterThanOrEqual(3);
  });

  it('keeps the primary blue visible as a 3:1 control colour on the canvas', () => {
    expect(contrast(Maple.blue, Maple.canvas)).toBeGreaterThanOrEqual(3);
  });

  it('makes disabled text visibly quieter than secondary text', () => {
    expect(contrast(Maple.disabledText, Maple.disabledSurface)).toBeLessThan(contrast(Maple.secondary, Maple.surface));
  });
});

describe('pages stay on the Maple palette', () => {
  it('uses no purple anywhere in interface code', () => {
    const purple = hexLiterals().filter(({ hex }) => isPurple(hex));
    expect(purple.map(({ file, hex }) => `${file} ${hex}`)).toEqual([]);
  });

  it('takes every accent blue from the tokens instead of a hex literal', () => {
    const blues = hexLiterals().filter(({ hex }) => isAccentBlue(hex));
    expect(blues.map(({ file, hex }) => `${file} ${hex}`)).toEqual([]);
  });

  it('draws no button as a pill', () => {
    // Buttons are found by their style names; circles (icon buttons) are fine.
    const ACTION = /(btn|button|cta|ghost|outline|primary|secondary|join|start|continue|apply|submit|action|book|enrol|upgrade|subscribe|explore|follow|save|pay|send|confirm)/i;
    const NOT_A_BUTTON = /(Text|Txt|Label|Icon|Wrap|Row|Count|Badge|Dot|Img|Image|Title|Note|Line|Card|Tab)$/;
    const pills: string[] = [];
    for (const file of sourceFiles()) {
      const text = fs.readFileSync(file, 'utf8');
      for (const m of text.matchAll(/\n\s*([A-Za-z0-9_]+):\s*\{([^{}]*)\}/g)) {
        const [, name, body] = m;
        if (!ACTION.test(name) || NOT_A_BUTTON.test(name)) continue;
        const radius = body.match(/borderRadius:\s*([^,\n]+)/)?.[1]?.trim();
        if (!radius) continue;
        const width = Number(body.match(/(?:^|[\s,{])width:\s*([\d.]+)/)?.[1]);
        const height = Number(body.match(/(?:^|[\s,{])height:\s*([\d.]+)/)?.[1]);
        if (width && width === height) continue;
        const r = Number(radius);
        const pill = radius.includes('pill') || r >= 999 || (Number.isFinite(r) && (height ? r >= height * 0.4 : r > 12));
        if (pill) pills.push(`${path.relative(SRC, file)} ${name} ${radius}`);
      }
    }
    expect(pills).toEqual([]);
  });

  it('underlines every active tab with the same 3px bar', () => {
    const thin: string[] = [];
    for (const file of sourceFiles()) {
      const text = fs.readFileSync(file, 'utf8');
      for (const m of text.matchAll(/\n\s*([A-Za-z0-9_]*[Tt]ab[A-Za-z0-9_]*(?:Line|Bar|Under|Indicator|Ink)):\s*\{([^{}]*)\}/g)) {
        const [, name, body] = m;
        const height = body.match(/(?:^|[\s,{])height:\s*([\d.]+)/)?.[1];
        if (height && /position:\s*'absolute'|bottom/.test(body) && height !== '3') thin.push(`${path.relative(SRC, file)} ${name} ${height}`);
      }
    }
    expect(thin).toEqual([]);
  });

  it('draws keyboard focus as a Maple Blue ring on the web', () => {
    const css = fs.readFileSync(path.join(SRC, 'global.css'), 'utf8');
    const rule = css.match(/:focus-visible\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(rule).toMatch(/outline:\s*2px solid/);
    expect(rule.toUpperCase()).toContain(Maple.blue.toUpperCase());
  });

  it('stills web transitions and smooth scrolling when the person asks for less motion', () => {
    const css = fs.readFileSync(path.join(SRC, 'global.css'), 'utf8');
    const block = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
    expect(block).toMatch(/transition-duration:\s*0\.01ms !important/);
    expect(block).toMatch(/animation-duration:\s*0\.01ms !important/);
    expect(block).toMatch(/scroll-behavior:\s*auto !important/);
  });

  it('gives every control on the web a click area of at least 24px, without changing how it looks', () => {
    const css = fs.readFileSync(path.join(SRC, 'global.css'), 'utf8');
    const rule = css.match(/\[role='button'\][^{]*::after\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(rule).toMatch(/content:\s*''/);
    expect(rule).toMatch(/position:\s*absolute/);
    for (const side of ['top', 'bottom', 'left', 'right']) expect(rule).toMatch(new RegExp(`${side}:\\s*min\\(0px, calc\\(\\(100% - 24px / var\\(--ui-scale, 1\\)\\) / 2\\)\\)`));
  });

  it('never answers a button with only a toast on a page a deployment build shows', () => {
    // Pages that ship: the real-data screens (Live*), shared components, sign-in and messages, and
    // every route that isn't design-only (design-only routes say "Coming soon" when deployed).
    const designOnly = (text: string) => /<PreviewScreen\b/.test(text) && !/:\s*<Live[A-Z]\w*/.test(text);
    const ships = (rel: string, text: string) =>
      /(^|\/)Live[A-Z]\w*\.tsx$/.test(rel) ||
      rel.startsWith('components/') ||
      rel.startsWith('features/auth/') ||
      rel.startsWith('features/messages/') ||
      (rel.startsWith('app/') && !designOnly(text));
    const toastOnly = sourceFiles().flatMap((file) => {
      const rel = path.relative(SRC, file);
      const text = fs.readFileSync(file, 'utf8');
      if (!ships(rel, text)) return [];
      return [...text.matchAll(/onPress=\{\(\) => toast\(/g)].map(() => rel);
    });
    expect(toastOnly).toEqual([]);
  });

  // A ratchet on the hand-built styling the Nov 2026 audit found (pages ported screenshot by
  // screenshot with their own sizes, radii and buttons). Each count may only go down: new work uses
  // TypeScale, Radii, the shared controls and responsive layouts. When a migration lowers a count,
  // lower its ceiling here to lock the gain in.
  it('never adds hand-built font sizes, radii, buttons, rgba colours or scaled canvases', () => {
    const CEILING = { fontSize: 4027, borderRadius: 2568, pressable: 1580, rgba: 184, refScale: 43 } as const;
    const counts = { fontSize: 0, borderRadius: 0, pressable: 0, rgba: 0, refScale: 0 };
    for (const file of sourceFiles()) {
      if (TOKEN_FILES.has(path.relative(SRC, file))) continue;
      const text = fs.readFileSync(file, 'utf8');
      counts.fontSize += (text.match(/fontSize:\s*[0-9.]+/g) ?? []).length;
      counts.borderRadius += (text.match(/borderRadius:\s*[0-9.]+/g) ?? []).length;
      counts.pressable += (text.match(/<Pressable\b/g) ?? []).length;
      counts.rgba += (text.match(/rgba\(/g) ?? []).length;
      counts.refScale += (text.match(/<RefScale\b/g) ?? []).length;
    }
    for (const key of Object.keys(CEILING) as (keyof typeof CEILING)[]) {
      expect({ [key]: counts[key] <= CEILING[key] ? 'within' : `${counts[key]} > ${CEILING[key]}` }).toEqual({ [key]: 'within' });
    }
  });

  it('writes no colour as hex outside the token files (constants/maple.ts, theme.ts and palette.ts)', () => {
    expect(hexLiterals().map((h) => `${h.file} ${h.hex}`)).toEqual([]);
  });

  it('draws every image through the Maple Image, which needs a label or the decorative flag', () => {
    const direct = sourceFiles()
      .filter((file) => path.relative(SRC, file) !== 'components/picture.tsx')
      .filter((file) => {
        const text = fs.readFileSync(file, 'utf8');
        return /from 'expo-image'/.test(text) || /import \{[^}]*\b(Image|ImageBackground)\b[^}]*\} from 'react-native'/.test(text);
      })
      .map((file) => path.relative(SRC, file));
    expect(direct).toEqual([]);
  });

  it('checks reduced motion before every animated scroll and looping animation', () => {
    const unchecked = sourceFiles().flatMap((file) => {
      const text = fs.readFileSync(file, 'utf8');
      const rel = path.relative(SRC, file);
      const problems: string[] = [];
      if (/animated:\s*true/.test(text)) problems.push(`${rel}: animated: true (use !prefersReducedMotion())`);
      if (/Animated\.loop\(|withRepeat\(/.test(text) && !/useReducedMotion\(\)/.test(text)) problems.push(`${rel}: a looping animation without useReducedMotion()`);
      return problems;
    });
    expect(unchecked).toEqual([]);
  });
});
