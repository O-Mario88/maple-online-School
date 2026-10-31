/**
 * Sample copy for the public information pages the top bar and footers link to:
 * Pricing, Curriculums, For Teachers, About, Terms of Service and Privacy Policy.
 * Pricing reads the same study pass plans as the learner's Billing page.
 */
import type { IconName } from '@/lib/icons';

import { billingHub } from './billing-hub';

export type InfoCard = { icon: IconName; title: string; body: string; href?: string; link?: string };
export type InfoBlock =
  | { kind: 'cards'; title: string; sub?: string; cards: readonly InfoCard[] }
  | { kind: 'plans'; title: string; sub: string }
  | { kind: 'steps'; title: string; steps: readonly { title: string; body: string }[] }
  | { kind: 'stats'; stats: readonly { value: string; label: string }[] }
  | { kind: 'faq'; title: string; items: readonly { q: string; a: string }[] }
  | { kind: 'legal'; updated: string; sections: readonly { title: string; body: string }[] };
export type InfoLink = { label: string; href: string };
export type InfoPageData = {
  /** The top bar link to light up; legal pages light none. */
  nav?: 'Pricing' | 'Curriculums' | 'For Teachers' | 'About';
  icon: IconName;
  eyebrow: string;
  title: string;
  sub: string;
  cta?: InfoLink;
  second?: InfoLink;
  blocks: readonly InfoBlock[];
};

const pricing: InfoPageData = {
  nav: 'Pricing',
  icon: 'wallet',
  eyebrow: 'Pricing',
  title: 'Simple study passes for every learner',
  sub: 'Start free with sample lessons, then pick a pass. Pay by MTN MoMo, Airtel Money, M-Pesa or card, and save when you pay for a term or a year.',
  cta: { label: 'Start Free', href: '/sign-up' },
  second: { label: 'Browse courses', href: '/explore' },
  blocks: [
    { kind: 'plans', title: 'Study passes', sub: 'Every pass includes the full catalogue for your curriculum. Cancel any time.' },
    {
      kind: 'cards',
      title: 'Also on Maple',
      cards: [
        { icon: 'school', title: 'For schools', body: 'Per-learner pricing for whole classes, with timetables, rosters and fee collection.', href: '/schools', link: 'See school plans' },
        { icon: 'people', title: 'Family discount', body: 'A second child on the same family account gets 15% off any study pass.' },
        { icon: 'live', title: 'Pay-as-you-go tutoring', body: 'Tutoring credits from UGX 25,000. One credit buys 15 minutes with a verified teacher.' },
      ],
    },
    {
      kind: 'faq',
      title: 'Questions about paying',
      items: [
        { q: 'Can I try before I pay?', a: 'Yes. Every course has free sample lessons and one free past paper question a day, with no card needed.' },
        { q: 'How do I pay with mobile money?', a: 'Choose MTN MoMo or Airtel Money at checkout and approve the prompt on your phone. Your receipt arrives straight away.' },
        { q: 'Can I switch passes?', a: 'Upgrade at any time and only pay the difference. Downgrades start at your next renewal.' },
      ],
    },
  ],
};

const curriculums: InfoPageData = {
  nav: 'Curriculums',
  icon: 'map',
  eyebrow: 'Curriculums',
  title: 'Lessons mapped to the curriculum you sit',
  sub: 'Every lesson, quiz and past paper on Maple is tagged to its exam board, so learners study exactly what they will be tested on.',
  cta: { label: 'Find your course', href: '/explore' },
  blocks: [
    {
      kind: 'cards',
      title: 'Boards we teach',
      cards: [
        { icon: 'map', title: 'UNEB (Uganda)', body: 'PLE, UCE and UACE, including the new lower secondary competency-based curriculum.', href: '/explore?q=UNEB', link: 'UNEB courses' },
        { icon: 'map', title: 'KCSE and CBC (Kenya)', body: 'Form 1 to Form 4 for KCSE, and junior school learning areas for CBC.', href: '/explore?q=KCSE', link: 'KCSE courses' },
        { icon: 'map', title: 'WAEC (West Africa)', body: 'WASSCE revision for SS1 to SS3 with past papers and marking schemes.', href: '/explore?q=WAEC', link: 'WAEC courses' },
        { icon: 'globe', title: 'Cambridge IGCSE and A Level', body: 'International syllabuses taught by examiners, with practical support for sciences.', href: '/explore?q=Cambridge', link: 'Cambridge courses' },
      ],
    },
    {
      kind: 'steps',
      title: 'How we keep lessons aligned',
      steps: [
        { title: 'Mapped topic by topic', body: 'Each lesson is linked to a syllabus outcome, so progress shows real coverage of the syllabus.' },
        { title: 'Checked every year', body: 'Teachers review lessons when a board updates its syllabus or publishes a new paper.' },
        { title: 'Practised the exam way', body: 'Quizzes use the question styles and marking of the real exam.' },
      ],
    },
  ],
};

