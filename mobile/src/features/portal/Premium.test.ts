import { tileValue } from './Premium';

describe('premium tile values', () => {
  test('long money figures are shortened so they fit a half-width tile', () => {
    expect(tileValue('UGX 468,750,000')).toBe('UGX 468.8M');
    expect(tileValue('UGX 5,625,000,000')).toBe('UGX 5.63B');
    expect(tileValue('−UGX 6,250,000')).toBe('−UGX 6.3M');
  });

  test('short figures and other values stay as they are', () => {
    expect(tileValue('UGX 50,000')).toBe('UGX 50,000');
    expect(tileValue('4,892')).toBe('4,892');
    expect(tileValue('Compliant')).toBe('Compliant');
  });
});
