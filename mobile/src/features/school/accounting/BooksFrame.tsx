import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { CmdHead, CommandDesk, type NavGroup } from '@/features/command/kit/CommandFrame';
import { SelectBox, useChoice } from '@/features/school/kit/AdminKit';
import type { IconName } from '@/lib/icons';
import type { MockData } from '@/mock';

type Admin = MockData['schoolAdmin'];

/** The school accounting sidebar from the Chart of Accounts and Journal Entries references. */
export const BOOKS_NAV: readonly NavGroup[] = [
  { label: 'Dashboard', icon: 'home', href: '/' },
  { label: 'Students', icon: 'people', href: '/admin/rosters' },
  { label: 'Teachers', icon: 'person', href: '/admin/rosters' },
  { label: 'Classes', icon: 'book', href: '/admin/timetable' },
  { label: 'Academics', icon: 'cap', href: '/admin/academics' },
  { label: 'Timetable', icon: 'calendar', href: '/admin/timetable' },
  { label: 'Attendance', icon: 'qr', href: '/admin/attendance' },
  { label: 'Report Cards', icon: 'clipboard', href: '/admin/report-cards' },
  { label: 'Library', icon: 'library', href: '/admin/library' },
  { label: 'Fees & Finance', icon: 'wallet', href: '/admin/finance/fees' },
  {
    label: 'Accounting',
    icon: 'chart',
    children: [
      { label: 'Overview', href: '/admin/finance/accounting' },
      { label: 'Chart of Accounts', href: '/admin/finance/chart-of-accounts' },
      { label: 'Journal Entries', href: '/admin/finance/journal-entries' },
      { label: 'Accounts Payable', href: '/admin/finance/accounting' },
      { label: 'Accounts Receivable', href: '/admin/finance/ledger' },
      { label: 'Bank Reconciliation', href: '/admin/finance/accounting' },
      { label: 'Financial Reports', href: '/admin/finance/accounting' },
    ],
  },
  { label: 'Expenses', icon: 'receipt', href: '/admin/finance/journal-entries' },
  { label: 'Vendors', icon: 'building' },
  { label: 'Payroll', icon: 'people' },
  { label: 'Reports', icon: 'doc', href: '/admin/report-cards' },
  { label: 'Communication', icon: 'chat', href: '/messages' },
  { label: 'Settings', icon: 'settings', href: '/admin/settings' },
];

/** A school accounting desktop page on the dark sidebar. */
export function BooksDesk({ a, sub, search, children }: { a: Admin; sub: string; search: string; children: ReactNode }) {
  return (
    <CommandDesk me={a.me} search={search} active="Accounting" sub={sub} nav={BOOKS_NAV} home="/">
      {children}
    </CommandDesk>
  );
}

/** The page head: icon, "Accounting & Finance › Page", the year, term and campus pickers and the page's buttons. */
export function BooksHead({ a, icon, title, subtitle, actions }: { a: Admin; icon: IconName; title: string; subtitle: string; actions: ReactNode }) {
  const b = a.books;
  const [year, setYear, years] = useChoice(b.years);
  const [term, setTerm, terms] = useChoice(b.terms.map((t) => t.replace(', 2026', '')));
  const [campus, setCampus, campuses] = useChoice(b.campuses);
  return (
    <CmdHead
      icon={icon}
      root="Accounting & Finance"
      section={title}
      title={title}
      subtitle={subtitle}
      right={
        <View style={styles.right}>
          <View style={styles.row}>
            <SelectBox label="Academic Year" value={year} options={years} onChange={setYear} width={170} />
            <SelectBox label="Term" value={term} options={terms} onChange={setTerm} width={130} />
            <SelectBox label="Campus" value={campus} options={campuses} onChange={setCampus} width={150} />
          </View>
          <View style={[styles.row, styles.end]}>{actions}</View>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  right: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  end: { justifyContent: 'flex-end' },
});
