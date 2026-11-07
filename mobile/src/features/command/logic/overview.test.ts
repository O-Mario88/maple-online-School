import { carouselPage, conversionRate, retentionShade, shortUgx } from './overview';

describe('conversionRate', () => {
  test('is completed signups over started signups, to one decimal', () => {
    expect(conversionRate(65420, 28032)).toBe('42.8%');
  });

  test('is 0% when nobody started', () => {
    expect(conversionRate(0, 0)).toBe('0.0%');
  });
});

describe('retentionShade', () => {
  test('shades strong retention green and weak retention orange', () => {
    expect(retentionShade(80).level).toBe('strong');
    expect(retentionShade(63).level).toBe('fair');
    expect(retentionShade(45).level).toBe('weak');
  });

  test('a cohort too young to measure has no shade', () => {
    expect(retentionShade(null).level).toBe('none');
  });
});

describe('carouselPage', () => {
  test('shows the cards for the page and wraps back to the start', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    expect(carouselPage(items, 0, 3)).toEqual(['a', 'b', 'c']);
    expect(carouselPage(items, 1, 3)).toEqual(['d', 'e']);
    expect(carouselPage(items, 2, 3)).toEqual(['a', 'b', 'c']);
  });
});

describe('shortUgx', () => {
  test('prints large shilling amounts the way the references do', () => {
    expect(shortUgx(185600000)).toBe('UGX 185.6M');
    expect(shortUgx(2480000000)).toBe('UGX 2.48B');
    expect(shortUgx(950000)).toBe('UGX 950K');
  });
});
