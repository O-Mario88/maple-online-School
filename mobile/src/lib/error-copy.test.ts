import { errorCopy } from './error-copy';

describe('error copy', () => {
  it('names the page that failed and offers a retry', () => {
    const copy = errorCopy(new Error('Cannot read properties of undefined'), false);
    expect(copy.title).toBe("This page couldn't load");
    expect(copy.body).toBe('Try again, or go back to your home page. Your other pages are still open.');
  });

  it('hides technical details from people using the app', () => {
    expect(errorCopy(new Error('TypeError: x is undefined'), false).detail).toBeNull();
  });

  it('shows the error message to developers', () => {
    expect(errorCopy(new Error('x is undefined'), true).detail).toBe('x is undefined');
  });

  it('copes with a thrown value that is not an Error', () => {
    expect(errorCopy('boom' as unknown as Error, true).detail).toBe('boom');
  });
});
