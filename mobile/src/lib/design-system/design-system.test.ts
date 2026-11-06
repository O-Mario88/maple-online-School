/// <reference types="node" />
import fs from 'fs';
import path from 'path';

import { Maple } from '@/constants/maple';

import { contrast, isAccentBlue, isPurple } from './color';

const SRC = path.resolve(__dirname, '../..');
/** Token files are where colours are allowed to be written as hex. */
const TOKEN_FILES = new Set(['constants/maple.ts', 'constants/theme.ts', 'lib/design-system/color.ts']);

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
});
