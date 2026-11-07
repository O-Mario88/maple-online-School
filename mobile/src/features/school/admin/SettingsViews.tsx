import { type Href, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Bar, Btn, Card, CardHead, IconTile, Pill, Toggle, UnderTabs } from '@/features/portal/PortalParts';
import { BLUE, BODY, LINE, NAVY, WHITE } from '@/features/portal/tokens';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';
import type { RoleName } from '@/mock/school-admin';

import { AdminDesk, AdminPhone, Cell, type Column, DataTable, Face, ListCard, ListRow, MenuRow, MiniBtn, PageHead, Pager, Search, SelectBox, StatusCell, useChoice, useSelection } from '../kit/AdminKit';
import { Maple } from '@/constants/maple';
import { Palette } from '@/constants/palette';

type Admin = MockData['schoolAdmin'];
type S = Admin['settings'];
type User = S['users'][number];
type LogRow = S['log'][number];

/** A user's photo, or a coloured initial when there is none. */
function UserFace({ u, size = 30 }: { u: User; size?: number }) {
  if (u.avatar) return <Face source={u.avatar} size={size} />;
  return (
    <View style={[styles.initial, { width: size, height: size, borderRadius: size / 2, backgroundColor: u.status === 'Pending' ? Palette.pink500 : BLUE }]}>
      <Text style={styles.initialText}>{u.n}</Text>
    </View>
  );
}

/** The plan, capacity, usage, invoices and billing live on Subscription & Billing. */
const openSubscription = () => router.push('/admin/subscription' as Href);

/** Roles, permissions and the plan, kept as page state. */
function useSettings(s: S) {
  const [users, setUsers] = useState<readonly User[]>(s.users);
  const [role, setRole] = useState(s.roles[0]);
  const [area, setArea] = useState('Finance');
  const [perms, setPerms] = useState<Readonly<Record<string, Readonly<Record<string, readonly (readonly [string, boolean])[]>>>>>({ [s.roles[0]]: s.permissions });
  const current = perms[role] ?? s.permissions;
  const toggle = (label: string, on: boolean) => {
    setPerms((prev) => ({ ...prev, [role]: { ...(prev[role] ?? s.permissions), [area]: (prev[role] ?? s.permissions)[area].map(([l, v]) => (l === label ? [l, on] : [l, v])) } }));
    toast(`${role}: “${label}” ${on ? 'allowed' : 'removed'}. Logged in the audit trail.`);
  };
  const invite = () => {
    const n = users.length + 1;
    setUsers((prev) => [...prev, { n, name: 'New Staff Member', email: `staff${n}@mapleschool.ac.ug`, role: 'Teacher' as RoleName, status: 'Pending', last: 'Invited today', avatar: null }]);
    toast('Invitation sent. They join as a Teacher until you change their role.');
  };
  return { users, invite, role, setRole, area, setArea, current, toggle };
}

/** Permissions for the chosen role and area, as switches. */
function Permissions({ s, st }: { s: S; st: ReturnType<typeof useSettings> }) {
  return (
    <Card style={styles.block}>
      <CardHead title="Role Permissions" subtitle="Configure what each role can access and do within the system." />
      <View style={styles.permHead}>
        <Text style={styles.meta}>Select Role</Text>
        <SelectBox value={st.role} options={s.roles} onChange={st.setRole} style={styles.flex} />
        <MiniBtn label="View as Role" icon="eye" onPress={() => toast(`Previewing Maple as the ${st.role}. Pages they can't open are hidden.`)} />
      </View>
      <UnderTabs items={s.permissionAreas} active={st.area} onChange={st.setArea} size={13.5} spread />
      {(st.current[st.area] ?? []).map(([label, on]) => (
        <View key={label} style={styles.perm}>
          <Icon name="info" size={16} color={BODY} />
          <Text style={styles.permText}>{label}</Text>
          <Toggle value={on} onChange={(v) => st.toggle(label, v)} label={label} />
        </View>
      ))}
    </Card>
  );
}

