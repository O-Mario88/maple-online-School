/**
 * Sample data for the learner's Billing & Subscriptions page: study pass plans, the current
 * pass, tutoring credits, payment methods, purchases and the referral offer. Today is 31 Oct 2026.
 */
import type { Cycle } from '@/lib/billing';

import { photos } from './photos';

const b = (n: string): number => photos.billing[n];

export type PlanId = 'basic' | 'pro' | 'premium';
export type MethodKind = 'card' | 'mtn' | 'airtel';

export const billingHub = {
  learner: 'Daniel',
  today: '31 Oct 2026',
  current: { plan: 'pro' as PlanId, cycle: 'monthly' as Cycle, renews: '15 Nov 2026', autoRenew: true },
  plans: [
    {
      id: 'basic' as PlanId,
      name: 'Basic',
      title: 'Maple Basic',
      monthly: 60000,
      blurb: 'Recorded lessons, past papers and digital library.',
      long: 'Recorded lessons, past papers, the digital library and flashcards, with no ads.',
      popular: false,
      icon: b('basic'),
      features: [
        { label: 'Recorded lessons', on: true },
        { label: 'Past papers', on: true },
        { label: 'Digital library', on: true },
        { label: 'No ads', on: true },
        { label: 'Live classes', on: false },
        { label: 'Step-by-step solutions', on: false },
        { label: 'Private tutor', on: false },
      ],
    },
    {
      id: 'pro' as PlanId,
      name: 'Pro Study Pass',
      title: 'Maple Pro Study Pass',
      monthly: 90000,
      blurb: 'Live classes, assignments and step-by-step past paper solutions.',
      long: 'Everything in Basic, plus live classes, assignments and step-by-step past paper solutions (without the video explainer).',
      popular: true,
      icon: b('pro'),
      features: [
        { label: 'All Basic features', on: true },
        { label: 'Live classes', on: true },
        { label: 'Step-by-step solutions', on: true },
        { label: 'Assignments & feedback', on: true },
        { label: 'Video explainers', on: false },
        { label: 'Private tutor', on: false },
        { label: 'Projects & study squads', on: false },
      ],
    },
    {
      id: 'premium' as PlanId,
      name: 'Premium + Tutoring',
      title: 'Maple Premium + Tutoring',
      monthly: 150000,
      blurb: 'Everything in Pro, plus a private tutor and video explainers.',
      long: 'Everything in Pro, plus your own private tutor, question interpretation video explainers, projects and study squads.',
      popular: false,
      icon: b('premium'),
      features: [
        { label: 'All Pro features', on: true },
        { label: 'Private tutor', on: true },
        { label: 'Step-by-step solutions', on: true },
        { label: 'Question video explainers', on: true },
        { label: 'Projects & study squads', on: true },
        { label: 'Personalized study plan', on: true },
      ],
    },
  ],
  /** What the Pro pass includes, as the current plan card lists it. */
  included: ['All core subjects', 'Live classes', 'Past papers', 'Step-by-step solutions', 'Digital library', 'Assignments & feedback', 'No ads', 'Progress analytics'],
  credits: {
    balance: 15,
    usedThisMonth: 10,
    packs: [
      { credits: 5, price: 25000 },
      { credits: 10, price: 45000 },
      { credits: 20, price: 80000 },
    ],
    auto: { on: false, below: 3, add: 10 },
  },
  methods: [
    { id: 'visa', kind: 'card' as MethodKind, label: 'Visa ending 4242', sub: 'Expires 08/2028', logo: b('visa'), primary: true },
    { id: 'mtn', kind: 'mtn' as MethodKind, label: 'MTN Mobile Money', sub: '+256 772 123 456', logo: b('mtn'), primary: false },
    { id: 'airtel', kind: 'airtel' as MethodKind, label: 'Airtel Money', sub: '+256 701 987 654', logo: b('airtel'), primary: false },
  ],
  purchases: [
    { id: 'r-1042', title: 'Pro Study Pass (Monthly)', amount: 90000, date: '15 Oct 2026', method: 'Visa ending 4242', icon: b('buy-pass') },
    { id: 'r-1039', title: '10 Tutoring Credits', amount: 45000, date: '10 Oct 2026', method: 'MTN Mobile Money', icon: b('buy-credits') },
    { id: 'r-1024', title: 'Live Bootcamp – Science', amount: 25000, date: '15 Sep 2026', method: 'Visa ending 4242', icon: b('buy-bootcamp') },
    { id: 'r-1017', title: '5 Tutoring Credits', amount: 25000, date: '2 Sep 2026', method: 'MTN Mobile Money', icon: b('buy-credits-2') },
  ],
  referral: { reward: 10000, code: 'DANIEL-10K' },
  icons: { trophy: b('trophy'), wallet: b('wallet'), bolt: b('bolt'), gift: b('gift'), credits: b('buy-credits'), pass: b('buy-pass') },
};
export type BillingHub = typeof billingHub;
