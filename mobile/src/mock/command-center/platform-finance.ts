/**
 * Maple Command › Platform Finance sample data: the finance director and one module per page.
 * All figures are illustrative.
 */
import { face } from './shared';

export const me = { name: 'Mr. Denis Okello', role: 'Finance Director', avatar: face.okello, notifications: 12 };

export * as subscriptions from './pf-subscriptions';
export * as payments from './pf-payments';
export * as revenue from './pf-revenue';
export * as commercial from './pf-commercial';
export * as corporate from './pf-corporate';
export * as ledger from './pf-ledger';
export * as planning from './pf-planning';
export * as ops from './pf-ops';
