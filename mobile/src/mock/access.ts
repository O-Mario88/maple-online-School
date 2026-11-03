/** Each payer's free month and the plans that continue it. Illustrative. */
import { billingHub } from './billing-hub';

export interface PayPlan {
  id: string;
  name: string;
  /** UGX a month; for a school, per learner. */
  monthly: number;
  blurb: string;
  popular?: boolean;
}

/**
 * Days of the free month already used, so the samples stay in their trial whatever today is.
 * Open a page with ?trial=ended, ?trial=paid or ?trial=active to see the other states.
 */
export const trialDaysUsed = { learner: 18, teacher: 9, school: 24 } as const;

export const plans: Readonly<Record<'learner' | 'teacher' | 'school', readonly PayPlan[]>> = {
  learner: billingHub.plans.map((p) => ({ id: p.id, name: p.name, monthly: p.monthly, blurb: p.blurb, popular: p.popular })),
  teacher: [
    { id: 'teacher-pro', name: 'Teacher Pro', monthly: 35000, blurb: 'AI course studio, course builder, the resource library and live classes.', popular: true },
    { id: 'teacher-studio', name: 'Studio Plus', monthly: 60000, blurb: 'Everything in Teacher Pro, plus more AI credits and promoted storefront listings.' },
  ],
  school: [
    { id: 'school-standard', name: 'School Standard', monthly: 3000, blurb: 'Per learner: classes, timetable, attendance, report cards and fees.', popular: true },
    { id: 'school-plus', name: 'School Plus', monthly: 5000, blurb: 'Per learner: everything in Standard, plus live classes and the full library.' },
  ],
};

/** Library books anyone can read, plan or not. */
export const freeBooks: readonly string[] = ['our-uganda', 'life-skills'];

/** How the sample pays: the first saved method. */
export const payWith = 'MTN Mobile Money · +256 772 123 456';
