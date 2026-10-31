import { currentToast, subscribeToast, toast, TOAST_MS } from './toast';

describe('toast', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('tells listeners about a new message, then clears it', () => {
    const seen: (string | null)[] = [];
    const stop = subscribeToast(() => seen.push(currentToast()));
    toast('Saved');
    expect(currentToast()).toBe('Saved');
    jest.advanceTimersByTime(TOAST_MS);
    expect(currentToast()).toBeNull();
    expect(seen).toEqual(['Saved', null]);
    stop();
  });

  it('keeps a newer message showing when an older one times out', () => {
    toast('First');
    jest.advanceTimersByTime(TOAST_MS - 100);
    toast('Second');
    jest.advanceTimersByTime(200);
    expect(currentToast()).toBe('Second');
    jest.advanceTimersByTime(TOAST_MS);
    expect(currentToast()).toBeNull();
  });
});
