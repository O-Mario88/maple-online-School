import { addTimestamp, formatTimestamp, moveItem, parseTimestamp } from './course-builder';

describe('parseTimestamp', () => {
  test('reads minutes and seconds', () => {
    expect(parseTimestamp('05:10')).toBe(310);
    expect(parseTimestamp('0:45')).toBe(45);
    expect(parseTimestamp(' 12:35 ')).toBe(755);
  });

  test('rejects text that is not mm:ss', () => {
    expect(parseTimestamp('')).toBeNull();
    expect(parseTimestamp('5')).toBeNull();
    expect(parseTimestamp('05:75')).toBeNull();
    expect(parseTimestamp('ab:cd')).toBeNull();
  });
});

describe('formatTimestamp', () => {
  test('pads minutes and seconds to two digits', () => {
    expect(formatTimestamp(310)).toBe('05:10');
    expect(formatTimestamp(0)).toBe('00:00');
    expect(formatTimestamp(755)).toBe('12:35');
  });
});

describe('addTimestamp', () => {
  const list = [
    { at: 0, label: 'Introduction' },
    { at: 310, label: 'Worked example 1' },
  ];

  test('inserts in time order without changing the original list', () => {
    const next = addTimestamp(list, { at: 145, label: 'Understanding place value' });
    expect(next.map((t) => t.at)).toEqual([0, 145, 310]);
    expect(list).toHaveLength(2);
  });

  test('replaces the label when the time is already marked', () => {
    const next = addTimestamp(list, { at: 310, label: 'Worked example' });
    expect(next).toEqual([
      { at: 0, label: 'Introduction' },
      { at: 310, label: 'Worked example' },
    ]);
  });
});

describe('moveItem', () => {
  test('moves an item to a new position in a new array', () => {
    const list = ['a', 'b', 'c'];
    expect(moveItem(list, 0, 2)).toEqual(['b', 'c', 'a']);
    expect(moveItem(list, 2, 0)).toEqual(['c', 'a', 'b']);
    expect(list).toEqual(['a', 'b', 'c']);
  });

  test('leaves the order alone when a position is out of range', () => {
    expect(moveItem(['a', 'b'], 0, 5)).toEqual(['a', 'b']);
    expect(moveItem(['a', 'b'], -1, 0)).toEqual(['a', 'b']);
  });
});
