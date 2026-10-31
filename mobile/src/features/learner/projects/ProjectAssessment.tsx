import { Image } from 'expo-image';
import { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Bar } from '@/features/learner/dashboard/DashParts';
import { ID_TONE, IdentifierPill } from '@/features/learner/cbc/CbcParts';
import { DOMAINS, GENERIC_SKILLS, identifierFor, LEARNING_OUTCOMES, RACE, raceTotal } from '@/lib/cbc';
import { overallIdentifier } from '@/lib/projects';

import type { Page, Project } from './useProjects';

const INK = '#0B1424';
const BODY = '#4A5263';
const BLUE = '#1463F3';
const TILE: Record<string, { bg: string; fg: string }> = {
  relevance: { bg: '#E3F6E9', fg: '#15803D' },
  accuracy: { bg: '#E6EEFC', fg: '#1450C8' },
  coherence: { bg: '#FDF1DC', fg: '#B45309' },
  excellence: { bg: '#F1E8FD', fg: '#6D28D9' },
};
const KUSVA_BAR = [BLUE, '#22A35A', '#8B5CF6'];
const TABS = ['KUSVA', 'Generic Skills', 'Graduate Profile'] as const;
type Tab = (typeof TABS)[number];

const asId = (n: number) => identifierFor(n, 3);