/** Tenant Roles, Permissions, Subscription & Audit Log on the desktop reference. */
export function SettingsDesk({ a }: { a: Admin }) {
  const s = a.settings;
  const st = useSettings(s);
  const [tab, setTab] = useState(s.tabs[0]);
  const [query, setQuery] = useState('');
  const [roleF, setRoleF, roleFs] = useChoice(['All Roles', ...s.roles]);
  const [statusF, setStatusF, statusFs] = useChoice(['All Status', 'Active', 'Pending']);
  const [act, setAct, acts] = useChoice(['All Activities', 'Records', 'Payments', 'Logins']);
  const [who, setWho, whos] = useChoice(['All Users', ...s.activityUsers]);
  const [range, setRange, ranges] = useChoice(['Oct 1, 2026 – Oct 31, 2026', 'Sep 1, 2026 – Sep 30, 2026']);
  const [page, setPage] = useState(1);
  const [sel, toggle] = useSelection();
  const users = useMemo(() => {
    const q = query.trim().toLowerCase();
    return st.users.filter((u) => (roleF === 'All Roles' || u.role === roleF) && (statusF === 'All Status' || u.status === statusF) && (!q || `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q)));
  }, [st.users, query, roleF, statusF]);
  const uCols: readonly Column<User>[] = [
    { label: '#', width: 26, render: (u) => <Cell>{u.n}</Cell> },
    {
      label: 'Name',
      flex: 1.5,
      render: (u) => (
        <View style={styles.nameCell}>
          <UserFace u={u} />
          <Cell strong>{u.name}</Cell>
        </View>
      ),
    },
    { label: 'Email', flex: 1.6, render: (u) => <Cell lines={2}>{u.email}</Cell> },
    { label: 'Role', flex: 1.3, render: (u) => <StatusCell label={u.role} tone={a.ROLE_TONE[u.role]} /> },
    { label: 'Status', flex: 0.8, render: (u) => <StatusCell label={u.status} tone={u.status === 'Active' ? 'green' : 'orange'} /> },
    { label: 'Last Active', flex: 1.1, render: (u) => <Cell>{u.last}</Cell> },
  ];
  const lCols: readonly Column<LogRow>[] = [
    { label: '#', width: 24, render: (x) => <Cell>{x.n}</Cell> },
    { label: 'Date & Time', flex: 1.2, render: (x) => <Cell>{x.when}</Cell> },
    { label: 'User', flex: 0.8, render: (x) => <Cell strong>{x.user}</Cell> },
    { label: 'Action', flex: 1.4, render: (x) => <Cell lines={2}>{x.action}</Cell> },
    { label: 'Details', flex: 1.4, render: (x) => <Cell lines={2}>{x.detail}</Cell> },
    { label: 'IP Address', flex: 0.9, render: (x) => <Cell>{x.ip}</Cell> },
  ];
  const p = s.plan;
  const stats = [
    { value: String(st.users.length + 18), label: 'Total Users', sub: `${st.users.filter((u) => u.status === 'Pending').length + 3} pending invitations`, icon: 'people' as const, tone: 'blue' as const },
    { value: '6', label: 'Active Roles', sub: 'Customizable', icon: 'doc' as const, tone: 'green' as const },
  ];
  const showUsers = tab === 'Users & Roles';
  return (
    <AdminDesk me={a.me} search="Search users, roles, settings or help..." active="Settings">
      <PageHead title="Settings" subtitle="Manage your school's users, roles, permissions, subscription and system settings." />
      <Card style={styles.tabCard}>
        <UnderTabs items={s.tabs} active={tab} onChange={setTab} size={15} style={styles.tabs} />
      </Card>
      <View style={styles.statRow}>
        {stats.map((x) => (
          <View key={x.label} style={styles.stat}>
            <IconTile icon={x.icon} tone={x.tone} size={54} radius={12} />
            <View>
              <Text style={styles.statValue}>{x.value}</Text>
              <Text style={styles.statLabel}>{x.label}</Text>
              <Text style={styles.meta}>{x.sub}</Text>
            </View>
          </View>
        ))}
        <View style={styles.stat}>
          <IconTile icon="star" tone="orange" size={54} radius={12} />
          <View>
            <Text style={styles.statValue}>{p.name}</Text>
            <Pill label="Active" tone="green" icon="check" size={12} />
            <Text style={styles.meta}>{p.until}</Text>
          </View>
        </View>
        <View style={styles.stat}>
          <IconTile icon="people" tone="blue" size={54} radius={12} />
          <View style={styles.flex}>
            <Text style={styles.statValue}>{`${p.students} / ${money1k(p.limit)}`}</Text>
            <Text style={styles.statLabel}>Students</Text>
            <View style={styles.usage}>
              <Bar value={p.students / p.limit} color={Maple.successText} height={6} style={styles.flex} />
              <Text style={styles.meta}>{`${Math.round((p.students / p.limit) * 100)}% used`}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.main}>
          {showUsers ? (
            <Card style={styles.block}>
              <CardHead
                title="Users & Roles"
                subtitle="Manage staff accounts and assign roles."
                right={
                  <View style={styles.tools}>
                    <Btn label="Add User" icon="plus" onPress={st.invite} height={40} />
                    <MiniBtn label="Import" icon="download" onPress={() => toast('Import staff from a spreadsheet: name, email, phone and role.')} />
                    <MiniBtn label="" icon="more" onPress={() => toast('Export users, resend invitations or bulk change roles.')} />
                  </View>
                }
              />
              <View style={styles.tools}>
                <Search placeholder="Search users by name, email or role..." value={query} onChange={setQuery} style={styles.flex} />
                <SelectBox value={roleF} options={roleFs} onChange={setRoleF} width={150} />
                <SelectBox value={statusF} options={statusFs} onChange={setStatusF} width={150} />
              </View>
              <DataTable columns={uCols} rows={users} rowKey={(u) => String(u.n)} check menu dense selected={sel} onToggle={toggle} onMenu={(u) => toast(`${u.name}: change role, reset password, suspend or remove.`)} />
              <Pager pages={3} page={page} onPage={setPage} label={`Showing 1–${users.length} of ${st.users.length + 18} users`} />
            </Card>
          ) : null}
          {tab === 'Permissions' ? <Permissions s={s} st={st} /> : null}
          {tab === 'School Profile' || tab === 'System Settings' ? (
            <Card style={styles.block}>
              <CardHead title={tab} subtitle={tab === 'School Profile' ? 'Name, crest, contacts and branding.' : 'Time zone, languages, data retention and backups.'} />
              {(tab === 'School Profile'
                ? [
                    ['School name', 'Kampala Hill School'],
                    ['Curriculum', 'UNEB (Uganda National Curriculum)'],
                    ['Address', 'Plot 12, Kampala Road, Kampala'],
                  ]
                : [
                    ['Time zone', 'East Africa Time (UTC+3)'],
                    ['Languages', 'English, Luganda'],
                    ['Data retention', '7 years (Uganda Data Protection Act)'],
                  ]
              ).map(([k, v]) => (
                <ListRow key={k} title={k} body={v} onPress={() => toast(`Edit ${k.toLowerCase()}.`)} right={<Icon name="chevronRight" size={18} color={BLUE} />} />
              ))}
            </Card>
          ) : null}
        </View>
        <View style={styles.side}>
          <Card style={styles.block}>
            <CardHead title="Subscription & Billing" size={17} right={<MiniBtn label="Manage Plan" icon="settings" onPress={openSubscription} />} />
            <View style={styles.plan}>
              <IconTile icon="star" tone="orange" size={56} radius={12} />
              <View style={styles.flex}>
                <View style={styles.planName}>
                  <Text style={styles.statValue}>{p.name}</Text>
                  <Pill label="Active" tone="green" icon="check" size={12} />
                </View>
                <Text style={styles.meta}>{p.until}</Text>
                <Text style={styles.price}>{p.price}</Text>
              </View>
            </View>
            <MiniBtn label="Change Plan" onPress={openSubscription} style={styles.changePlan} />
            {p.features.map((f) => (
              <View key={f} style={styles.feature}>
                <Icon name="check" size={18} color={Maple.successText} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </Card>
          <Card style={styles.block}>
            <CardHead title="Billing Information" link="View All" onLink={openSubscription} />
            {[
              ['Next Billing Date', p.next],
              ['Amount', p.amount],
              ['Payment Method', p.method],
            ].map(([k, v]) => (
              <View key={k} style={styles.kv}>
                <Text style={styles.key}>{k}</Text>
                <Text style={styles.value}>{v}</Text>
              </View>
            ))}
            <MiniBtn label="Update" onPress={() => toast('Change the Mobile Money number or add a card.')} style={styles.update} />
          </Card>
        </View>
      </View>
      {showUsers || tab === 'Audit Log' || tab === 'Permissions' ? (
        <View style={styles.bottom}>
          {tab !== 'Permissions' ? (
            <View style={styles.permCol}>
              <Permissions s={s} st={st} />
            </View>
          ) : null}
          {tab !== 'Permissions' ? (
            <Card style={[styles.block, styles.flex]}>
              <CardHead title="Tenant Activity Log" link="View All" onLink={() => setTab('Audit Log')} />
              <View style={styles.tools}>
                <SelectBox value={act} options={acts} onChange={setAct} style={styles.flex} />
                <SelectBox value={who} options={whos} onChange={setWho} style={styles.flex} />
                <SelectBox value={range} options={ranges} onChange={setRange} width={226} />
              </View>
              <DataTable columns={lCols} rows={s.log} rowKey={(x) => String(x.n)} dense />
              <Text style={styles.meta}>{"Entries can't be edited or deleted. Each one is chained to the one before it."}</Text>
            </Card>
          ) : null}
        </View>
      ) : null}
    </AdminDesk>
  );
}

function money1k(n: number): string {
  return n.toLocaleString('en-US');
}

/** The phone reference: the settings sections, your plan and recent activity. */
export function SettingsPhone({ a }: { a: Admin }) {
  const s = a.settings;
  const st = useSettings(s);
  const [view, setView] = useState<string | null>(null);
  const p = s.plan;
  if (view) {
    return (
      <AdminPhone me={a.me}>
        <PageHead title={view} subtitle={view === 'Users & Roles' ? 'Staff accounts and their roles.' : view === 'Audit Log' ? 'Every change, by who and when.' : 'Choose what this role can do.'} phone onBack={() => setView(null)} />
        {view === 'Users & Roles' ? (
          <>
            {st.users.map((u) => (
              <View key={u.n} style={styles.userCard}>
                <UserFace u={u} size={42} />
                <View style={styles.flex}>
                  <Text style={styles.userName}>{u.name}</Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {u.email}
                  </Text>
                  <View style={styles.userPills}>
                    <StatusCell label={u.role} tone={a.ROLE_TONE[u.role]} />
                    <StatusCell label={u.status} tone={u.status === 'Active' ? 'green' : 'orange'} />
                  </View>
                </View>
              </View>
            ))}
            <Btn label="Add User" icon="plus" onPress={st.invite} height={52} />
          </>
        ) : null}
        {view === 'Role Permissions' ? <Permissions s={s} st={st} /> : null}
        {view === 'Audit Log'
          ? s.log.map((x) => (
              <View key={x.n} style={styles.userCard}>
                <IconTile icon="doc" tone="purple" size={40} radius={10} />
                <View style={styles.flex}>
                  <Text style={styles.userName}>{x.action}</Text>
                  <Text style={styles.meta}>{`${x.user}  •  ${x.detail}`}</Text>
                  <Text style={styles.meta}>{`${x.when}  •  ${x.ip}`}</Text>
                </View>
              </View>
            ))
          : null}
      </AdminPhone>
    );
  }
  return (
    <AdminPhone me={a.me}>
      <PageHead title="Settings" subtitle="Manage users, roles, subscription and activity logs." phone />
      {s.phoneMenu.map((m) => (
        <MenuRow
          key={m.title}
          icon={m.icon}
          tone={m.tone}
          title={m.title}
          body={m.body}
          onPress={() => (m.title === 'Users & Roles' || m.title === 'Audit Log' ? setView(m.title) : m.title === 'Academic Settings' ? setView('Role Permissions') : toast(`${m.title}: ${m.body}.`))}
        />
      ))}
      <ListCard title="Your Plan" right={<Pressable onPress={openSubscription} accessibilityRole="button" accessibilityLabel="Manage plan"><Text style={styles.link}>Manage</Text></Pressable>}>
        <View style={styles.phonePlan}>
          <IconTile icon="columns" tone="blue" size={40} radius={10} />
          <View style={styles.flex}>
            <View style={styles.planName}>
              <Text style={styles.userName}>{p.name}</Text>
              <Pill label="Active" tone="green" icon="check" size={12} />
            </View>
            <Text style={styles.meta}>{p.until}</Text>
          </View>
        </View>
        <View style={styles.usage}>
          <Bar value={p.students / p.limit} color={Maple.successText} height={8} style={styles.flex} />
          <Text style={styles.meta}>{`${Math.round((p.students / p.limit) * 100)}% used`}</Text>
        </View>
        <Text style={styles.meta}>{`${p.students} of ${money1k(p.limit)} students`}</Text>
      </ListCard>
      <ListCard title="Recent Activity" onAll={() => setView('Audit Log')}>
        {s.activity.map((x, i) => (
          <ListRow key={x.title} last={i === s.activity.length - 1} lead={<IconTile icon={x.icon} tone={x.tone} size={40} radius={10} />} title={x.title} body={x.when} />
        ))}
      </ListCard>
    </AdminPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  meta: { marginTop: 2, fontSize: 12.5, color: BODY },
  link: { fontSize: 15, fontWeight: '600', color: BLUE },
  tabCard: { paddingVertical: 0, paddingHorizontal: 14 },
  tabs: { borderBottomWidth: 0 },
  statRow: { flexDirection: 'row', gap: 14, marginTop: 16 },
  stat: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 14, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  statValue: { fontSize: 20, fontWeight: '800', color: NAVY },
  statLabel: { marginTop: 2, fontSize: 14, color: NAVY },
  usage: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginTop: 16 },
  main: { flex: 1, minWidth: 0, gap: 16 },
  side: { width: 350, gap: 16 },
  block: { gap: 12, padding: 16 },
  tools: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nameCell: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  initial: { alignItems: 'center', justifyContent: 'center' },
  initialText: { fontSize: 12, fontWeight: '700', color: WHITE },
  bottom: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginTop: 16 },
  permCol: { width: 520 },
  permHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  perm: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  permText: { flex: 1, fontSize: 13.5, color: NAVY },
  plan: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  planName: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  price: { marginTop: 4, fontSize: 15, fontWeight: '700', color: NAVY },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { flex: 1, fontSize: 13.5, color: NAVY },
  kv: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderColor: LINE },
  key: { width: 124, fontSize: 13.5, color: BODY },
  value: { flex: 1, fontSize: 13.5, color: NAVY },
  update: { alignSelf: 'flex-end' },
  changePlan: { alignSelf: 'flex-start', marginTop: -4, marginLeft: 68 },
  userCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  userName: { fontSize: 15.5, fontWeight: '700', color: NAVY },
  userPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  phonePlan: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
});

