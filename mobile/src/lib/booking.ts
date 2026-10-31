/** Teacher storefront rules: the @handle in the address, and what a booking costs the teacher. */

/** Maple's share of a booking made through the marketplace. */
export const MARKETPLACE_COMMISSION = 0.15;

/** The ?ref= value a teacher's own link carries; bookings through it are commission-free (bring your own students). */
export const DIRECT_REF = 'direct';

export interface BookingQuote {
  priceUGX: number;
  commissionRate: number;
  teacherGetsUGX: number;
  direct: boolean;
}

/** What the learner pays and the teacher keeps, given how the learner arrived. */
export function bookingQuote(priceUGX: number, ref: string | undefined): BookingQuote {
  const direct = ref === DIRECT_REF;
  const commissionRate = direct ? 0 : MARKETPLACE_COMMISSION;
  return { priceUGX, commissionRate, teacherGetsUGX: priceUGX - Math.round(priceUGX * commissionRate), direct };
}

const HANDLE = /^@([a-z0-9][a-z0-9-]{1,38})$/i;

/** "@sarah-kimani" → "sarah-kimani"; anything that isn't an @handle → null. */
export function parseHandle(segment: string | undefined): string | null {
  const match = segment ? HANDLE.exec(segment) : null;
  return match ? match[1].toLowerCase() : null;
}
