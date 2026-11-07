/** Sample data for Image 3: Teacher Earnings, Escrow Ledger & Instant Mobile-Money Payouts (/(teacher)/earnings). */
import { photos } from './photos';

export interface EarningsMonthlyBar {
  month: string;
  byosM: number;
  marketM: number;
}

export interface EarningsTransactionRow {
  id: string;
  date: string;
  type: 'BYOS Class' | 'Marketplace Class' | 'Resource Sale';
  description: string;
  students: string;
  amount: string;
  status: 'Completed' | 'In Escrow';
}

export const earningsLedger = {
  dateRange: 'Oct 1, 2026 – Oct 31, 2026',
  totalEarnings: 'UGX 12,480,000',
  totalGrowth: '+18%',
  byosEarnings: 'UGX 6,720,000',
  byosShare: '54% of total earnings',
  marketplaceEarnings: 'UGX 5,760,000',
  marketplaceShare: '46% of total earnings',
  pendingEscrow: 'UGX 2,150,000',
  pendingEscrowDetail: '4 classes • Released after completion',
  unlockedBalance: 'UGX 4,830,000',
  unlockedDetail: 'Available for payout',
  lifetimeEarnings: 'UGX 68,420,000',
  lifetimeDetail: 'Since joining • 0% platform fee on BYOS',
  availableBalanceVal: '4,830,000',
  defaultPhone: '+256 772 123 456',
  mtnLogo: photos.billing['mtn'],
  airtelLogo: photos.billing['airtel'],
  mpesaLogo: photos.payMethods.mpesa,
  monthlyBars: [
    { month: 'Oct 2025', byosM: 1.1, marketM: 0.9 },
    { month: 'Nov 2025', byosM: 1.6, marketM: 1.2 },
    { month: 'Dec 2025', byosM: 2.0, marketM: 1.3 },
    { month: 'Jan 2026', byosM: 2.3, marketM: 1.5 },
    { month: 'Feb 2026', byosM: 2.3, marketM: 1.5 },
    { month: 'Mar 2026', byosM: 2.7, marketM: 1.7 },
    { month: 'Apr 2026', byosM: 3.1, marketM: 1.8 },
    { month: 'May 2026', byosM: 3.2, marketM: 1.9 },
    { month: 'Jun 2026', byosM: 3.3, marketM: 2.0 },
    { month: 'Jul 2026', byosM: 3.5, marketM: 2.0 },
    { month: 'Aug 2026', byosM: 3.8, marketM: 2.1 },
    { month: 'Sep 2026', byosM: 4.3, marketM: 2.2 },
    { month: 'Oct 2026', byosM: 4.8, marketM: 2.8 },
  ] as EarningsMonthlyBar[],
  transactions: [
    {
      id: 'tx-1',
      date: '28 Oct 2026',
      type: 'BYOS Class',
      description: 'O-Level Mathematics (1-on-1)',
      students: '1',
      amount: '120,000',
      status: 'Completed',
    },
    {
      id: 'tx-2',
      date: '27 Oct 2026',
      type: 'Marketplace Class',
      description: 'Group Class: Lower Secondary Maths',
      students: '8',
      amount: '480,000',
      status: 'Completed',
    },
    {
      id: 'tx-3',
      date: '26 Oct 2026',
      type: 'BYOS Class',
      description: 'Primary Mathematics (1-on-1)',
      students: '1',
      amount: '100,000',
      status: 'Completed',
    },
    {
      id: 'tx-4',
      date: '25 Oct 2026',
      type: 'Marketplace Class',
      description: 'Exam Prep Workshop',
      students: '12',
      amount: '720,000',
      status: 'Completed',
    },
    {
      id: 'tx-5',
      date: '24 Oct 2026',
      type: 'BYOS Class',
      description: 'Tutoring Session',
      students: '1',
      amount: '120,000',
      status: 'In Escrow',
    },
    {
      id: 'tx-6',
      date: '22 Oct 2026',
      type: 'Marketplace Class',
      description: 'Problem Solving Masterclass',
      students: '15',
      amount: '900,000',
      status: 'In Escrow',
    },
    {
      id: 'tx-7',
      date: '20 Oct 2026',
      type: 'Resource Sale',
      description: 'Maths Revision Notes (PDF)',
      students: '—',
      amount: '80,000',
      status: 'Completed',
    },
    {
      id: 'tx-8',
      date: '18 Oct 2026',
      type: 'Marketplace Class',
      description: 'Holiday Bootcamp – Algebra',
      students: '10',
      amount: '600,000',
      status: 'Completed',
    },
  ] as EarningsTransactionRow[],
  savedMethods: [
    {
      id: 'pm-1',
      kind: 'mtn' as const,
      title: 'MTN MoMo',
      detail: '+256 772 123 456',
      primary: true,
    },
    {
      id: 'pm-2',
      kind: 'airtel' as const,
      title: 'Airtel Money',
      detail: '+256 751 987 654',
      primary: false,
    },
    {
      id: 'pm-3',
      kind: 'bank' as const,
      title: 'Bank Account',
      detail: 'Stanbic Bank • ****1234',
      primary: false,
    },
  ],
};

export type EarningsLedger = typeof earningsLedger;

