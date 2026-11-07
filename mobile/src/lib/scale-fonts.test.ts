import { scaleFonts } from './scale-fonts';

describe('scaleFonts', () => {
  const rule = { factor: 1.2, min: 11, max: 22 };

  test('scales font sizes by the factor', () => {
    const out = scaleFonts({ label: { fontSize: 15, fontWeight: '700' as const } }, rule);
    expect(out.label).toEqual({ fontSize: 18, fontWeight: '700' });
  });

  test('keeps small text at the minimum and large text at the maximum', () => {
    const out = scaleFonts({ tiny: { fontSize: 8.5 }, title: { fontSize: 20 } }, rule);
    expect(out.tiny.fontSize).toBe(11);
    expect(out.title.fontSize).toBe(22);
  });

  test('scales line height by the same ratio as its font size', () => {
    const out = scaleFonts({ body: { fontSize: 10, lineHeight: 15 } }, rule);
    expect(out.body).toEqual({ fontSize: 12, lineHeight: 18 });
  });

  test('leaves styles without text untouched and does not change the input', () => {
    const input = { box: { height: 32, padding: 6 }, text: { fontSize: 10 } };
    const out = scaleFonts(input, rule);
    expect(out.box).toBe(input.box);
    expect(input.text.fontSize).toBe(10);
  });
});
