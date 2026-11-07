/**
 * Sample data: Maple's institutional plans as Maple Command would publish them (versioned), the
 * public Institutional Pricing page's copy, and Riverside High School's own subscription.
 * Prices are the proposed introductory test prices, per academic term. Illustrative.
 */
import type { PlanId, PlanVersion } from '@/features/school/subscription/plans';
import type { IconName } from '@/lib/icons';

import { photos } from './photos';

/** The plan versions in force. A school's contract names a version, so changes here never alter a signed contract. */
export const planVersions: readonly PlanVersion[] = [
  { planId: 'launch', version: '2026-11', name: 'Maple Launch', priceUGX: 1_500_000, learners: 300, allowances: { liveSessions: 40, storageGB: 150, streamingGB: 100 }, effective: '2026-11-01' },
  { planId: 'growth', version: '2026-11', name: 'Maple Growth', priceUGX: 3_500_000, learners: 700, allowances: { liveSessions: 100, storageGB: 300, streamingGB: 200 }, effective: '2026-11-01' },
  { planId: 'enterprise', version: '2026-11', name: 'Maple Enterprise', priceUGX: 7_500_000, learners: 1500, allowances: { liveSessions: 250, storageGB: 750, streamingGB: 500 }, effective: '2026-11-01' },
];

export interface PlanCard {
  planId: PlanId;
  icon: IconName;
  tagline: string;
  /** "Everything in Launch, plus:" on the higher plans. */
  lead?: string;
  features: readonly string[];
  cta: string;
  popular: boolean;
}

export const planCards: readonly PlanCard[] = [
  {
    planId: 'launch',
    icon: 'rocket',
    tagline: 'A complete digital school for smaller institutions.',
    features: ['Complete digital school', 'Custom school branding', 'Live classes (starter allowance)', 'School management system', 'Core financial accounting', 'School Network listing', 'Admissions inquiries & applications', 'Standard support'],
    cta: 'Get Launch',
    popular: false,
  },
  {
    planId: 'growth',
    icon: 'chart',
    tagline: 'Everything in Launch, with more capacity and automation.',
    lead: 'Everything in Launch, plus:',
    features: ['Expanded live-class capacity', 'Advanced community & engagement', 'Admissions campaigns & analytics', 'Enhanced accounting automation', 'School performance dashboards', 'Recommendation & conversion insights', 'Priority support'],
    cta: 'Get Growth',
    popular: true,
  },
  {
    planId: 'enterprise',
    icon: 'layers',
    tagline: 'Operate, automate and scale your institution with enterprise intelligence.',
    lead: 'Everything in Growth, plus:',
    features: ['Multi-campus management', 'Maple Auto Accountant (advanced)', 'Advanced analytics & benchmarking', 'Extended customization (incl. domain)', 'Higher infrastructure allowances', 'Dedicated onboarding & SLA support'],
    cta: 'Get Enterprise',
    popular: false,
  },
];

type Cell = boolean | string;
/** The full comparison: every plan is a complete school; higher plans add capacity, automation and analytics. */
export const comparison: readonly { title: string; rows: readonly (readonly [string, Cell, Cell, Cell])[] }[] = [
  { title: 'Digital School & Academic Management', rows: [['Academic years, terms, classes and subjects', true, true, true], ['Admissions and enrolment', true, true, true], ['Attendance and timetables', true, true, true], ['Multi-campus administration', false, false, true]] },
  { title: 'Classrooms and Learning', rows: [['Digital classrooms and courses', true, true, true], ['Recorded video lessons', true, true, true], ['Teacher-owned and school-owned content', true, true, true]] },
  { title: 'Live Classes & Tutoring', rows: [['Live classes', 'Starter', 'Expanded', 'Highest'], ['Live sessions per term', '40', '100', '250'], ['Tutoring scheduling and management', true, true, true]] },
  { title: 'Digital Library & Assessments', rows: [['Digital library and resources', true, true, true], ['Assignments, tests and examinations', true, true, true], ['Competency-based assessment', true, true, true]] },
  { title: 'School Finance & Accounting', rows: [['Fee billing, ledgers, receivables', true, true, true], ['General ledger, trial balance, statements', true, true, true], ['Statement import and manual reconciliation', true, true, true], ['Bank-statement matching suggestions', false, true, true], ['Maple Auto Accountant, period-close assistance', false, false, true]] },
  { title: 'School Community & Parent Engagement', rows: [['Announcements, class discussions, parent notices', true, true, true], ['Subject communities, clubs, moderation queues', false, true, true], ['Organisation-wide community analytics', false, false, true]] },
  { title: 'School Network & Admissions Growth', rows: [['Standard School Network listing', true, true, true], ['Basic profile and admissions analytics', true, true, true], ['Consent-based inquiries', true, true, true], ['Campaigns, funnels and source attribution', false, true, true], ['Multi-campaign attribution and benchmarking', false, false, true]] },
  { title: 'Customization & Infrastructure', rows: [['School name, logo, colours, subdomain', true, true, true], ['Advanced branding controls', false, true, true], ['Custom domain', false, false, true], ['Storage', '150 GB', '300 GB', '750 GB'], ['Video streaming per term', '100 GB', '200 GB', '500 GB']] },
  { title: 'Support, Security & Integrations', rows: [['Support', 'Standard', 'Priority', 'Priority + SLA'], ['Dedicated onboarding', false, false, true], ['Enterprise integrations and exports', false, false, true]] },
];

