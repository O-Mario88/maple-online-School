/**
 * The no-sign-in payment link /pay/<invoice token>, and checking a mobile
 * money number against the network the payer chose.
 */
import { makeSignedToken, readSignedToken } from './signed-token';

export interface PayClaims {
  invoice: string;
  exp: number;
}

export type PayLink = { ok: true; invoice: string; expires: number; signature: string } | { ok: false; reason: 'expired' | 'invalid' };

export function makePayToken(claims: PayClaims, signature: string): string {
  return makeSignedToken(claims, signature);
}

function isClaims(v: unknown): v is PayClaims {
  if (typeof v !== 'object' || v === null) return false;
  const c = v as Record<string, unknown>;
  return typeof c.invoice === 'string' && c.invoice !== '' && typeof c.exp === 'number';
}

/** Reads an invoice payment link: which invoice, or why it can't be opened. */
export function readPayToken(token: string | undefined, now: number): PayLink {
  const read = readSignedToken(token, now, isClaims);
  if (!read.ok) return read;
  return { ok: true, invoice: read.claims.invoice, expires: read.claims.exp, signature: read.signature };
}

export type MobileNetwork = 'mtn' | 'airtel' | 'mpesa';

interface Network {
  name: string;
  country: string;
  /** Local prefixes after the leading 0, e.g. 77 for 077…. */
  prefixes: readonly string[];
}

const NETWORKS: Readonly<Record<MobileNetwork, Network>> = {
  mtn: { name: 'MTN', country: '256', prefixes: ['76', '77', '78', '39'] },
  airtel: { name: 'Airtel', country: '256', prefixes: ['70', '74', '75', '20'] },
  mpesa: { name: 'M-Pesa', country: '254', prefixes: ['70', '71', '72', '74', '79', '11'] },
};

const LOCAL_DIGITS = 9;

export type NumberCheck = { ok: true; international: string } | { ok: false; message: string };

/** Checks a phone number for the chosen network; returns it as +256… / +254…, or a plain-language reason. */
export function checkMobileNumber(network: MobileNetwork, input: string): NumberCheck {
  const net = NETWORKS[network];
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith(net.country)) digits = digits.slice(net.country.length);
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length !== LOCAL_DIGITS) return { ok: false, message: `Enter the full 10-digit number, for example ${network === 'mpesa' ? '0712 345 678' : network === 'airtel' ? '0701 234 567' : '0772 123 456'}.` };
  const prefix = digits.slice(0, 2);
  if (!net.prefixes.includes(prefix)) {
    const other = (Object.keys(NETWORKS) as MobileNetwork[]).find((k) => k !== network && NETWORKS[k].country === net.country && NETWORKS[k].prefixes.includes(prefix));
    const otherName = other === 'airtel' ? 'Airtel Money' : other === 'mtn' ? 'MTN MoMo' : null;
    return {
      ok: false,
      message: other && otherName ? `That looks like an ${NETWORKS[other].name} number. Choose ${otherName}, or enter an ${net.name} number.` : `That isn't an ${net.name} number. Check it and try again.`,
    };
  }
  return { ok: true, international: `+${net.country}${digits}` };
}
