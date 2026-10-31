import { parseMark } from './marks';

describe('parseMark', () => {
  it.each([
    ['17', 20, 17],
    [' 17.5 ', 20, 17.5],
    ['0', 80, 0],
    ['80', 80, 80],
  ])('accepts %s out of %i', (text, max, want) => {
    expect(parseMark(text, max)).toBe(want);
  });

  it.each([
    ['', 20],
    ['21', 20],
    ['-1', 80],
    ['abc', 80],
  ])('rejects %s out of %i', (text, max) => {
    expect(parseMark(text, max)).toBeNull();
  });
});
