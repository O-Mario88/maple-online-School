/**
 * Sample data for Admissions & Leads: Riverside High School's consent-based inquiries, stage
 * totals and campaigns. Every name here was given by the family with their inquiry; contact
 * details are released to the school only where the family authorised contact. Illustrative.
 */
import type { Consent, Inquiry, Stage, Viewer } from '@/features/school/admissions/admissions';
import type { IconName } from '@/lib/icons';

import { photos } from './photos';

const yes = (channels: Consent['channels'] = ['phone', 'email']): Consent => ({ school: 'riverside', purpose: 'Admissions follow-up for the next intake', channels, status: 'granted', at: '2026-10-28T10:00:00Z' });

const q = ([name, level, stage, consent]: readonly [string, string, Stage, Consent | null], i: number): Inquiry => ({
  ref: `INQ-26${401 + i}`,
  name,
  level,
  program: level.includes('A-Level') ? 'A-Level' : 'O-Level',
  date: '2026-11-03',
  stage,
  school: 'riverside',
  consent,
  contact: { phone: `+256 77${i % 10} 4${i % 10}0 1${i % 10}2`, email: `${name.split(' ')[0].toLowerCase()}.family@example.com` },
});

const inquiries: readonly Inquiry[] = (
  [
    ['Nalongo M.', 'S.1 (O-Level)', 'New', null],
    ['Bata K.', 'S.5 (A-Level)', 'New', null],
    ['Ateenyi T.', 'S.3 (O-Level)', 'New', null],
    ['Okello K.', 'S.1 (O-Level)', 'Contact Authorized', yes()],
    ['Akello R.', 'S.5 (A-Level)', 'Contact Authorized', yes(['email'])],
    ['Pinto N.', 'S.6 (A-Level)', 'Contact Authorized', yes()],
    ['Gwayo W.', 'S.2 (O-Level)', 'Contacted', yes()],
    ['Lunyolo N.', 'S.4 (O-Level)', 'Contacted', yes(['phone'])],
    ['Ssali M.', 'S.1 (O-Level)', 'Contacted', yes()],
    ['Kato A.', 'A-Level (STEM)', 'Interested', yes()],
    ['Bamukama N.', 'O-Level', 'Interested', yes()],
    ['Turyamureeba K.', 'A-Level (Arts)', 'Interested', yes()],
    ['Mugisha N.', 'S.5 (A-Level)', 'Applied', yes()],
    ['Ssemakula K.', 'S.1 (O-Level)', 'Applied', yes()],
    ['Nabirye J.', 'S.3 (O-Level)', 'Applied', yes()],
    ['Kakuru A.', 'S.1 (O-Level)', 'Enrolled', yes()],
    ['Ochen M.', 'S.5 (A-Level)', 'Enrolled', yes()],
    ['Rwamutebe W.', 'S.4 (O-Level)', 'Enrolled', yes()],
  ] as const
).map(q);

export const admissionsHub = {
  terms: ['Term 3, 2026', 'Term 2, 2026', 'Term 1, 2026'],
  tabs: ['Overview', 'Inquiries', 'Applications', 'Enrolments', 'Campaigns', 'Conversion Reports'],
  tabIcons: ['clock', 'help', 'clipboard', 'cap', 'rocket', 'columns'] as readonly IconName[],
  viewer: { school: 'riverside', role: 'admin', name: 'Mr. James Kato' } as Viewer,
  kpis: [
    { key: 'inquiries', label: 'New Inquiries', icon: 'people' as IconName, tone: 'purple' as const, now: 320, before: 229 },
    { key: 'started', label: 'Applications Started', icon: 'clipboard' as IconName, tone: 'purple' as const, now: 2_048, before: 1_484 },
    { key: 'submitted', label: 'Applications Submitted', icon: 'doc' as IconName, tone: 'blue' as const, now: 1_240, before: 775 },
    { key: 'accepted', label: 'Admissions Accepted', icon: 'shield' as IconName, tone: 'green' as const, now: 1_086, before: 754 },
    { key: 'enrolled', label: 'Enrolments Confirmed', icon: 'cap' as IconName, tone: 'purple' as const, now: 1_038, before: 731 },
  ],
  /** Last term's visitor-to-enrolment conversion, for the change in points. */
  conversionBefore: 5.7,
  /** All inquiries at each stage this term (the board shows the newest three). */
  stageTotals: { New: 320, 'Contact Authorized': 298, Contacted: 246, Interested: 198, Applied: 1_240, Enrolled: 1_038 } as Readonly<Record<string, number>>,
  inquiries,
  campaigns: [
    { id: 'c1', title: 'Term 1, 2027 Admissions', sub: 'O-Level | A-Level | STEM', status: 'Active' as const, views: 12_340, interested: 1_486, applications: 830, photo: photos.schoolHub.campaigns[0] },
    { id: 'c2', title: 'STEM Excellence Programme', sub: 'Scholarships & special intake', status: 'Active' as const, views: 6_210, interested: 724, applications: 402, photo: photos.schoolHub.campaigns[1] },
    { id: 'c3', title: 'School Open Day', sub: 'Feb 14, 2027', status: 'Scheduled' as const, views: 2_980, interested: 310, applications: 186, photo: photos.schoolHub.campaigns[2] },
  ],
};
