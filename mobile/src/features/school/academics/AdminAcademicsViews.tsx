import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { SchoolDesk, SchoolPhoneTop } from '@/features/portal/PortalFrame';
import { Btn, Card, CardHead, IconTile, Pill, UnderTabs } from '@/features/portal/PortalParts';
import { BLUE, BODY, CANVAS, LINE, NAVY, SELECT, type Tone, WHITE } from '@/features/portal/tokens';
import { toast } from '@/lib/toast';
import type { AdminTable, SchoolAdmin } from '@/mock/portal';

type Academics = SchoolAdmin['academics'];

/** The colour a status takes: green for live, blue for coming up, grey for closed. */
function statusTone(status: string): Tone {
  if (status === 'Upcoming') return 'blue';
  if (status === 'Closed') return 'grey';
  return 'green';
}

const isStatus = (label: string) => label === 'Status';

/** One configuration table: title, its add buttons, then the rows with a status pill and a ⋮ menu. */
function TableCard({ t }: { t: AdminTable }) {
  return (
    <Card style={styles.tableCard}>
      <CardHead
        title={t.title}
        subtitle={t.subtitle}
        size={20}
        right={
          <View style={styles.actions}>
            {t.actions.map((a) => (
              <Btn key={a} label={a} icon={a.startsWith('Add') ? 'plus' : undefined} kind="soft" onPress={() => toast(`${a}: the form opens here.`)} height={46} style={styles.actionBtn} />
            ))}
          </View>
        }
      />
      <View style={styles.table}>
        <View style={[styles.tr, styles.th]}>
          {t.columns.map((c) => (
            <Text key={c.label} style={[styles.thText, { flex: c.flex }]} numberOfLines={2}>
              {c.label}
            </Text>
          ))}
          <View style={styles.menuCol} />
        </View>
        {t.rows.map((r) => (
          <View key={r.join('|')} style={styles.tr}>
            {r.map((cell, i) => {
              const col = t.columns[i];
              return isStatus(col.label) ? (
                <View key={col.label} style={{ flex: col.flex }}>
                  <Pill label={cell} tone={statusTone(cell)} size={13.5} style={styles.status} />
                </View>
              ) : (
                <Text key={col.label} style={[styles.td, i === 1 && styles.tdName, { flex: col.flex }]}>
                  {cell}
                </Text>
              );
            })}
            <Pressable style={styles.menuCol} onPress={() => toast(`Edit or archive ${r[1]}.`)} accessibilityRole="button" accessibilityLabel={`Options for ${r[1]}`} hitSlop={6}>
              <Icon name="more" size={22} color={BLUE} />
            </Pressable>
          </View>
        ))}
      </View>
    </Card>
  );
}

/** The summary strip: how many campuses, years, terms, grade levels, subjects, scales and competency areas. */
function Stats({ a }: { a: Academics }) {
  return (
    <Card style={styles.stats}>
      {a.sections.map((s, i) => (
        <View key={s.key} style={[styles.stat, i > 0 && styles.statLine]}>
          <IconTile icon={s.icon} tone={s.tone} size={52} radius={13} iconSize={26} />
          <View style={styles.flex}>
            <Text style={styles.statNum}>{s.count}</Text>
            <Text style={styles.statLabel}>{s.countLabel}</Text>
          </View>
        </View>
      ))}
    </Card>
  );
}

const TAB_FOR_TABLE: Readonly<Record<string, string>> = {
  campuses: 'Campuses',
  years: 'Academic Years',
  terms: 'Terms / Semesters',
  streams: 'Grade Streams',
  subjects: 'Subjects & Matrix',
  grading: 'Grading Scales',
  competency: 'Competency Framework',
};