function Row({ icon, label, id, color }: { icon: number; label: string; id: number; color?: string }) {
  const identifier = asId(id);
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}: identifier ${id}, ${identifier.label}`}>
      <Image source={icon} style={styles.rowIcon} />
      <View style={styles.flex}>
        <Text style={styles.rowLabel} numberOfLines={1}>
          {label}
        </Text>
        <Bar value={id / 3} color={color ?? ID_TONE[identifier.id].bar} track="#E6EBF2" height={5} />
      </View>
      <Text style={styles.rowNum}>{id}</Text>
      <View style={styles.pill}>
        <IdentifierPill identifier={identifier} />
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.rows}>{children}</View>
    </View>
  );
}

/** The RACE marks and competency identifiers for the open project, with the teacher's feedback. */
export function ProjectAssessment({ page, p, onClose }: { page: Page; p: Project; onClose?: () => void }) {
  const [tab, setTab] = useState<Tab>('KUSVA');
  const [info, setInfo] = useState(false);
  const c = p.competency;
  const kusva = c ? (['knowledge', 'skills', 'values'] as const).map((d, i) => <Row key={d} icon={page.compIcons[i]} label={DOMAINS[d].label} id={c.kusva[i]} color={KUSVA_BAR[i]} />) : null;
  const skills = c ? GENERIC_SKILLS.map((g, i) => <Row key={g.key} icon={page.compIcons[3 + i]} label={g.label} id={c.skills[i]} color={BLUE} />) : null;
  const profile = c ? LEARNING_OUTCOMES.map((o, i) => <Row key={o} icon={page.compIcons[8 + i]} label={o} id={c.profile[i]} />) : null;
  const total = p.race ? raceTotal(p.race) : null;
  const overall = c ? overallIdentifier([...c.kusva, ...c.skills, ...c.profile]) : null;
  return (
    <View>
      <View style={styles.head}>
        <Text style={styles.title}>Assessment (RACE)</Text>
        <Pressable onPress={() => setInfo(!info)} accessibilityRole="button" accessibilityLabel="What is RACE?" hitSlop={8}>
          <Icon name="info" size={15} color={BODY} />
        </Pressable>
        <View style={styles.flex} />
        {onClose ? (
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Hide assessment" hitSlop={8}>
            <Icon name="close" size={17} color={INK} />
          </Pressable>
        ) : null}
      </View>
      {info ? <Text style={styles.info}>RACE scores your project on Relevance, Accuracy and Coherence (0–3 each) and Excellence (0–1), out of 10. Identifiers: 1 Basic, 2 Moderate, 3 Outstanding.</Text> : null}
      {p.race && total ? (
        <>
          <View style={styles.tiles}>
            {RACE.map((r) => (
              <View key={r.key} style={[styles.tile, { backgroundColor: TILE[r.key].bg }]} accessible accessibilityLabel={`${r.label}: ${p.race?.[r.key]} of ${r.max}`}>
                <Image source={page.raceIcons[r.key]} style={styles.tileIcon} />
                <Text style={styles.tileLabel}>{r.label}</Text>
                <Text style={[styles.tileScore, { color: TILE[r.key].fg }]}>{`${p.race?.[r.key]} / ${r.max}`}</Text>
              </View>
            ))}
          </View>
          <View style={styles.totalRow}>
            <View style={styles.flex}>
              <Text style={styles.totalLabel}>Total RACE Score</Text>
              <Bar value={total.score / total.max} color="#22A35A" track="#E6EBF2" height={9} />
            </View>
            <Text style={styles.total}>{`${total.score} / ${total.max}`}</Text>
          </View>
        </>
      ) : (
        <Text style={styles.empty}>{p.status === 'upcoming' ? 'Not assessed yet. Your teacher scores RACE when you submit.' : 'Your teacher will score RACE when you submit this project.'}</Text>
      )}
      {c ? (
        <>
          <Text style={[styles.sectionTitle, styles.perfTitle]}>Competency Performance</Text>
          <View style={styles.tabs} accessibilityRole="tablist">
            {TABS.map((t) => (
              <Pressable key={t} style={[styles.tab, t === tab && styles.tabOn]} onPress={() => setTab(t)} accessibilityRole="tab" accessibilityState={{ selected: t === tab }}>
                <Text style={[styles.tabText, t === tab && styles.tabTextOn]}>{t}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.rows}>{tab === 'KUSVA' ? kusva : tab === 'Generic Skills' ? skills : profile}</View>
          <Section title="Generic Skills">{skills}</Section>
          <Section title="Graduate Profile Indicators">{profile}</Section>
        </>
      ) : null}
      {p.feedback ? (
        <View style={styles.feedback}>
          <View style={styles.fbHead}>
            <Text style={styles.fbTitle}>Teacher’s Feedback</Text>
            <View style={styles.flex} />
            {overall ? <Text style={[styles.overall, { color: ID_TONE[overall.id].fg, backgroundColor: ID_TONE[overall.id].bg }]}>{`Overall: ${overall.label}`}</Text> : null}
          </View>
          <View style={styles.fbBody}>
            <Image source={page.teacherPhoto} style={styles.fbPhoto} />
            <View style={styles.flex}>
              <Text style={styles.fbName}>{p.feedback.teacher}</Text>
              <Text style={styles.fbDate}>{p.feedback.date}</Text>
              <Text style={styles.fbText}>{p.feedback.text}</Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 14, fontWeight: '700', color: '#0B2A6B' },
  info: { marginTop: 8, padding: 8, borderRadius: 6, backgroundColor: '#F1F5FB', fontSize: 11, lineHeight: 15, color: BODY },
  tiles: { flexDirection: 'row', gap: 5, marginTop: 14 },
  tile: { flex: 1, height: 83, alignItems: 'center', justifyContent: 'center', gap: 3, borderRadius: 8 },
  tileIcon: { width: 21, height: 20 },
  tileLabel: { marginTop: 4, fontSize: 11.5, color: INK },
  tileScore: { fontSize: 13, fontWeight: '700' },
  totalRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 30, marginTop: 14 },
  totalLabel: { marginBottom: 8, fontSize: 12, fontWeight: '600', color: INK },
  total: { fontSize: 15, fontWeight: '700', color: INK },
  empty: { marginTop: 14, padding: 12, borderRadius: 8, backgroundColor: '#F5F8FC', fontSize: 12, lineHeight: 17, color: BODY },
  section: { marginTop: 14 },
  sectionTitle: { fontSize: 13.5, fontWeight: '700', color: '#0B2A6B' },
  perfTitle: { marginTop: 22 },
  tabs: { flexDirection: 'row', gap: 4, marginTop: 10 },
  tab: { flex: 1, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 5, backgroundColor: '#F1F4F9' },
  tabOn: { borderWidth: 1, borderColor: BLUE, backgroundColor: '#FFFFFF' },
  tabText: { fontSize: 11, color: BODY },
  tabTextOn: { color: BLUE, fontWeight: '700' },
  rows: { gap: 9, marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowIcon: { width: 21, height: 21 },
  rowLabel: { marginBottom: 5, fontSize: 11, color: INK },
  rowNum: { width: 14, fontSize: 13.5, fontWeight: '700', color: INK, textAlign: 'center' },
  pill: { width: 74 },
  feedback: { marginTop: 18, padding: 10, borderRadius: 8, backgroundColor: '#EAF6EE' },
  fbHead: { flexDirection: 'row', alignItems: 'center' },
  fbTitle: { fontSize: 12.5, fontWeight: '700', color: INK },
  overall: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9, fontSize: 10, fontWeight: '600', overflow: 'hidden' },
  fbBody: { flexDirection: 'row', gap: 10, marginTop: 8 },
  fbPhoto: { width: 36, height: 36, borderRadius: 18 },
  fbName: { fontSize: 10.5, fontWeight: '600', color: INK },
  fbDate: { fontSize: 9.5, color: BODY },
  fbText: { marginTop: 3, fontSize: 10.5, lineHeight: 15, color: '#2B3445' },
});