export const institutionPricing = {
  hero: photos.schoolsHeroPhone,
  campus: photos.schoolNetwork.campus.lakeview,
  eyebrow: 'For Educational Institutions',
  title: 'One Platform. Your Complete Digital School.',
  sub: 'Teach, manage, connect and grow your school with Maple. From classrooms and live lessons to complete financial management and admissions growth—all under your school’s identity.',
  trust: [
    { icon: 'shield' as IconName, label: 'Verified & Secure' },
    { icon: 'layers' as IconName, label: 'Complete School' },
    { icon: 'chart' as IconName, label: 'Grow Enrolment' },
  ],
  advantage: [
    { icon: 'screen' as IconName, title: 'A complete digital school', sub: 'Classrooms, live lessons, library, assessments and more.' },
    { icon: 'people' as IconName, title: 'Be discovered. Grow your school.', sub: 'A verified School Network profile with privacy-safe visibility and conversion tracking.' },
    { icon: 'target' as IconName, title: 'Attract and manage enrolments', sub: 'Publish admissions, receive consent-based inquiries, and track applications to enrolment.' },
    { icon: 'layers' as IconName, title: 'Built for trust and compliance', sub: 'Privacy-first, child-safe, and aligned with education regulations.' },
  ],
  pillars: [
    { icon: 'cap' as IconName, label: 'Teaching & Learning' },
    { icon: 'people' as IconName, label: 'School Management' },
    { icon: 'receipt' as IconName, label: 'Finance & Accounting' },
    { icon: 'person' as IconName, label: 'Parents & Community' },
    { icon: 'building' as IconName, label: 'School Network' },
    { icon: 'chart' as IconName, label: 'Admissions Growth' },
    { icon: 'shield' as IconName, label: 'Security & Compliance' },
  ],
  oneOf: ['One school environment', 'One institutional identity', 'One integrated teaching experience', 'One financial accounting system', 'One parent experience', 'One School Network presence'],
  network: ['Verified school profile', 'School directory exposure', 'School recommendations', 'Privacy-safe engagement tracking', 'Consent-based admissions inquiries', 'Conversion reporting'],
  steps: [
    { title: 'Choose a plan', sub: 'Pick Launch, Growth or Enterprise. Nothing is charged yet.' },
    { title: 'Verify your school', sub: 'Confirm the school and its authorised administrator.' },
    { title: 'Agree terms and billing', sub: 'See the amount payable and how to pay, then accept the contract.' },
    { title: 'Go live', sub: 'Your school activates once approvals and billing are complete.' },
  ],
  faqs: [
    { q: 'Can my school use its own logo and name?', a: 'Yes. Every plan runs under your school’s name, logo and colours, on your own Maple subdomain. Enterprise can also use your own domain.' },
    { q: 'Does Maple support physical and online schools?', a: 'Yes: physical, hybrid and fully online schools use the same platform.' },
    { q: 'Are live classes included in Launch?', a: 'Yes. Every plan includes live classes; Launch has a starter allowance of 40 sessions a term, and higher plans include more.' },
    { q: 'Do I need to move my accounting system?', a: 'No. Every plan includes complete double-entry accounting, and you can import bank statements and records. Bank and Mobile Money connections are optional.' },
    { q: 'Can I import my existing student records?', a: 'Yes. Onboarding includes importing learners, classes and opening balances.' },
    { q: 'What happens when I exceed my learner limit?', a: 'You’re warned at 80%, 90% and 100%. No learner is ever removed or locked out of a lesson; you can add seats or upgrade.' },
    { q: 'Can parents use Maple?', a: 'Yes. Every plan includes the parent portal for progress, attendance, fees and messages.' },
    { q: 'Can I use my own teachers?', a: 'Yes. Your teachers teach your classes with your content; Maple tutors and content are optional extras.' },
    { q: 'Who owns my school’s data?', a: 'Your school does. You can export it, and leaving Maple follows an agreed offboarding and retention policy.' },
    { q: 'Is my school automatically visible in the School Network?', a: 'Once your school is verified, its public profile is complete and you accept the network policies. A plan alone is not accreditation.' },
    { q: 'How do parent inquiries work?', a: 'Families browse privately. You only receive contact details when a parent or learner deliberately asks your school to contact them.' },
    { q: 'Can I upgrade during an academic term?', a: 'Yes. You see the prorated charge for the rest of the term before you confirm; downgrades take effect at renewal.' },
  ],
};

/** Riverside High School's subscription, as its admins see it. */
export const subscription = {
  school: 'Riverside High School',
  contract: { planId: 'growth' as PlanId, version: '2026-11' },
  status: 'Active' as const,
  term: { label: 'Term 3, 2026', start: '2026-09-01', end: '2026-12-10' },
  renewal: '2026-12-10',
  /** Licensed learners now, and the records that don't use a licence. */
  learners: { licensed: 486, archived: 17, duplicates: 9, teachers: 42, parents: 610 },
  usage: { liveSessions: 42, storageGB: 128, streamingGB: 96 },
  invoices: [
    { id: 'INV-00312', period: 'Term 3, 2026', amountUGX: 3_500_000, status: 'Paid' as const, issued: '2026-08-25' },
    { id: 'INV-00284', period: 'Term 2, 2026', amountUGX: 3_500_000, status: 'Paid' as const, issued: '2026-04-28' },
    { id: 'INV-00197', period: 'Term 1, 2026', amountUGX: 3_500_000, status: 'Paid' as const, issued: '2026-01-26' },
  ],
  upcoming: { period: 'Term 1, 2027', amountUGX: 3_500_000, due: '2026-12-10' },
  billing: { contact: 'Mr. James Kato', email: 'accounts@riverside.example', cycle: 'Termly', method: 'Bank transfer', tin: '1000-2345-67' },
};
