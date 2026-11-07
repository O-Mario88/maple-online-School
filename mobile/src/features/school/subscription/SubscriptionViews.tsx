import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Btn, Card, IconTile, Pill, UnderTabs } from '@/features/portal/PortalParts';
import { BLUE, BODY, LINE, NAVY, WHITE } from '@/features/portal/tokens';

import { AdminDesk, AdminPhone } from '../kit/AdminKit';
import { BillingSummary, Capacity, CapacityBanner, ChangeSheet, CurrentPlan, Head, Invoices, Usage } from './SubscriptionParts';
import { type Admin, longDate, type SubState, TAB_ICONS, TABS, type Tab, ugx, useSubscription } from './useSubscription';
import { Maple } from '@/constants/maple';
import { PAGE_TITLE } from '@/lib/fonts/type';

const BRAND_BLUE = Maple.blue;

function PageTitle({ phone = false }: { phone?: boolean }) {
  return (
    <View style={s.title}>
      <IconTile icon="receipt" tone="purple" size={phone ? 42 : 48} radius={12} />
      <View style={s.flex}>
        <Text style={[s.h1, phone && s.h1P]} {...PAGE_TITLE}>
          Subscription & Billing
        </Text>
        <Text style={s.sub}>Manage your plan, learner capacity, usage, invoices and payments.</Text>
      </View>
    </View>
  );
}

function Plans({ x, phone }: { x: SubState; phone: boolean }) {
  return (
    <View style={s.stack}>
      <View style={[s.plans, phone && s.plansP]}>
        {x.versions.map((v) => {
          const on = v.planId === x.current.planId;
          const up = v.priceUGX > x.current.priceUGX;
          return (
            <Card key={v.planId} style={[s.planCol, phone ? null : s.planColD, on && s.planOn]}>
              <View style={s.row}>
                <Text style={s.planName}>{v.name}</Text>
                {on ? <Pill label="Current" tone="purple" size={11} /> : null}
              </View>
              <Text style={s.price}>{ugx(v.priceUGX)}</Text>
              <Text style={s.small}>per term</Text>
              {[`Up to ${v.learners.toLocaleString('en-US')} learners`, `${v.allowances.liveSessions} live sessions a term`, `${v.allowances.storageGB} GB storage`, `${v.allowances.streamingGB} GB streaming a term`].map((f) => (
                <View key={f} style={s.row}>
                  <Icon name="tick" size={14} color={Maple.successText} />
                  <Text style={s.body}>{f}</Text>
                </View>
              ))}
              {on ? null : <Btn label={up ? `Upgrade to ${v.name.replace('Maple ', '')}` : `Move to ${v.name.replace('Maple ', '')}`} kind={up ? 'primary' : 'outline'} onPress={() => x.preview(v.planId)} height={40} />}
            </Card>
          );
        })}
      </View>
      <Text style={s.small}>Every plan is a complete digital school: live classes, library, assessments, full accounting and the School Network listing. Upgrades are charged for the rest of the term; downgrades start at renewal and never remove learners or records.</Text>
    </View>
  );
}

function LearnerCapacity({ x }: { x: SubState }) {
  const l = x.sub.learners;
  const rows: readonly [string, string, string][] = [
    ['Licensed learners', String(l.licensed), 'Active, enrolled learners, each counted once'],
    ['Archived or former learners', String(l.archived), 'Not counted'],
    ['Duplicate learner records', String(l.duplicates), 'Counted once, with the learner'],
    ['Teachers and staff', String(l.teachers), 'Not counted'],
    ['Parents and guardians', String(l.parents), 'Not counted'],
    ['People who viewed your School Network profile', '—', 'Never counted'],
  ];
  return (
    <View style={s.stack}>
      <Capacity x={x} />
      <Card style={s.card}>
        <Head icon="people" title="How learners are counted" />
        {rows.map(([k, v, note]) => (
          <View key={k} style={s.countRow}>
            <Text style={[s.body, s.flex]}>{k}</Text>
            <Text style={s.countValue}>{v}</Text>
            <Text style={[s.small, s.countNote]}>{note}</Text>
          </View>
        ))}
        <Text style={s.small}>You’re warned at 80%, 90% and 100%. At capacity no learner is removed and no lesson is interrupted.</Text>
        <View style={s.row}>
          <Btn label="Request extra seats" kind="outline" onPress={x.addSeats} height={40} />
          <Btn label="Compare plans" onPress={() => x.setTab('Plans & Upgrades')} height={40} />
        </View>
      </Card>
    </View>
  );
}

function UsageTab({ x }: { x: SubState }) {
  return (
    <View style={s.stack}>
      <Usage x={x} />
      <Card style={s.card}>
        <Head icon="info" title="About allowances" />
        {x.usage.map((u) => (
          <Text key={u.key} style={s.body}>{`${u.label}: ${Math.max(0, u.allowance - u.used)} ${u.unit} left this term`}</Text>
        ))}
        <Text style={s.small}>Usage is measured for the current term. A live class is never cut off when an allowance runs out; any extra usage is billed only as your contract allows.</Text>
      </Card>
    </View>
  );
}

function InvoicesTab({ x }: { x: SubState }) {
  const u = x.sub.upcoming;
  return (
    <View style={s.stack}>
      <Card style={[s.card, s.upcoming]}>
        <Head icon="calendar" title="Upcoming" />
        <View style={s.row}>
          <View style={s.flex}>
            <Text style={s.planName}>{ugx(u.amountUGX)}</Text>
            <Text style={s.small}>{`${u.period} · due ${longDate(u.due)}`}</Text>
          </View>
          <Btn label="How to pay" onPress={x.payUpcoming} height={40} />
        </View>
      </Card>
      <Invoices x={x} all />
    </View>
  );
}

