import { fitProps, fitScale, headingLevel, INTER, isFigure, PAGE_TITLE, textStyle, typeWeight } from './type';

describe('the standard weights: 400 body, 500 labels, 600 subheadings, 700 headings', () => {
  test('headings (24px and up, set semibold or heavier) are 700', () => {
    expect(typeWeight('800', 34)).toBe('700');
    expect(typeWeight('900', 28)).toBe('700');
    expect(typeWeight('600', 24)).toBe('700');
    expect(typeWeight('bold', 30)).toBe('700');
  });

  test('subheadings (16 to 23px, set semibold or heavier) are 600', () => {
    expect(typeWeight('800', 18)).toBe('600');
    expect(typeWeight('700', 16)).toBe('600');
    expect(typeWeight('600', 23.5)).toBe('600');
  });

  test('labels and buttons (under 16px, set medium or heavier) are 500', () => {
    expect(typeWeight('700', 13)).toBe('500');
    expect(typeWeight('800', 12)).toBe('500');
    expect(typeWeight('600', 14.5)).toBe('500');
    expect(typeWeight('900', undefined)).toBe('500');
  });

  test('body text (light, regular, or no weight set) is 400', () => {
    expect(typeWeight('300', 15)).toBe('400');
    expect(typeWeight('normal', 30)).toBe('400');
    expect(typeWeight(undefined, 14)).toBe('400');
  });

  test('medium text at 16px and up stays medium', () => {
    expect(typeWeight('500', 18)).toBeUndefined();
    expect(typeWeight('500', 30)).toBeUndefined();
  });
});

describe('the default font', () => {
  test('text starts in Inter, as body text', () => {
    expect(textStyle({ fontSize: 14 }, false)).toEqual({ base: { fontFamily: INTER }, after: { fontWeight: '400' } });
  });

  test('a page that sets its own font keeps it', () => {
    expect(textStyle({ fontFamily: 'Georgia', fontSize: 14 }, false).base).toBeNull();
  });

  test('text inside other text inherits its font and weight instead of resetting them', () => {
    expect(textStyle({ fontSize: 14 }, true)).toEqual({ base: null, after: null });
  });

  test('a word set bold inside a sentence is 600, so it still stands out against 400 body text', () => {
    expect(textStyle({ fontWeight: '800', fontSize: 12 }, true)).toEqual({ base: null, after: { fontWeight: '600' } });
    expect(textStyle({ fontWeight: '700' }, true).after).toEqual({ fontWeight: '600' });
  });

  test('the heading weights apply on top of the page style', () => {
    expect(textStyle({ fontSize: 34, fontWeight: '800' }, false)).toEqual({ base: { fontFamily: INTER }, after: { fontWeight: '700' } });
  });
});

describe('shrinking one line of text to fit (the web side of adjustsFontSizeToFit)', () => {
  test('text that fits keeps its size', () => {
    expect(fitScale(120, 100, 0.85)).toBe(1);
    expect(fitScale(100, 100, 0.85)).toBe(1);
  });

  test('text a little too wide shrinks just enough to fit', () => {
    expect(fitScale(60, 63, 0.85)).toBeCloseTo(60 / 63, 3);
  });

  test('never shrinks below the smallest scale the text allows', () => {
    expect(fitScale(20, 78, 0.85)).toBe(0.85);
    expect(fitScale(20, 78, undefined)).toBe(0.5);
  });

  test('a box with no width yet leaves the size alone', () => {
    expect(fitScale(0, 80, 0.85)).toBe(1);
    expect(fitScale(80, 0, 0.85)).toBe(1);
  });
});

describe('figures shrink instead of being cut off', () => {
  test('amounts, counts and percentages are figures', () => {
    for (const s of ['UGX 420K', 'UGX 185.6M', '1,200,000', '92%', '4.8', '$1,250.00', '+12.5%', '3 / 5', 'KES 9,000']) expect(isFigure(s)).toBe(true);
  });

  test('words, names and mixed sentences are not', () => {
    for (const s of ['Dashboard', 'Paid', 'O-Level Mathematics', 'Oct 10, 2026', 'Students needing support', '', 'S3 East']) expect(isFigure(s)).toBe(false);
  });

  test('a one-line figure fits itself unless the screen chose otherwise', () => {
    expect(fitProps({ numberOfLines: 1, children: 'UGX 185.6M' })).toEqual({ adjustsFontSizeToFit: true, minimumFontScale: 0.6 });
    expect(fitProps({ numberOfLines: 1, children: ['1,200', ',000'] })).toEqual({ adjustsFontSizeToFit: true, minimumFontScale: 0.6 });
    expect(fitProps({ numberOfLines: 1, children: 'UGX 185.6M', adjustsFontSizeToFit: false })).toEqual({});
    expect(fitProps({ numberOfLines: 2, children: 'UGX 185.6M' })).toEqual({});
    expect(fitProps({ numberOfLines: 1, children: 'Dashboard' })).toEqual({});
  });
});

describe('heading levels', () => {
  test('a header with no level is a section heading (level 2); the page title asks for level 1', () => {
    expect(headingLevel({ accessibilityRole: 'header' })).toBe(2);
    expect(headingLevel({ role: 'heading' })).toBe(2);
    expect(headingLevel({ accessibilityRole: 'header', 'aria-level': 1 })).toBe(1);
    expect(headingLevel({ ...PAGE_TITLE })).toBe(1);
  });

  test('text that is not a heading gets no level', () => {
    expect(headingLevel({})).toBeUndefined();
    expect(headingLevel({ accessibilityRole: 'button' })).toBeUndefined();
  });
});
