/** Each payer's free month and the plans that continue it. Illustrative. */
import type { Tier } from '@/lib/access/trial';
import type { IconName } from '@/lib/icons';

import { photos } from './photos';

export interface PayPlan {
  id: string;
  /** The level a learner plan opens. */
  tier?: Tier;
  name: string;
  /** The name on its Choose button, when it is shorter than the full name. */
  short?: string;
  /** The phone design's wording, when it differs. */
  phoneBlurb?: string;
  /** The desktop design breaks this blurb by hand. */
  deskBlurb?: string;
  /** UGX a month; for a school, per learner. */
  monthly: number;
  blurb: string;
  icon: IconName;
  /** The plan's colour: its icon tile and, for the popular one, its card. */
  tint: string;
  features: readonly string[];
  popular?: boolean;
}

/**
 * Days of the free month already used, so the samples stay in their trial whatever today is.
 * Open a page with ?trial=ended, ?trial=paid or ?trial=active to see the other states.
 */
export const trialDaysUsed = { learner: 18, teacher: 9, school: 24 } as const;

export const plans: Readonly<Record<'learner' | 'teacher' | 'school', readonly PayPlan[]>> = {
  learner: [
    {
      id: 'basic',
      tier: 'basic',
      name: 'Basic',
      monthly: 60000,
      blurb: 'Recorded lessons, past papers and digital library.',
      phoneBlurb: 'Recorded lessons, past papers\nand digital library.',
      deskBlurb: 'Recorded lessons, past\npapers and digital library.',
      icon: 'layers',
      tint: '#1463F3',
      features: ['Recorded lessons (all subjects)', 'Past papers & mark schemes', 'Digital library & study resources', 'Track your learning progress', 'No ads'],
    },
    {
      id: 'pro',
      tier: 'pro',
      name: 'Pro Study Pass',
      monthly: 90000,
      blurb: 'Live classes, assignments and step-by-step past paper solutions.',
      phoneBlurb: 'Live classes, assignments and\nstep-by-step past paper\nsolutions (no video).',
      deskBlurb: 'Live classes, assignments and\nstep-by-step past paper solutions.',
      icon: 'cap',
      tint: '#C98A0B',
      popular: true,
      features: ['Everything in Basic', 'Join live classes (scheduled & revision)', 'Step-by-step past paper solutions', 'Submit assignments & get feedback', 'Exam preparation & study planners'],
    },
    {
      id: 'premium',
      tier: 'premium',
      name: 'Premium + Tutoring',
      short: 'Premium',
      monthly: 150000,
      blurb: 'Everything in Pro, plus a private tutor and video explainers.',
      phoneBlurb: 'Everything in Pro, plus\na private tutor and\nvideo explainers.',
      deskBlurb: 'Everything in Pro, plus\na private tutor and video explainers.',
      icon: 'diamond',
      tint: '#7C3AED',
      features: ['Everything in Pro Study Pass', 'Your own private tutor', 'Step-by-step past paper solutions', 'Question interpretation videos', 'Personalized learning plan'],
    },
  ],
  teacher: [
    {
      id: 'teacher-pro',
      name: 'Teacher Pro',
      monthly: 35000,
      blurb: 'AI subject studio, subject builder, the resource library and live classes.',
      icon: 'cap',
      tint: '#C98A0B',
      popular: true,
      features: ['AI subject studio', 'Subject builder', 'Resource library', 'Schedule and host live classes'],
    },
    {
      id: 'teacher-studio',
      name: 'Studio Plus',
      monthly: 60000,
      blurb: 'Everything in Teacher Pro, plus more AI credits and promoted listings.',
      icon: 'star',
      tint: '#7C3AED',
      features: ['Everything in Teacher Pro', 'More AI subject credits', 'Promoted storefront listings', 'Priority support'],
    },
  ],
  school: [
    {
      id: 'school-standard',
      name: 'School Standard',
      monthly: 3000,
      blurb: 'Per learner: classes, timetable, attendance, report cards and fees.',
      icon: 'layers',
      tint: '#C98A0B',
      popular: true,
      features: ['Classes, rosters and timetable', 'Attendance and registers', 'Report cards', 'Fees and the student ledger'],
    },
    {
      id: 'school-plus',
      name: 'School Plus',
      monthly: 5000,
      blurb: 'Per learner: everything in Standard, plus live classes and the full library.',
      icon: 'star',
      tint: '#7C3AED',
      features: ['Everything in School Standard', 'Live classes for every class', 'The full Maple library', 'Priority support'],
    },
  ],
};

