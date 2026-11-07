import { createMotionStore, type MotionSource } from './motion';

/** A stand-in for AccessibilityInfo whose setting the test can flip. */
function fakeSource(initially: boolean | Error) {
  let listener: ((on: boolean) => void) | null = null;
  const source: MotionSource = {
    isReduceMotionEnabled: () => (initially instanceof Error ? Promise.reject(initially) : Promise.resolve(initially)),
    addEventListener: (_event, fn) => {
      listener = fn;
      return { remove: () => (listener = null) };
    },
  };
  return { source, flip: (on: boolean) => listener?.(on) };
}

const settle = () => new Promise((resolve) => setImmediate(resolve));

describe('reduced motion', () => {
  test('allows motion until the device says otherwise', () => {
    const { source } = fakeSource(true);
    expect(createMotionStore(source).get()).toBe(false);
  });

  test('picks up the device setting once it is read', async () => {
    const { source } = fakeSource(true);
    const store = createMotionStore(source);
    store.get();
    await settle();
    expect(store.get()).toBe(true);
  });

  test('tells subscribers when the setting changes, and stops after they leave', async () => {
    const { source, flip } = fakeSource(false);
    const store = createMotionStore(source);
    const seen: boolean[] = [];
    const leave = store.subscribe(() => seen.push(store.get()));
    await settle();
    flip(true);
    flip(false);
    leave();
    flip(true);
    expect(seen).toEqual([true, false]);
  });

  test('keeps motion on when the device cannot report the setting', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { source } = fakeSource(new Error('not supported'));
    const store = createMotionStore(source);
    store.get();
    await settle();
    expect(store.get()).toBe(false);
    expect(warn).toHaveBeenCalledWith('Could not read the reduce-motion setting', expect.any(Error));
    warn.mockRestore();
  });

  test('reads the device once, however many places ask', () => {
    const { source } = fakeSource(false);
    const read = jest.spyOn(source, 'isReduceMotionEnabled');
    const store = createMotionStore(source);
    store.get();
    store.subscribe(() => undefined);
    store.get();
    expect(read).toHaveBeenCalledTimes(1);
  });
});
