import { mockEnabled } from './mock';

describe('mockEnabled', () => {
  it('is on only when the build sets EXPO_PUBLIC_MOCK_DATA to "true"', () => {
    expect(mockEnabled('true')).toBe(true);
    expect(mockEnabled(undefined)).toBe(false);
    expect(mockEnabled('')).toBe(false);
    expect(mockEnabled('false')).toBe(false);
    expect(mockEnabled('1')).toBe(false);
  });
});
