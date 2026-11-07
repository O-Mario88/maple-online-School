import { gridColumns, initials, isNarrowPhone, PAGE_MAX_WIDTH, pageWidth } from './layout';

describe('gridColumns', () => {
  it('fits as many equal columns as the minimum width allows', () => {
    expect(gridColumns(1000, 170, 16, 4)).toBe(4);
    expect(gridColumns(700, 170, 16, 4)).toBe(3);
    expect(gridColumns(360, 170, 16, 4)).toBe(2);
  });

  it('never makes more columns than items, nor fewer than one', () => {
    expect(gridColumns(1000, 170, 16, 2)).toBe(2);
    expect(gridColumns(100, 320, 16, 3)).toBe(1);
    expect(gridColumns(0, 170, 16, 4)).toBe(1);
  });
});

describe('initials', () => {
  it('takes the first and last names', () => {
    expect(initials('Head Teacher Adongo')).toBe('HA');
    expect(initials('amina')).toBe('A');
    expect(initials('   ')).toBe('?');
  });
});

describe('page width', () => {
  test('wide web pages stop at one centred width, with the gutter on each side', () => {
    expect(PAGE_MAX_WIDTH).toBe(1448);
    expect(pageWidth(2000)).toBe(1448);
    expect(pageWidth(1448)).toBe(1448);
    expect(pageWidth(1200)).toBe(1200);
    expect(pageWidth(0)).toBe(0);
  });
});

describe('narrow phones', () => {
  test('a 320px or 350px phone is narrow; a 360px or wider one is not', () => {
    expect(isNarrowPhone(320)).toBe(true);
    expect(isNarrowPhone(359)).toBe(true);
    expect(isNarrowPhone(360)).toBe(false);
    expect(isNarrowPhone(390)).toBe(false);
  });
});
