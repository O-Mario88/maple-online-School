/**
 * Sample data for School Growth: Riverside High School's privacy-safe totals on the School Network
 * this term and last, the admissions funnel, the engagement trend, why it was recommended, and
 * what to improve. Totals only; no visitor is ever identified. Illustrative.
 */
import type { IconName } from '@/lib/icons';

export const schoolGrowth = {
  terms: ['Term 3, 2026', 'Term 2, 2026', 'Term 1, 2026'],
  tabs: ['Overview', 'Profile Performance', 'Recommendations', 'Admissions Conversions', 'Campaign Performance', 'Insights & Actions'],
  tabIcons: ['edit', 'building', 'cap', 'clipboard', 'image', 'sparkle'] as readonly IconName[],
  /** This term and last, for the change arrows. */
  kpis: [
    { key: 'views', label: 'Profile Views', icon: 'eye' as IconName, tone: 'blue' as const, now: 12_480, before: 9_455 },
    { key: 'impressions', label: 'Recommendation Impressions', icon: 'people' as IconName, tone: 'purple' as const, now: 28_340, before: 20_099 },
    { key: 'clicks', label: 'Recommendation Clicks', icon: 'pointer' as IconName, tone: 'blue' as const, now: 4_620, before: 3_397 },
    { key: 'likes', label: 'Likes', icon: 'heart' as IconName, tone: 'red' as const, now: 1_264, before: 988 },
    { key: 'saves', label: 'Saves', icon: 'bookmark' as IconName, tone: 'green' as const, now: 2_087, before: 1_557 },
    { key: 'comments', label: 'Comments (Approved)', icon: 'chat' as IconName, tone: 'purple' as const, now: 328, before: 276 },
  ],
  /** Deduplicated people who opened the profile (views count every visit). */
  uniqueVisitors: 12_360,
  funnel: [
    { key: 'impressions', label: 'Recommendation Impressions', count: 28_340 },
    { key: 'visits', label: 'Profile Visits', count: 12_480 },
    { key: 'admissions', label: 'Admissions Page Visits', count: 5_320 },
    { key: 'started', label: 'Application Started', count: 2_048 },
    { key: 'submitted', label: 'Application Submitted', count: 1_240 },
    { key: 'enrolled', label: 'Confirmed Enrolments', count: 1_038 },
  ],
  trend: {
    labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
    views: [3_400, 5_100, 5_500, 5_000, 7_600, 9_400],
    applications: [520, 760, 800, 720, 1_020, 1_310],
  },
  /** Why the school was shown to learners, as counted on the network (people who were shown it for each reason). */
  reasons: [
    { label: 'Location (nearby)', icon: 'pin' as IconName, count: 380 },
    { label: 'Academic performance', icon: 'trophy' as IconName, count: 240 },
    { label: 'Programme interest (STEM)', icon: 'flask' as IconName, count: 160 },
    { label: 'Curriculum (A-Level)', icon: 'layers' as IconName, count: 120 },
    { label: 'School facilities', icon: 'building' as IconName, count: 94 },
    { label: 'Boarding for girls', icon: 'home' as IconName, count: 4 },
    { label: 'Sign language support', icon: 'hand' as IconName, count: 2 },
  ],
  /** Which parts of the public profile get attention (views of each section). */
  sections: [
    { label: 'Overview', views: 12_480 },
    { label: 'Admissions', views: 5_320 },
    { label: 'Programs', views: 4_110 },
    { label: 'Fees', views: 3_640 },
    { label: 'Facilities & Gallery', views: 2_960 },
    { label: 'Examination Services', views: 1_180 },
  ],
  insights: [
    { done: true, text: 'Your profile is 92% complete.' },
    { done: true, text: 'Views are up 32% this term.' },
    { done: true, text: 'Recommendation clicks are up 36%.' },
    { done: false, text: 'Add new photos of your facilities.' },
    { done: false, text: 'Update your admissions deadlines.' },
    { done: false, text: 'Highlight your STEM programme.' },
  ],
};