/** Academic Structure, Terms, Grades & Subject Matrix on the desktop reference. */
export function AdminAcademicsDesk({ a }: { a: Academics }) {
  const [tab, setTab] = useState('Overview');
  const table = (key: string) => a.tables.find((t) => t.key === key);
  const pair = (left: string, right: string) => {
    const l = table(left);
    const r = table(right);
    return (
      <View style={styles.row}>
        <View style={styles.flex}>{l ? <TableCard t={l} /> : null}</View>
        <View style={styles.flex}>{r ? <TableCard t={r} /> : null}</View>
      </View>
    );
  };
  const focused = a.tables.find((t) => TAB_FOR_TABLE[t.key] === tab);
  const subjects = table('subjects');
  const grading = table('grading');
  const competency = table('competency');
  return (
    <SchoolDesk search="Search students, classes, teachers, or reports..." me={a.me} nav={a.nav} active="Academics">
      <Text style={styles.title} accessibilityRole="header">
        Academics
      </Text>
      <Text style={styles.subtitle}>{"Configure your school's academic structure, grading, and competency frameworks."}</Text>
      <Card style={styles.tabCard}>
        <UnderTabs items={a.tabs.map((t) => t.label)} icons={a.tabs.map((t) => t.icon)} active={tab} onChange={setTab} size={14.5} spread style={styles.tabs} />
      </Card>
      {focused ? (
        <View style={styles.focus}>
          <TableCard t={focused} />
        </View>
      ) : (
        <>
          <Stats a={a} />
          {pair('campuses', 'years')}
          {pair('terms', 'streams')}
          <View style={styles.row}>
            <View style={styles.colWide}>{subjects ? <TableCard t={subjects} /> : null}</View>
            <View style={styles.flex}>{grading ? <TableCard t={grading} /> : null}</View>
            <View style={styles.flex}>{competency ? <TableCard t={competency} /> : null}</View>
          </View>
        </>
      )}
    </SchoolDesk>
  );
}

/** A configuration table as phone cards: the name in bold, the other columns as labelled lines. */
function PhoneTable({ t }: { t: AdminTable }) {
  return (
    <View style={styles.phoneTable}>
      {t.rows.map((r) => (
        <Card key={r.join('|')} style={styles.phoneRow}>
          <View style={styles.phoneRowHead}>
            <Text style={styles.phoneRowName}>{r[1]}</Text>
            {t.columns.map((c, i) => (isStatus(c.label) ? <Pill key={c.label} label={r[i]} tone={statusTone(r[i])} size={13.5} /> : null))}
          </View>
          {t.columns.map((c, i) =>
            i < 2 || isStatus(c.label) ? null : (
              <View key={c.label} style={styles.phoneKV}>
                <Text style={styles.phoneKey}>{c.label}</Text>
                <Text style={styles.phoneValue}>{r[i]}</Text>
              </View>
            ),
          )}
        </Card>
      ))}
    </View>
  );
}

