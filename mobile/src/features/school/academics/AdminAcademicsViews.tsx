import { Image } from '@/components/picture';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { SchoolPhoneTop } from '@/features/portal/PortalFrame';
import { Btn, Card, IconTile, Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, CANVAS, LINE, NAVY, SELECT, TEXT, type Tone, WHITE } from '@/features/portal/tokens';
import type { IconName } from '@/lib/icons';
import { type AcademicsKey, setupProgress } from '@/lib/school/academics-live';
import { toast } from '@/lib/toast';
import type { AdminTable } from '@/mock/portal';

import { AcademicsFrame } from './AcademicsFrame';
import type { AcademicsPage } from './academicsShape';
import { Maple } from '@/constants/maple';
import { PAGE_TITLE } from '@/lib/fonts/type';
import { Palette } from '@/constants/palette';

const HERO = require('@/assets/images/academics-hero.png') as number;

type Academics = AcademicsPage;

/** Real builds: what the page's buttons do. Without it (design builds) they show what would happen. */
export interface AcademicsActions {
  onAction: (action: string) => void;
  /** False for a button the API has no form for yet: it is drawn disabled, with the reason read out. */
  isAvailable: (action: string) => boolean;
}

const press = (act: AcademicsActions | undefined, action: string) => (act ? act.onAction(action) : toast(`${action}: the form opens here.`));

/** Read out with a disabled button. */
const NOT_YET = 'Not available yet';

/** Whether a real build draws this button disabled (design builds draw every button as usable). */
const off = (act: AcademicsActions | undefined, action: string) => (act ? !act.isAvailable(action) : false);

/** The props that disable an unavailable action and say why. */
const availability = (act: AcademicsActions | undefined, action: string) => {
  const disabled = off(act, action);
  return { disabled, accessibilityState: { disabled }, accessibilityHint: disabled ? NOT_YET : undefined };
};

/** The colour a status takes: green for live, blue for coming up, grey for closed. */
function statusTone(status: string): Tone {
  if (status === 'Upcoming') return 'blue';
  if (status === 'Closed') return 'grey';
  return 'green';
}

const isStatus = (label: string) => label === 'Status';

/** The look of each part of the structure: its icon and colours (tile tint, icon), as the design draws them. */
// `wide` is each stat card's share of the row, as the design sizes them (longer labels get wider cards).
const PART: Readonly<Record<string, { icon: IconName; tint: string; ink: string; one: string; tab: IconName; wide: number }>> = {
  campuses: { icon: 'building', tint: Maple.blueSelected, ink: Maple.blue, one: 'Campus', tab: 'building', wide: 178 },
  years: { icon: 'calendar', tint: Maple.successSoft, ink: Maple.successText, one: 'Academic Year', tab: 'calendar', wide: 195 },
  terms: { icon: 'book', tint: Maple.blueSoft, ink: Maple.blue, one: 'Term', tab: 'calendar', wide: 165 },
  streams: { icon: 'people', tint: Maple.blueSelected, ink: Maple.blue, one: 'Grade Level', tab: 'people', wide: 180 },
  subjects: { icon: 'grid', tint: Maple.warningSoft, ink: Maple.warning, one: 'Subject', tab: 'grid', wide: 163 },
  grading: { icon: 'star', tint: Maple.blueSoft, ink: Maple.blue, one: 'Grading Scale', tab: 'chart', wide: 167 },
  competency: { icon: 'layers', tint: Palette.teal100, ink: Palette.cyan700b, one: 'Competency Area', tab: 'layers', wide: 192 },
};
const TERMS_TILE = { icon: 'calendar' as IconName, tint: Maple.warningSoft, ink: Maple.warning };

function Tile({ icon, tint, ink, size, radius = 12 }: { icon: IconName; tint: string; ink: string; size: number; radius?: number }) {
  return (
    <View style={[styles.tile, { width: size, height: size, borderRadius: radius, backgroundColor: tint }]}>
      <Icon name={icon} size={size * 0.5} color={ink} />
    </View>
  );
}

