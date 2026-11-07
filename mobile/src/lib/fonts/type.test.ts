import { INTER, textStyle, typeWeight } from './type';

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
