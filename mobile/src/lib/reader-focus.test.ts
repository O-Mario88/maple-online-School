import { readerFocus, setReaderFocus, subscribeReaderFocus } from './reader-focus';

describe('reader focus mode', () => {
  afterEach(() => setReaderFocus(false));

  test('starts off and tells listeners when it changes', () => {
    expect(readerFocus()).toBe(false);
    const heard: boolean[] = [];
    const stop = subscribeReaderFocus(() => heard.push(readerFocus()));
    setReaderFocus(true);
    setReaderFocus(true);
    setReaderFocus(false);
    stop();
    setReaderFocus(true);
    expect(heard).toEqual([true, false]);
  });
});
