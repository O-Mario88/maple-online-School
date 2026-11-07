/** Helpers behind the host whiteboard's ink layer (kept here so Jest can test them). */

export interface Point {
  x: number;
  y: number;
}

/** An SVG path through the points; a single tap becomes a tiny dash so it still shows. */
export function strokePath(points: readonly Point[]): string {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  const tail = rest.length ? rest : [{ x: first.x + 0.1, y: first.y }];
  return `M${first.x} ${first.y} ${tail.map((p) => `L${p.x} ${p.y}`).join(' ')}`;
}

export interface BoardBox {
  /** Where the board's top-left corner is on the page. */
  left: number;
  top: number;
  /** Screen size ÷ layout size: below 1 when the page is drawn scaled down. */
  scale: number;
}

/** A touch on the page, as a point in the board's own (unscaled) coordinates. */
export function toBoardPoint(touch: { pageX: number; pageY: number }, box: BoardBox): Point {
  const scale = box.scale || 1;
  return { x: (touch.pageX - box.left) / scale, y: (touch.pageY - box.top) / scale };
}

export interface InkState<T> {
  items: readonly T[];
  /** Items taken off by undo, newest last, ready for redo. */
  undone: readonly T[];
}

export type InkAction<T> = { type: 'add'; item: T } | { type: 'update'; item: T } | { type: 'undo' } | { type: 'redo' };

/** Drawing history: add a mark, grow the newest one, undo and redo. */
export function inkReducer<T>(state: InkState<T>, action: InkAction<T>): InkState<T> {
  switch (action.type) {
    case 'add':
      return { items: [...state.items, action.item], undone: [] };
    case 'update':
      return state.items.length ? { ...state, items: [...state.items.slice(0, -1), action.item] } : state;
    case 'undo': {
      const last = state.items[state.items.length - 1];
      return last === undefined ? state : { items: state.items.slice(0, -1), undone: [...state.undone, last] };
    }
    case 'redo': {
      const next = state.undone[state.undone.length - 1];
      return next === undefined ? state : { items: [...state.items, next], undone: state.undone.slice(0, -1) };
    }
  }
}