/** The free plan: what opens each month without a paid plan (every paid plan includes it too). It shows ads. */
export const freePlan: PayPlan & { items: readonly { label: string; href: string }[] } = {
  id: 'free',
  name: 'Free',
  monthly: 0,
  blurb: '5 lessons, 1 live class and 10 past papers a month, and every library book. With ads.',
  phoneBlurb: '5 lessons, 1 live class and\n10 past papers a month, every\nlibrary book. With ads.',
  icon: 'gift',
  tint: '#16A34A',
  features: ['5 video lessons a month', '1 live class a month', '10 past papers a month', 'Every book in the Digital Library'],
  items: [
    { label: '5 video lessons a month', href: '/learn/lesson?id=l1' },
    { label: '1 live class a month', href: '/learn/live' },
    { label: '10 past papers a month', href: '/learn/past-papers' },
    { label: 'Every book in the Digital Library', href: '/learn/library' },
  ],
};

/** What a plan brings back, shown with the phone's header. */
export const planBrings: readonly { label: string; icon: IconName }[] = [
  { label: 'Keep your progress', icon: 'chart' },
  { label: 'Access all subjects', icon: 'book' },
  { label: 'Join live classes', icon: 'play' },
];

/** The reassurances under the plans. */
export const promises: readonly { title: string; body: string; icon: IconName }[] = [
  { title: 'Instant Access', body: 'Unlock your plan immediately after payment.', icon: 'bolt' },
  { title: 'Secure Payment', body: 'Your payment is safe and encrypted.', icon: 'shield' },
  { title: 'Cancel Anytime', body: 'No long-term commitment. Manage your plan easily.', icon: 'calendar' },
];


/** The phone design lists them in another order. */
export const promisesPhone = [promises[1], promises[0], promises[2]];
/** The ways to pay, as their logos. */
export const accepts: readonly { name: string; logo: number; width: number }[] = [
  { name: 'MTN Mobile Money', logo: photos.pricingAccepts.mtn, width: 100 },
  { name: 'Airtel Money', logo: photos.pricingAccepts.airtel, width: 88 },
  { name: 'M-PESA', logo: photos.pricingAccepts.mpesa, width: 96 },
  { name: 'Visa', logo: photos.pricingAccepts.visa, width: 69 },
  { name: 'Mastercard', logo: photos.pricingAccepts.mastercard, width: 59 },
  { name: 'Apple Pay', logo: photos.pricingAccepts.applePay, width: 67 },
];

/** The learner menu on the Pricing design: a short list, with everything else under More. */
export const deskNav: readonly { key: string; label: string; icon: IconName; href: string }[] = [
  { key: 'home', label: 'Home', icon: 'home', href: '/' },
  { key: 'explore', label: 'Explore', icon: 'search', href: '/learn/explore' },
  { key: 'courses', label: 'Subjects', icon: 'book', href: '/learn/course' },
  { key: 'live', label: 'Live Classes', icon: 'live', href: '/learn/live' },
  { key: 'assignments', label: 'Assignments', icon: 'clipboard', href: '/learn/assignments' },
  { key: 'library', label: 'Library', icon: 'library', href: '/learn/library' },
  { key: 'more', label: 'More', icon: 'grid', href: '/more' },
];
/** How the sample pays: the first saved method. */
export const payWith = 'MTN Mobile Money · +256 772 123 456';

/** Sample ads for the free tier, from made-up local sponsors. Illustrative. */
export const ads: readonly { id: string; sponsor: string; title: string; body: string; cta: string; icon: IconName; tint: string }[] = [
  { id: 'ad1', sponsor: 'Mwalimu Stationers', title: 'Back-to-school sets from UGX 15,000', body: 'Exercise books, geometry sets and pens. Free delivery in Kampala.', cta: 'Shop now', icon: 'book', tint: '#1463F3' },
  { id: 'ad2', sponsor: 'Nile Book Centre', title: 'UCE and UACE revision guides, 20% off', body: 'Every subject, every board, this week only.', cta: 'See offers', icon: 'library', tint: '#7C3AED' },
  { id: 'ad3', sponsor: 'BrightPath Holiday Camps', title: 'Holiday revision camps', body: 'Two weeks of revision in Mbarara, Gulu and Mbale.', cta: 'Learn more', icon: 'school', tint: '#16A34A' },
  { id: 'ad4', sponsor: 'SunStudy Lamps', title: 'Study after dark', body: 'Solar study lamps from UGX 45,000, charged in a day.', cta: 'Order now', icon: 'bolt', tint: '#C98A0B' },
];
