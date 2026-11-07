import { applyUiScale, UI_SCALE_VAR } from './ui-scale';

function fakeNode() {
  const props = new Map<string, string>();
  return { node: { style: { setProperty: (k: string, v: string) => props.set(k, v) } }, props };
}

describe('the scale a scaled frame tells the click-area rule (global.css)', () => {
  test('a frame drawn at 0.9375 says so, so 24px click areas stay 24px on screen', () => {
    const { node, props } = fakeNode();
    applyUiScale(node, 0.9375);
    expect(props.get(UI_SCALE_VAR)).toBe('0.9375');
  });

  test('nothing to set before the frame is on screen, or for a nonsense scale', () => {
    expect(() => applyUiScale(null, 0.5)).not.toThrow();
    const { node, props } = fakeNode();
    applyUiScale(node, 0);
    applyUiScale(node, Number.NaN);
    expect(props.size).toBe(0);
  });

  test('a ref that is not a DOM node (no style to set) is left alone', () => {
    expect(() => applyUiScale({} as never, 0.5)).not.toThrow();
  });
});
