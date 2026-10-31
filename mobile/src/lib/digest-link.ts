/**
 * The parent's no-sign-in digest link: /p/digest/<payload>.<signature>.
 * See signed-token.ts for how these links are read and checked.
 */
import { makeSignedToken, readSignedToken } from './signed-token';

export interface DigestClaims {
  child: string;
  week: string;
  /** Expiry, in milliseconds since 1970 (UTC). */
  exp: number;
}

export type DigestLink =
  | { ok: true; child: string; week: string; expires: number; signature: string }
  | { ok: false; reason: 'expired' | 'invalid' };

/** Builds a link token from claims and a signature (used for sample links and tests). */
export function makeDigestToken(claims: DigestClaims, signature: string): string {
  return makeSignedToken(claims, signature);
}

function isClaims(v: unknown): v is DigestClaims {
  if (typeof v !== 'object' || v === null) return false;
  const c = v as Record<string, unknown>;
  return typeof c.child === 'string' && c.child !== '' && typeof c.week === 'string' && typeof c.exp === 'number';
}

/** Reads a digest link token: the child and week it's for, or why it can't be opened. */
export function readDigestToken(token: string | undefined, now: number): DigestLink {
  const read = readSignedToken(token, now, isClaims);
  if (!read.ok) return read;
  return { ok: true, child: read.claims.child, week: read.claims.week, expires: read.claims.exp, signature: read.signature };
}