/** One configuration table: icon, title and its add button, then the rows with a status pill and a ⋯ menu. */
function TableCard({ t, act }: { t: AdminTable; act?: AcademicsActions }) {
  const part = t.key === 'terms' ? TERMS_TILE : (PART[t.key] ?? PART.campuses);
  return (
    <Card style={styles.tableCard}>
      <View style={styles.tableHead}>
        <Tile icon={part.icon} tint={part.tint} ink={part.ink} size={42} radius={11} />
        <View style={styles.flex}>
          <Text style={styles.tableTitle} accessibilityRole="header">
            {t.title}
          </Text>
          <Text style={styles.tableSub}>{t.subtitle}</Text>
        </View>
        {t.actions.map((a) => (
          <Pressable key={a} style={({ pressed }) => [styles.addBtn, pressed && styles.pressed, off(act, a) && styles.unavailable]} onPress={() => press(act, a)} {...availability(act, a)} accessibilityRole="button" accessibilityLabel={a}>
            {a.startsWith('Add') ? <Icon name="plus" size={17} color={BLUE} /> : null}
            <Text style={styles.addText} numberOfLines={1}>
              {a}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.table}>
        <View style={[styles.tr, styles.th]}>
          {t.columns.map((c) => (
            <Text key={c.label} style={[styles.thText, { flex: c.flex }]} numberOfLines={1}>
              {c.label}
            </Text>
          ))}
          <View style={styles.menuCol} />
        </View>
        {t.rows.map((r, ri) => (
          <View key={r.join('|')} style={[styles.tr, ri === t.rows.length - 1 && styles.trLast]}>
            {r.map((cell, i) => {
              const col = t.columns[i];
              return isStatus(col.label) ? (
                <View key={col.label} style={{ flex: col.flex }}>
                  <Pill label={cell} tone={statusTone(cell)} size={13.5} style={styles.status} />
                </View>
              ) : (
                <Text key={col.label} style={[styles.td, i === 1 && styles.tdName, { flex: col.flex }]} numberOfLines={2}>
                  {cell}
                </Text>
              );
            })}
            <Pressable
              style={[styles.menuCol, off(act, `Edit ${r[1]}`) && styles.unavailable]}
              onPress={() => (act ? act.onAction(`Edit ${r[1]}`) : toast(`Edit or archive ${r[1]}.`))}
              {...availability(act, `Edit ${r[1]}`)}
              accessibilityRole="button"
              accessibilityLabel={`Options for ${r[1]}`}
              hitSlop={6}>
              <Icon name="more" size={20} color={NAVY} />
            </Pressable>
          </View>
        ))}
        {t.rows.length === 0 ? <Text style={styles.emptyRows}>Nothing set up yet.</Text> : null}
      </View>
    </Card>
  );
}

/** The seven counts, each on its own card: campuses, years, terms, grade levels, subjects, scales and competency areas. */
function Stats({ a }: { a: Academics }) {
  return (
    <View style={styles.stats}>
      {a.sections.map((s) => {
        const part = PART[s.key] ?? PART.campuses;
        return (
          <View key={s.key} style={[styles.stat, { flex: part.wide }]}>
            <Tile icon={part.icon} tint={part.tint} ink={part.ink} size={56} />
            <View style={styles.flex}>
              <Text style={styles.statNum}>{s.count}</Text>
              <Text style={styles.statLabel}>{s.count === 1 ? part.one : s.countLabel}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** The hero: the page's icon, title and line, with the globe and books photo on the right. */
function Hero() {
  return (
    <View style={styles.hero}>
      <Image decorative source={HERO} style={styles.heroPhoto} contentFit="cover" contentPosition="right" accessibilityIgnoresInvertColors />
      <LinearGradient colors={[Maple.blueSoft, 'rgba(238,244,253,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.heroFade} />
      <View style={styles.heroIcon}>
        <Icon name="cap" size={40} color={BLUE} />
      </View>
      <View>
        <Text style={styles.title} {...PAGE_TITLE}>
          Academics
        </Text>
        <Text style={styles.subtitle}>{"Configure your school's academic structure, grading and competency frameworks."}</Text>
      </View>
    </View>
  );
}

/** The tab row in its own white card: Overview, then a tab per part, the current one tinted and underlined. */
function Tabs({ a, tab, onTab }: { a: Academics; tab: string; onTab: (t: string) => void }) {
  return (
    <View style={styles.tabCard} accessibilityRole="tablist">
      {a.tabs.map((t) => {
        const on = t.label === tab;
        const key = Object.keys(TAB_FOR_TABLE).find((k) => TAB_FOR_TABLE[k] === t.label);
        const icon: IconName = key ? PART[key].tab : 'home';
        return (
          <Pressable key={t.label} style={[styles.tab, on && styles.tabOn]} onPress={() => onTab(t.label)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={t.label}>
            <Icon name={icon} size={19} color={on ? BLUE : NAVY} />
            <Text style={[styles.tabText, on && styles.tabTextOn]} numberOfLines={1}>
              {t.label}
            </Text>
            {on ? <View style={styles.tabLine} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

interface SummaryStat {
  icon: IconName;
  tint: string;
  ink: string;
  value: number;
  label: string;
}

/** One of the three summary cards along the bottom: a tinted head that opens its tab, then two counts. */
function Summary({ title, body, icon, tint, ink, wash, stats, onOpen }: { title: string; body: string; icon: IconName; tint: string; ink: string; wash: string; stats: readonly SummaryStat[]; onOpen: () => void }) {
  return (
    <View style={styles.summary}>
      <Pressable style={[styles.summaryHead, { backgroundColor: wash }]} onPress={onOpen} accessibilityRole="button" accessibilityLabel={`Open ${title}`}>
        <Tile icon={icon} tint={tint} ink={ink} size={70} radius={16} />
        <View style={styles.flex}>
          <Text style={styles.summaryTitle}>{title}</Text>
          <Text style={styles.summaryBody}>{body}</Text>
        </View>
        <View style={styles.chevron}>
          <Icon name="chevronRight" size={20} color={BLUE} />
        </View>
      </Pressable>
      <View style={styles.summaryStats}>
        {stats.map((x, i) => (
          <View key={x.label} style={[styles.summaryStat, i > 0 && styles.summaryLine]}>
            <Tile icon={x.icon} tint={x.tint} ink={x.ink} size={38} radius={10} />
            <View>
              <Text style={styles.summaryNum}>{x.value}</Text>
              <Text style={styles.summaryLabel}>{x.label}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
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

/** Academic Structure, Terms, Grades & Subject Matrix on the desktop design. */
export function AdminAcademicsDesk({ a, act }: { a: Academics; act?: AcademicsActions }) {
  const [tab, setTab] = useState('Overview');
  const table = (key: string) => a.tables.find((t) => t.key === key);
  const count = (key: string) => a.sections.find((s) => s.key === key)?.count ?? 0;
  const pair = (left: string, right: string) => {
    const l = table(left);
    const r = table(right);
    return (
      <View style={styles.row}>
        <View style={styles.flex}>{l ? <TableCard t={l} act={act} /> : null}</View>
        <View style={styles.flex}>{r ? <TableCard t={r} act={act} /> : null}</View>
      </View>
    );
  };
  const focused = a.tables.find((t) => TAB_FOR_TABLE[t.key] === tab);
  const grading = table('grading');
  const competency = table('competency');
  const inUse = (grading?.rows ?? []).filter((r) => r[r.length - 1] === 'Active').length;
  const levelsAt = competency?.columns.findIndex((c) => c.label === 'Levels') ?? -1;
  const standards = levelsAt < 0 ? 0 : (competency?.rows ?? []).reduce((n, r) => n + (Number.parseInt(r[levelsAt], 10) || 0), 0);
  const progress = setupProgress(Object.fromEntries(a.sections.map((s) => [s.key, s.count])) as Record<AcademicsKey, number>);
  return (
    <AcademicsFrame nav={a.nav} active="Academics" school={a.school} me={a.me} progress={progress}>
      <Hero />
      <Tabs a={a} tab={tab} onTab={setTab} />
      {focused ? (
        <View style={styles.focus}>
          <TableCard t={focused} act={act} />
        </View>
      ) : (
        <>
          <Stats a={a} />
          {pair('campuses', 'years')}
          {pair('terms', 'streams')}
          <View style={styles.row}>
            <Summary
              title="Subjects & Subject Matrix"
              body="Configure subjects, codes and assign them to each grade level."
              icon="book"
              tint={Maple.blueSelected}
              ink={BLUE}
              wash={Maple.blueSoft}
              onOpen={() => setTab('Subjects & Matrix')}
              stats={[
                { icon: 'layers', tint: Maple.blueSelected, ink: Maple.blue, value: count('subjects'), label: 'Subjects' },
                { icon: 'grid', tint: Maple.blueSelected, ink: Maple.blue, value: a.matrices, label: 'Subject Matrices' },
              ]}
            />
            <Summary
              title="Grading Scales"
              body="Define grading scales and performance descriptors."
              icon="chart"
              tint={Maple.warningSoft}
              ink={Maple.warning}
              wash={Maple.warningSoft}
              onOpen={() => setTab('Grading Scales')}
              stats={[
                { icon: 'star', tint: Maple.warningSoft, ink: Maple.warning, value: count('grading'), label: 'Grading Scales' },
                { icon: 'check', tint: Maple.successSoft, ink: Maple.successText, value: inUse, label: 'In Use' },
              ]}
            />
            <Summary
              title="Competency Framework"
              body="Set competency areas, standards and learning outcomes."
              icon="layers"
              tint={Maple.blueSelected}
              ink={Maple.blue}
              wash={Maple.blueSoft}
              onOpen={() => setTab('Competency Framework')}
              stats={[
                { icon: 'layers', tint: Maple.blueSoft, ink: Maple.blue, value: count('competency'), label: 'Competency Areas' },
                { icon: 'flag', tint: Maple.blueSoft, ink: Maple.blue, value: standards, label: 'Standards' },
              ]}
            />
          </View>
        </>
      )}
    </AcademicsFrame>
  );
}

/** A configuration table as phone cards: the name in bold, the other columns as labelled lines. */
function PhoneTable({ t }: { t: AdminTable }) {
  return (
    <View style={styles.phoneTable}>
      {t.rows.length === 0 ? <Text style={styles.emptyRows}>Nothing set up yet.</Text> : null}
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
export function AdminAcademicsPhone({ a, act }: { a: Academics; act?: AcademicsActions }) {
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
              <Btn key={x} label={x} icon={x.startsWith('Add') ? 'plus' : undefined} kind={x.startsWith('Add') ? 'primary' : 'soft'} onPress={() => press(act, x)} height={52} disabled={off(act, x)} hint={off(act, x) ? NOT_YET : undefined} />
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
                <Pressable key={q.label} style={[styles.quickBtn, off(act, q.label) && styles.unavailable]} onPress={() => press(act, q.label)} {...availability(act, q.label)} accessibilityRole="button" accessibilityLabel={q.label}>
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
  emptyRows: { fontSize: 14.5, color: BODY, paddingVertical: 18, paddingHorizontal: 6 },
  flex: { flex: 1, minWidth: 0 },
  pressed: { opacity: 0.85 },
  // An action the API has no form for yet: faded and not pressable (its reason is read out).
  unavailable: { opacity: 0.45 },
  tile: { alignItems: 'center', justifyContent: 'center' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 20, height: 124, marginTop: 2, paddingHorizontal: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: Maple.blueSoft },
  heroPhoto: { position: 'absolute', top: 0, right: 0, bottom: 0, width: 610 },
  heroFade: { position: 'absolute', top: 0, bottom: 0, right: 470, width: 140 },
  heroIcon: { width: 70, height: 70, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: Maple.blueSelected },
  title: { fontSize: 38, fontWeight: '800', color: NAVY, letterSpacing: -0.8 },
  subtitle: { marginTop: 4, fontSize: 16, color: TEXT },
  tabCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 50, marginTop: -2, paddingHorizontal: 2, borderRadius: 14, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE, shadowColor: Maple.navy, shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 46, paddingHorizontal: 13, borderRadius: 10 },
  tabOn: {},
  tabText: { fontSize: 14, color: NAVY },
  tabTextOn: { color: BLUE, fontWeight: '700' },
  tabLine: { position: 'absolute', left: 14, right: 14, bottom: -3, height: 3, borderRadius: 2, backgroundColor: BLUE },
  stats: { flexDirection: 'row', gap: 12 },
  stat: { minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12, height: 88, paddingHorizontal: 14, borderRadius: 14, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  statNum: { fontSize: 24, fontWeight: '800', color: NAVY },
  statLabel: { fontSize: 14, lineHeight: 18, color: TEXT },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: 22 },
  focus: { maxWidth: 1100 },
  tableCard: { flex: 1, gap: 14, padding: 16 },
  tableHead: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  tableTitle: { fontSize: 19, fontWeight: '800', color: NAVY },
  tableSub: { marginTop: 2, fontSize: 13.5, color: TEXT },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: Maple.blueLine, backgroundColor: Maple.blueSoft },
  addText: { fontSize: 14.5, fontWeight: '700', color: BLUE },
  table: { borderRadius: 10, borderWidth: 1, borderColor: LINE, overflow: 'hidden' },
  tr: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 40, paddingHorizontal: 14, borderBottomWidth: 1, borderColor: LINE },
  trLast: { borderBottomWidth: 0 },
  th: { backgroundColor: Maple.blueSoft },
  thText: { fontSize: 13.5, fontWeight: '700', color: NAVY },
  td: { fontSize: 14, color: TEXT },
  tdName: { color: NAVY, fontWeight: '700' },
  status: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4 },
  menuCol: { width: 26, alignItems: 'center' },
  summary: { flex: 1, minWidth: 0, padding: 6, borderRadius: 16, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  summaryHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, paddingLeft: 14, paddingRight: 12, borderRadius: 12 },
  summaryTitle: { fontSize: 18.5, fontWeight: '800', color: NAVY, letterSpacing: -0.3 },
  summaryBody: { marginTop: 4, fontSize: 14, lineHeight: 19, color: TEXT },
  chevron: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: WHITE, shadowColor: Maple.navy, shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  summaryStats: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 18, paddingBottom: 10 },
  summaryStat: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 14 },
  summaryLine: { paddingLeft: 26, borderLeftWidth: 1, borderColor: LINE },
  summaryNum: { fontSize: 22, fontWeight: '800', color: NAVY },
  summaryLabel: { fontSize: 14, color: TEXT },
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
