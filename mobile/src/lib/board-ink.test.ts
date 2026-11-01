import { inkReducer, type InkState, strokePath, toBoardPoint } from './board-ink';

describe('strokePath', () => {
  test('moves to the first point and draws lines through the rest', () => {
    expect(strokePath([{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5.5, y: 6 }])).toBe('M1 2 L3 4 L5.5 6');
  });

  test('draws a dot for a single tap', () => {
    expect(strokePath([{ x: 10, y: 10 }])).toBe('M10 10 L10.1 10');
  });

  test('is empty with no points', () => {
    expect(strokePath([])).toBe('');
  });
});

describe('toBoardPoint', () => {
  test('undoes the page scale and the board offset', () => {
    // The board sits at (100, 50) on screen and is drawn at half size.
    expect(toBoardPoint({ pageX: 150, pageY: 75 }, { left: 100, top: 50, scale: 0.5 })).toEqual({ x: 100, y: 50 });
  });

  test('leaves an unscaled board as it is', () => {
    expect(toBoardPoint({ pageX: 30, pageY: 40 }, { left: 10, top: 20, scale: 1 })).toEqual({ x: 20, y: 20 });
  });
});

describe('inkReducer', () => {
  const empty: InkState<string> = { items: [], undone: [] };

  test('adding clears the redo list', () => {
    const state = inkReducer({ items: ['a'], undone: ['b'] }, { type: 'add', item: 'c' });
    expect(state).toEqual({ items: ['a', 'c'], undone: [] });
  });

  test('undo and redo move the newest item back and forth', () => {
    const drawn = inkReducer(inkReducer(empty, { type: 'add', item: 'a' }), { type: 'add', item: 'b' });
    const undone = inkReducer(drawn, { type: 'undo' });
    expect(undone).toEqual({ items: ['a'], undone: ['b'] });
    expect(inkReducer(undone, { type: 'redo' })).toEqual(drawn);
  });

  test('undo and redo do nothing when there is nothing to move', () => {
    expect(inkReducer(empty, { type: 'undo' })).toBe(empty);
    expect(inkReducer(empty, { type: 'redo' })).toBe(empty);
  });

  test('update replaces the newest item', () => {
    expect(inkReducer({ items: ['a', 'b'], undone: [] }, { type: 'update', item: 'B' })).toEqual({ items: ['a', 'B'], undone: [] });
  });
});
