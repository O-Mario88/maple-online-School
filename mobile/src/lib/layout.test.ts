import { gridColumns, initials } from './layout';

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
