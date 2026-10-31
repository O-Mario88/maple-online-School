import { makeDigestToken, readDigestToken } from './digest-link';

const NOV_16_END = Date.UTC(2026, 10, 16, 20, 59, 0);

describe('readDigestToken', () => {
  it('reads the child and expiry from a well-formed link', () => {
    const token = makeDigestToken({ child: 'aisha-namutebi', week: '2026-11-02', exp: NOV_16_END }, 'sig123');
    expect(readDigestToken(token, NOV_16_END - 1000)).toEqual({ ok: true, child: 'aisha-namutebi', week: '2026-11-02', expires: NOV_16_END, signature: 'sig123' });
  });

  it('refuses a link after it expires', () => {
    const token = makeDigestToken({ child: 'aisha-namutebi', week: '2026-11-02', exp: NOV_16_END }, 'sig123');
    expect(readDigestToken(token, NOV_16_END + 1)).toEqual({ ok: false, reason: 'expired' });
  });

  it('refuses anything that is not a signed digest link', () => {
    expect(readDigestToken('hello', 0)).toEqual({ ok: false, reason: 'invalid' });
    expect(readDigestToken('bm90LWpzb24.sig', 0)).toEqual({ ok: false, reason: 'invalid' });
    expect(readDigestToken(undefined, 0)).toEqual({ ok: false, reason: 'invalid' });
    const noSig = makeDigestToken({ child: 'a', week: 'w', exp: NOV_16_END }, '');
    expect(readDigestToken(noSig, 0)).toEqual({ ok: false, reason: 'invalid' });
  });
});
