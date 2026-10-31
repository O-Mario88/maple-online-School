import { checkMobileNumber, makePayToken, readPayToken } from './pay-link';

const EXP = Date.UTC(2026, 10, 16, 20, 59, 0);

describe('readPayToken', () => {
  it('reads the invoice and expiry from a signed link', () => {
    const t = makePayToken({ invoice: 'INV-2026-000458', exp: EXP }, 'sig');
    expect(readPayToken(t, EXP - 1)).toEqual({ ok: true, invoice: 'INV-2026-000458', expires: EXP, signature: 'sig' });
  });

  it('refuses expired, unsigned and garbled links', () => {
    expect(readPayToken(makePayToken({ invoice: 'INV-1', exp: EXP }, 'sig'), EXP + 1)).toEqual({ ok: false, reason: 'expired' });
    expect(readPayToken(makePayToken({ invoice: 'INV-1', exp: EXP }, ''), 0)).toEqual({ ok: false, reason: 'invalid' });
    expect(readPayToken('garbage', 0)).toEqual({ ok: false, reason: 'invalid' });
  });
});

describe('checkMobileNumber', () => {
  it('accepts numbers on the chosen network and returns them in international form', () => {
    expect(checkMobileNumber('mtn', '0772 123 456')).toEqual({ ok: true, international: '+256772123456' });
    expect(checkMobileNumber('airtel', '+256 701 234 567')).toEqual({ ok: true, international: '+256701234567' });
    expect(checkMobileNumber('mpesa', '0712345678')).toEqual({ ok: true, international: '+254712345678' });
  });

  it('explains when the number belongs to another network or is too short', () => {
    expect(checkMobileNumber('mtn', '0701234567')).toEqual({ ok: false, message: 'That looks like an Airtel number. Choose Airtel Money, or enter an MTN number.' });
    expect(checkMobileNumber('mtn', '0772')).toEqual({ ok: false, message: 'Enter the full 10-digit number, for example 0772 123 456.' });
  });
});