const teachers: InfoPageData = {
  nav: 'For Teachers',
  icon: 'cap',
  eyebrow: 'For teachers',
  title: 'Teach live, sell courses and get paid on Maple',
  sub: 'Your own storefront, a classroom built for teaching, and payouts to mobile money every week.',
  cta: { label: 'Apply to teach', href: '/sign-up' },
  second: { label: 'See a teacher storefront', href: '/@sarah-kimani' },
  blocks: [
    {
      kind: 'cards',
      title: 'Everything you need to teach online',
      cards: [
        { icon: 'person', title: 'Your storefront', body: 'A public page with your courses, reviews and booking calendar. Direct bookings through your link are commission-free.' },
        { icon: 'live', title: 'Live classroom', body: 'Whiteboard, breakout rooms, polls and recordings, built to run well on mobile data.' },
        { icon: 'wallet', title: 'Weekly payouts', body: 'Earnings are paid every Friday to MTN MoMo, Airtel Money or your bank.' },
      ],
    },
    {
      kind: 'steps',
      title: 'How to start',
      steps: [
        { title: 'Apply', body: 'Tell us what you teach and upload your teaching certificate.' },
        { title: 'Get verified', body: 'We check your documents within two working days and add the verified badge.' },
        { title: 'Publish and teach', body: 'Set your prices, publish your first course and open your calendar.' },
      ],
    },
  ],
};

const about: InfoPageData = {
  nav: 'About',
  icon: 'sparkle',
  eyebrow: 'About Maple',
  title: 'Quality education. Real progress. A brighter future.',
  sub: 'Maple Global Online School brings great teachers and exam-ready lessons to every learner, wherever they live and whatever their connection.',
  cta: { label: 'Start Free', href: '/sign-up' },
  second: { label: 'Get help', href: '/help' },
  blocks: [
    { kind: 'stats', stats: [{ value: '50,000+', label: 'Learners' }, { value: '500+', label: 'Schools' }, { value: '10,000+', label: 'Books and resources' }, { value: '12', label: 'Countries' }] },
    {
      kind: 'cards',
      title: 'What we believe',
      cards: [
        { icon: 'heart', title: 'Every learner can do well', body: 'Clear lessons, steady practice and quick feedback help every child make progress.' },
        { icon: 'shield', title: 'Children are kept safe', body: 'Chats are moderated, contact details are hidden and parents see what their child does.' },
        { icon: 'cloud', title: 'Built for real connections', body: 'Lessons download for offline study and live classes adapt to slow networks.' },
      ],
    },
  ],
};

const terms: InfoPageData = {
  icon: 'clipboard',
  eyebrow: 'Legal',
  title: 'Terms of Service',
  sub: 'The agreement between you and Maple Global Online School when you use our website and apps.',
  blocks: [
    {
      kind: 'legal',
      updated: '1 October 2026',
      sections: [
        { title: 'Your account', body: 'You must give accurate details when you sign up. Learners under 18 need a parent or guardian to agree to these terms for them.' },
        { title: 'Study passes and payments', body: 'Passes renew at the end of each cycle until you cancel. Prices include applicable taxes. Refunds are available within 7 days of a first purchase.' },
        { title: 'Using Maple safely', body: 'Be kind, keep conversations on Maple and do not share contact details with learners. We may remove content or accounts that break these rules.' },
        { title: 'Content', body: 'Lessons and resources are for your personal study. Teachers keep the rights to the courses they publish.' },
        { title: 'Contact', body: 'Questions about these terms can be sent from the Help page.' },
      ],
    },
  ],
};

const privacy: InfoPageData = {
  icon: 'lock',
  eyebrow: 'Legal',
  title: 'Privacy Policy',
  sub: 'What we collect, why we collect it and the choices you have.',
  blocks: [
    {
      kind: 'legal',
      updated: '1 October 2026',
      sections: [
        { title: 'What we collect', body: 'Your name, contact details, school and curriculum, and how you use lessons, so we can show progress and recommend what to study next.' },
        { title: 'Children', body: 'We collect only what a learner needs to study. A parent or guardian can see, download or delete their child’s data at any time.' },
        { title: 'Who we share it with', body: 'Your teachers and school see your progress. Payment providers receive what they need to take a payment. We never sell personal data.' },
        { title: 'How long we keep it', body: 'We keep your data while your account is open, and delete it within 90 days of closing the account.' },
        { title: 'Your choices', body: 'Change your details in Settings, or ask for a copy or deletion of your data from the Help page.' },
      ],
    },
  ],
};

export const infoPages = { pricing, curriculums, teachers, about, terms, privacy };
export const pricingPlans = billingHub.plans;
