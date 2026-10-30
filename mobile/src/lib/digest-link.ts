/**
 * The parent's no-sign-in digest link: /p/digest/<payload>.<signature>.
 *
 * The payload (child, week, expiry) is base64url JSON. The signature is an
 * HMAC the Go API makes and checks when it serves the digest, since the app
 * never holds the signing key. Here the app only reads the payload, refuses
 * expired or malformed links early, and passes the signature along.
 */

export interface DigestClaims {
  child: string;
  week: string;
  /** Expiry, in milliseconds since 1970 (UTC). */
  exp: number;
}

export type DigestLink =
  | { ok: true; child: string; week: string; expires: number; signature: string }
  | { ok: false; reason: 'expired' | 'invalid' };

function toBase64Url(text: string): string {
  return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): string {
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/');
  return atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
}

/** Builds a link token from claims and a signature (used for sample links and tests). */
export function makeDigestToken(claims: DigestClaims, signature: string): string {
  return `${toBase64Url(JSON.stringify(claims))}.${signature}`;
}

function isClaims(v: unknown): v is DigestClaims {
  if (typeof v !== 'object' || v === null) return false;
  const c = v as Record<string, unknown>;
  return typeof c.child === 'string' && c.child !== '' && typeof c.week === 'string' && typeof c.exp === 'number';
}

/** Reads a digest link token: the child and week it's for, or why it can't be opened. */
export function readDigestToken(token: string | undefined, now: number): DigestLink {
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
  return { ok: true, child: claims.child, week: claims.week, expires: claims.exp, signature };
}
