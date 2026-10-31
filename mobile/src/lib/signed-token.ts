/**
 * No-sign-in links (the Sunday digest, invoice payment) carry a token:
 * <base64url JSON claims>.<signature>. The Go API signs and checks the
 * signature; the app reads the claims, refuses expired or garbled links
 * early, and passes the signature along.
 */

export type SignedRead<T> = { ok: true; claims: T; signature: string } | { ok: false; reason: 'expired' | 'invalid' };

function toBase64Url(text: string): string {
  return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): string {
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/');
  return atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
}

/** Builds a token from claims and a signature (for sample links and tests). */
export function makeSignedToken(claims: object, signature: string): string {
  return `${toBase64Url(JSON.stringify(claims))}.${signature}`;
}

/** Reads a token's claims if it's well formed, signed and not past its `exp` (ms since 1970, UTC). */
export function readSignedToken<T extends { exp: number }>(token: string | undefined, now: number, isClaims: (v: unknown) => v is T): SignedRead<T> {
  const [payload, signature, extra] = (token ?? '').split('.');
  if (!payload || !signature || extra !== undefined) return { ok: false, reason: 'invalid' };
  let claims: unknown;
  try {
    claims = JSON.parse(fromBase64Url(payload));
  } catch {
    return { ok: false, reason: 'invalid' };
  }
  if (!isClaims(claims)) return { ok: false, reason: 'invalid' };
  if (now > claims.exp) return { ok: false, reason: 'expired' };
  return { ok: true, claims, signature };
}