/** The phone reference: each part of the structure as a row, then Quick Actions; a row opens its table. */
export function AdminAcademicsPhone({ a }: { a: Academics }) {
  const [open, setOpen] = useState<string | null>(null);
  const section = a.sections.find((s) => s.key === open);
  const t = a.tables.find((x) => x.key === open);
  if (section && t) {
    return (
      <View style={styles.phoneRoot}>
        <SchoolPhoneTop initial={a.me.initial} notifications={a.me.notifications} />
        <ScrollView contentContainerStyle={styles.phoneScroll}>
          <Pressable style={styles.back} onPress={() => setOpen(null)} accessibilityRole="button" accessibilityLabel="Back to Academics">
            <Icon name="arrowLeft" size={22} color={NAVY} />
            <Text style={styles.backText}>Academics</Text>
          </Pressable>
          <View style={styles.phoneBody}>
            <View style={styles.phoneTitleRow}>
              <IconTile icon={section.icon} tone={section.tone} size={52} radius={13} />
              <View style={styles.flex}>
                <Text style={styles.phoneSectionTitle}>{t.title}</Text>
                <Text style={styles.phoneSub}>{t.subtitle}</Text>
              </View>
            </View>
            <PhoneTable t={t} />
            {t.actions.map((x) => (
              <Btn key={x} label={x} icon={x.startsWith('Add') ? 'plus' : undefined} kind={x.startsWith('Add') ? 'primary' : 'soft'} onPress={() => toast(`${x}: the form opens here.`)} height={52} />
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }
  return (
    <View style={styles.phoneRoot}>
      <SchoolPhoneTop initial={a.me.initial} notifications={a.me.notifications} />
      <ScrollView contentContainerStyle={styles.phoneScroll}>
        <View style={styles.phonePad}>
          <Text style={styles.phoneTitle} accessibilityRole="header">
            Academics
          </Text>
          <Text style={styles.phoneSub}>{"Configure your school's academic structure."}</Text>
        </View>
        <View style={styles.phoneBody}>
          {a.sections.map((s) => (
            <Pressable key={s.key} style={styles.sectionRow} onPress={() => setOpen(s.key)} accessibilityRole="button" accessibilityLabel={`${s.label}: ${s.body}`}>
              <IconTile icon={s.icon} tone={s.key === 'terms' ? 'purple' : 'blue'} size={54} radius={13} iconSize={27} />
              <View style={styles.flex}>
                <Text style={styles.sectionTitle}>{s.label}</Text>
                <Text style={styles.sectionBody}>{s.body}</Text>
              </View>
              <Icon name="chevronRight" size={24} color={BLUE} />
            </Pressable>
          ))}
          <View style={styles.quick}>
            <View style={styles.quickHead}>
              <Icon name="bolt" size={24} color={BLUE} />
              <Text style={styles.quickTitle}>Quick Actions</Text>
            </View>
            <View style={styles.quickGrid}>
              {a.quickActions.map((q) => (
                <Pressable key={q.label} style={styles.quickBtn} onPress={() => toast(`${q.label}: the form opens here.`)} accessibilityRole="button" accessibilityLabel={q.label}>
                  {q.label === 'Add Campus' ? <Icon name="plus" size={18} color={BLUE} /> : null}
                  <Icon name={q.icon} size={20} color={BLUE} />
                  <Text style={styles.quickText} numberOfLines={2}>
                    {q.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  title: { fontSize: 34, fontWeight: '800', color: NAVY, letterSpacing: -0.6 },
  subtitle: { marginTop: 6, fontSize: 16, color: BODY },
  tabCard: { marginTop: 20, paddingVertical: 0, paddingHorizontal: 18 },
  tabs: { borderBottomWidth: 0 },
  stats: { flexDirection: 'row', alignItems: 'center', marginTop: 20, paddingVertical: 18 },
  stat: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12 },
  statLine: { borderLeftWidth: 1, borderColor: LINE },
  statNum: { fontSize: 26, fontWeight: '800', color: NAVY },
  statLabel: { fontSize: 13, color: BODY },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 20, marginTop: 20 },
  colWide: { flex: 1.3, minWidth: 0 },
  focus: { marginTop: 20, maxWidth: 1100 },
  tableCard: { gap: 18 },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { paddingHorizontal: 16 },
  table: { borderRadius: 12, borderWidth: 1, borderColor: LINE, overflow: 'hidden' },
  tr: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 54, paddingHorizontal: 14, borderBottomWidth: 1, borderColor: LINE },
  th: { minHeight: 50, backgroundColor: '#F2F6FD' },
  thText: { fontSize: 14, fontWeight: '600', color: NAVY },
  td: { fontSize: 14.5, color: BODY },
  tdName: { color: NAVY, fontWeight: '500' },
  status: { paddingHorizontal: 12, paddingVertical: 6 },
  menuCol: { width: 26, alignItems: 'center' },
  phoneRoot: { flex: 1, backgroundColor: CANVAS },
  phoneScroll: { paddingBottom: 36 },
  phonePad: { paddingHorizontal: 20, paddingTop: 8, gap: 6 },
  phoneTitle: { fontSize: 29, fontWeight: '800', color: NAVY, letterSpacing: -0.5 },
  phoneSub: { fontSize: 16, lineHeight: 22, color: BODY },
  phoneBody: { gap: 14, paddingHorizontal: 20, paddingTop: 18 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 16, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: NAVY },
  sectionBody: { marginTop: 3, fontSize: 13.5, color: BODY },
  quick: { gap: 14, padding: 16, borderRadius: 16, backgroundColor: SELECT },
  quickHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  quickTitle: { fontSize: 18, fontWeight: '700', color: BLUE },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickBtn: { flexBasis: '46%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 56, paddingHorizontal: 6, borderRadius: 12, backgroundColor: WHITE },
  quickText: { flexShrink: 1, fontSize: 14, fontWeight: '500', color: BLUE },
  back: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 10 },
  backText: { fontSize: 17, fontWeight: '600', color: NAVY },
  phoneTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  phoneSectionTitle: { fontSize: 22, fontWeight: '800', color: NAVY },
  phoneTable: { gap: 12 },
  phoneRow: { gap: 8, padding: 16 },
  phoneRowHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  phoneRowName: { flex: 1, minWidth: 0, fontSize: 17, fontWeight: '700', color: NAVY },
  phoneKV: { flexDirection: 'row', gap: 10 },
  phoneKey: { width: 130, fontSize: 14.5, color: BODY },
  phoneValue: { flex: 1, minWidth: 0, fontSize: 14.5, color: NAVY },
});