function Choice({ options, value, onChange }: { options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={s.choices}>
      {options.map((o) => (
        <Pressable key={o} style={[s.choice, o === value && s.choiceOn]} onPress={() => onChange(o)} accessibilityRole="radio" accessibilityState={{ selected: o === value }}>
          <Text style={[s.choiceText, o === value && s.choiceTextOn]}>{o}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput style={s.input} value={value} onChangeText={onChange} accessibilityLabel={label} />
    </View>
  );
}

function BillingSettings({ x }: { x: SubState }) {
  const b = x.billing;
  return (
    <Card style={s.card}>
      <Head icon="settings" title="Billing Settings" />
      <Field label="Billing contact" value={b.contact} onChange={(v) => x.setBilling({ contact: v })} />
      <Field label="Invoice email" value={b.email} onChange={(v) => x.setBilling({ email: v })} />
      <Field label="Tax ID (TIN)" value={b.tin} onChange={(v) => x.setBilling({ tin: v })} />
      <Text style={s.label}>Billing cycle</Text>
      <Choice options={['Termly', 'Annual']} value={b.cycle} onChange={(v) => x.setBilling({ cycle: v })} />
      <Text style={s.label}>How you pay</Text>
      <Choice options={['Bank transfer', 'Mobile Money', 'Card']} value={b.method} onChange={(v) => x.setBilling({ method: v })} />
      <Btn label="Save billing settings" onPress={x.saveBilling} height={42} style={s.save} />
    </Card>
  );
}

function Overview({ x, phone }: { x: SubState; phone: boolean }) {
  if (phone) {
    return (
      <View style={s.stack}>
        <CurrentPlan x={x} />
        <Capacity x={x} />
        <Usage x={x} />
        <BillingSummary x={x} />
        <Invoices x={x} />
      </View>
    );
  }
  return (
    <View style={s.cols}>
      <View style={s.col}>
        <CurrentPlan x={x} />
      </View>
      <View style={s.col}>
        <Capacity x={x} />
        <Usage x={x} />
      </View>
      <View style={s.col}>
        <BillingSummary x={x} />
        <Invoices x={x} />
      </View>
    </View>
  );
}

function Body({ x, phone }: { x: SubState; phone: boolean }) {
  const tabs: Record<Tab, ReactNode> = {
    Overview: <Overview x={x} phone={phone} />,
    'Plans & Upgrades': <Plans x={x} phone={phone} />,
    'Learner Capacity': <LearnerCapacity x={x} />,
    'Usage & Allowances': <UsageTab x={x} />,
    'Invoices & Payments': <InvoicesTab x={x} />,
    'Billing Settings': <BillingSettings x={x} />,
  };
  return (
    <View style={s.stack}>
      <CapacityBanner x={x} />
      {tabs[x.tab]}
    </View>
  );
}

/** Settings › Subscription & Billing on the desktop: one workspace for the plan, capacity, usage, invoices and billing. */
export function SubscriptionDesk({ a }: { a: Admin }) {
  const x = useSubscription(a);
  return (
    <AdminDesk me={a.me} search="Search plans, invoices or billing..." active="Subscription & Billing">
      <PageTitle />
      <Card style={s.tabCard}>
        <UnderTabs items={TABS} active={x.tab} onChange={(t) => x.setTab(t as Tab)} icons={TAB_ICONS} size={14} />
      </Card>
      <Body x={x} phone={false} />
      <ChangeSheet x={x} />
    </AdminDesk>
  );
}

/** Subscription & Billing on phones: the same tabs, one column. */
export function SubscriptionPhone({ a }: { a: Admin }) {
  const x = useSubscription(a);
  return (
    <AdminPhone me={a.me}>
      <PageTitle phone />
      <UnderTabs items={TABS} active={x.tab} onChange={(t) => x.setTab(t as Tab)} size={13} />
      <Body x={x} phone />
      <ChangeSheet x={x} />
    </AdminPhone>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  stack: { gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  small: { fontSize: 12.5, lineHeight: 17, color: BODY },
  body: { fontSize: 13.5, color: NAVY },
  title: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  h1: { fontSize: 26, fontWeight: '800', color: NAVY },
  h1P: { fontSize: 22 },
  sub: { marginTop: 2, fontSize: 14, color: BODY },
  tabCard: { alignSelf: 'flex-start', marginBottom: 16, paddingHorizontal: 8, paddingVertical: 0 },
  cols: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  col: { flex: 1, minWidth: 0, gap: 16 },
  card: { gap: 10, padding: 18 },
  plans: { flexDirection: 'row', gap: 16, alignItems: 'stretch' },
  plansP: { flexDirection: 'column' },
  planCol: { gap: 8, padding: 18 },
  planColD: { flex: 1 },
  planOn: { borderWidth: 1.5, borderColor: Maple.blueLine, backgroundColor: Maple.blueSoft },
  planName: { fontSize: 17, fontWeight: '800', color: NAVY },
  price: { marginTop: 4, fontSize: 20, fontWeight: '800', color: NAVY },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Maple.blueSelected },
  countValue: { width: 50, fontSize: 14, fontWeight: '700', color: NAVY, textAlign: 'right' },
  countNote: { width: 200 },
  upcoming: { borderColor: Maple.blueLine, backgroundColor: Maple.blueSoft },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: NAVY },
  input: { height: 40, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: LINE, fontSize: 14, color: NAVY, backgroundColor: WHITE },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  choiceOn: { borderColor: BRAND_BLUE, backgroundColor: Maple.blueSoft },
  choiceText: { fontSize: 13, color: NAVY },
  choiceTextOn: { fontWeight: '600', color: BRAND_BLUE },
  save: { alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 20, backgroundColor: BLUE },
});
