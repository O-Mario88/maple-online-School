import { fill, half, phoneSheet, restyle, stacked, wrapped } from './phone-sheet';

describe('restyle', () => {
  test('drops the named keys and adds new ones without changing the original', () => {
    const card = { flex: 1, padding: 8, flexDirection: 'row' as const };
    const out = restyle(card, ['flex'], { flexGrow: 1, flexBasis: '45%' });
    expect(out).toEqual({ padding: 8, flexDirection: 'row', flexGrow: 1, flexBasis: '45%' });
    expect(card.flex).toBe(1);
  });
});

describe('phoneSheet', () => {
  test('scales text up and replaces overridden styles whole', () => {
    const desk = { title: { fontSize: 10, color: 'red' }, page: { width: 1180, padding: 12 } };
    const out = phoneSheet(desk, { page: { padding: 12 } });
    expect(out.title).toEqual({ fontSize: 11.5, color: 'red' });
    expect(out.page).toEqual({ padding: 12 });
  });

  test('widens a fixed-width text style with its text', () => {
    const out = phoneSheet({ time: { width: 28, fontSize: 10 }, box: { width: 28 } }, {});
    expect(out.time).toEqual({ width: 33, fontSize: 11.5 });
    expect(out.box).toEqual({ width: 28 });
  });

  test('grows a fixed-height text box with its text', () => {
    const out = phoneSheet({ input: { height: 30, fontSize: 10 } }, {});
    expect(out.input).toEqual({ height: 35, fontSize: 11.5, paddingVertical: 0 });
  });

  test('keeps large text within the maximum', () => {
    const out = phoneSheet({ h1: { fontSize: 30 } }, {});
    expect(out.h1.fontSize).toBe(24);
  });
});

describe('layout helpers', () => {
  test('stacked turns a row into a column', () => {
    expect(stacked({ flexDirection: 'row', gap: 8, alignItems: 'center' })).toEqual({ gap: 8 });
  });
  test('wrapped lets a row wrap with a row gap', () => {
    expect(wrapped({ flexDirection: 'row', gap: 6 })).toEqual({ flexDirection: 'row', gap: 6, flexWrap: 'wrap', rowGap: 8 });
  });
  test('fill and half drop desktop flex and width', () => {
    expect(fill({ flex: 1, width: 298, padding: 4 })).toEqual({ padding: 4 });
    expect(half({ flex: 1, padding: 4 })).toEqual({ padding: 4, flexGrow: 1, flexBasis: '45%', minWidth: 0 });
  });
});
