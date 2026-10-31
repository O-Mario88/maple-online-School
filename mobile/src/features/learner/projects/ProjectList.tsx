import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Bar } from '@/features/learner/dashboard/DashParts';
import type { ProjectStatus } from '@/lib/projects';

import { type Page, type Project, type ProjectsState, STATUS_LABEL } from './useProjects';

const INK = '#0B1424';
const NAVY = '#0B2A6B';
const BODY = '#4A5263';
const BLUE = '#1463F3';
export const STATUS_TONE: Record<ProjectStatus, { bg: string; fg: string; bar: string }> = {
  in_progress: { bg: '#E6EEFC', fg: '#1450C8', bar: '#22A35A' },
  completed: { bg: '#E3F6E9', fg: '#15803D', bar: '#22A35A' },
  upcoming: { bg: '#FDF1DC', fg: '#B45309', bar: '#C9D2E0' },
  attention: { bg: '#FDE2E2', fg: '#C81E1E', bar: '#E5484D' },
};

export function StatusPill({ status }: { status: ProjectStatus }) {
  const t = STATUS_TONE[status];
  return <Text style={[styles.status, { backgroundColor: t.bg, color: t.fg }]}>{STATUS_LABEL[status]}</Text>;
}

const STAT_ORDER: { key: 'total' | ProjectStatus; label: string; bar?: string }[] = [
  { key: 'total', label: 'Total Projects' },
  { key: 'completed', label: 'Completed', bar: '#22A35A' },
  { key: 'in_progress', label: 'In Progress', bar: '#F5A524' },
  { key: 'upcoming', label: 'Upcoming', bar: BLUE },
  { key: 'attention', label: 'Needs Attention', bar: '#E5484D' },
];

export function StatCards({ page, s, phone = false }: { page: Page; s: ProjectsState; phone?: boolean }) {
  return (
    <View style={[styles.stats, phone && styles.statsP]}>
      {STAT_ORDER.map((x) => {
        const isTotal = x.key === 'total';
        const entry = isTotal ? null : s.stats[x.key as ProjectStatus];
        const count = isTotal ? s.stats.total : (entry?.count ?? 0);
        return (
          <Pressable
            key={x.key}
            style={[styles.stat, phone && styles.statP]}
            onPress={() => (isTotal ? s.setStatus(undefined) : x.key === 'attention' ? s.setAttentionOnly(!s.attentionOnly) : s.setStatus(x.key as ProjectStatus))}
            accessibilityRole="button"
            accessibilityLabel={`${count} ${x.label}${entry ? `, ${entry.percent}%` : ''}`}>
            <Image source={page.statIcons[x.key]} style={styles.statIcon} />
            <View style={styles.flex}>
              <Text style={styles.statNum}>{count}</Text>
              <Text style={styles.statLabel}>{x.label}</Text>
              {entry && x.bar ? (
                <View style={styles.statBar}>
                  <View style={styles.flex}>
                    <Bar value={entry.percent / 100} color={x.bar} track="#E6EBF2" height={7} />
                  </View>
                  <Text style={styles.statPct}>{`${entry.percent}%`}</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const TABS: { key: ProjectStatus | undefined; label: string }[] = [
  { key: undefined, label: 'All Projects' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'upcoming', label: 'Upcoming' },
];

function ProjectCard({ p, s, on, onOpen }: { p: Project; s: ProjectsState; on: boolean; onOpen?: () => void }) {
  const t = STATUS_TONE[p.status];
  return (
    <Pressable style={[styles.card, on && styles.cardOn]} onPress={() => {
        s.select(p.id);
        onOpen?.();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: on }} accessibilityLabel={`${p.title}, ${p.subject}, ${STATUS_LABEL[p.status]}, ${p.date}, ${Math.round(p.progress * 100)}%`}>
      <Image source={p.thumb} style={styles.thumb} contentFit="cover" />
      <View style={styles.flex}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {p.title}
          </Text>
          <StatusPill status={p.status} />
        </View>
        <Text style={styles.cardSub}>{`${p.subject}  •  Primary 6`}</Text>
        <Text style={styles.cardText} numberOfLines={2}>
          {p.card}
        </Text>
        <View style={styles.cardFoot}>
          <Icon name="calendar" size={12} color={BODY} />
          <Text style={styles.cardDate} numberOfLines={1}>
            {p.date}
          </Text>
          <View style={styles.cardBar}>
            <Bar value={p.progress} color={t.bar} track="#E6EBF2" height={7} />
          </View>
          <Text style={styles.cardPct}>{`${Math.round(p.progress * 100)}%`}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function ProjectList({ s, onOpen }: { s: ProjectsState; onOpen?: () => void }) {
  const counts: Record<'all' | ProjectStatus, number> = { all: s.stats.total, in_progress: s.stats.in_progress.count, completed: s.stats.completed.count, upcoming: s.stats.upcoming.count, attention: s.stats.attention.count };
  return (
    <View>
      <View style={styles.tabs} accessibilityRole="tablist">
        {TABS.map((t) => {
          const on = t.key === s.status && !s.attentionOnly;
          return (
            <Pressable key={t.label} style={styles.tab} onPress={() => s.setStatus(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Text style={[styles.tabText, on && styles.tabOn]}>{`${t.label} (${counts[t.key ?? 'all']})`}</Text>
              {on ? <View style={styles.tabLine} /> : null}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Icon name="search" size={15} color={INK} />
          <TextInput style={styles.searchInput} value={s.query} onChangeText={s.setQuery} placeholder="Search projects..." placeholderTextColor="#6B7385" accessibilityLabel="Search projects" />
        </View>
        <Pressable style={[styles.filter, s.attentionOnly && styles.filterOn]} onPress={() => s.setAttentionOnly(!s.attentionOnly)} accessibilityRole="switch" accessibilityState={{ checked: s.attentionOnly }} accessibilityLabel="Show only projects that need attention">
          <Icon name="listBullet" size={15} color={BLUE} />
          <Text style={styles.filterText}>Filter</Text>
        </Pressable>
      </View>
      <View style={styles.cards}>
        {s.paged.items.length === 0 ? <Text style={styles.empty}>No projects match. Try another search or tab.</Text> : null}
        {s.paged.items.map((p) => (
          <ProjectCard key={p.id} p={p} s={s} on={p.id === s.open.id} onOpen={onOpen} />
        ))}
      </View>
      <View style={styles.pager}>
        <Text style={styles.showing}>{`Showing ${s.paged.from}–${s.paged.to} of ${s.paged.total} projects`}</Text>
        <View style={styles.flex} />
        <Pressable style={styles.pageBtn} onPress={() => s.setPageNo(Math.max(1, s.pageNo - 1))} disabled={s.pageNo === 1} accessibilityRole="button" accessibilityLabel="Previous page">
          <Icon name="chevronLeft" size={14} color={INK} />
        </Pressable>
        {Array.from({ length: s.paged.pages }, (_, i) => (
          <Pressable key={i} style={[styles.pageBtn, s.pageNo === i + 1 && styles.pageOn]} onPress={() => s.setPageNo(i + 1)} accessibilityRole="button" accessibilityState={{ selected: s.pageNo === i + 1 }} accessibilityLabel={`Page ${i + 1}`}>
            <Text style={[styles.pageText, s.pageNo === i + 1 && styles.white]}>{i + 1}</Text>
          </Pressable>
        ))}
        <Pressable style={styles.pageBtn} onPress={() => s.setPageNo(Math.min(s.paged.pages, s.pageNo + 1))} disabled={s.pageNo === s.paged.pages} accessibilityRole="button" accessibilityLabel="Next page">
          <Icon name="chevronRight" size={14} color={INK} />
        </Pressable>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  flex: { flex: 1 },
  white: { color: '#FFFFFF' },
  status: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 5, fontSize: 10.5, fontWeight: '500', overflow: 'hidden' },
  stats: { flexDirection: 'row', gap: 8 },
  statsP: { flexWrap: 'wrap' },
  stat: { flex: 1, height: 83, flexDirection: 'row', gap: 14, paddingHorizontal: 12, paddingTop: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E8EDF4', backgroundColor: '#FFFFFF' },
  statP: { flexBasis: '47%', flexGrow: 1, height: 76 },
  statIcon: { width: 44, height: 44 },
  statNum: { fontSize: 19, fontWeight: '700', color: NAVY },
  statLabel: { marginTop: 1, fontSize: 11.5, color: BODY },
  statBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 9 },
  statPct: { fontSize: 12, color: INK },
  tabs: { flexDirection: 'row', gap: 12, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: '#E3E8F0' },
  tab: { paddingVertical: 8 },
  tabText: { fontSize: 11.5, color: BODY },
  tabOn: { color: BLUE, fontWeight: '700' },
  tabLine: { position: 'absolute', left: 0, right: 0, bottom: -1, height: 2.5, backgroundColor: BLUE },
  searchRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  search: { flex: 1, height: 32, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, borderRadius: 5, borderWidth: 1, borderColor: '#DCE3EE', backgroundColor: '#FFFFFF' },
  searchInput: { flex: 1, height: 30, fontSize: 12, color: INK },
  filter: { height: 32, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, borderRadius: 5, borderWidth: 1, borderColor: '#DCE3EE', backgroundColor: '#FFFFFF' },
  filterOn: { borderColor: BLUE, backgroundColor: '#EEF4FF' },
  filterText: { fontSize: 12, color: BLUE },
  cards: { gap: 8, marginTop: 12 },
  empty: { paddingVertical: 30, fontSize: 12.5, color: BODY, textAlign: 'center' },
  card: { flexDirection: 'row', gap: 12, padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#E8EDF4', backgroundColor: '#FFFFFF' },
  cardOn: { borderWidth: 1.5, borderColor: BLUE, backgroundColor: '#F4F8FF' },
  thumb: { width: 74, height: 74, borderRadius: 5 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cardTitle: { flex: 1, fontSize: 13, fontWeight: '700', color: NAVY },
  cardSub: { marginTop: 3, fontSize: 11.5, color: BODY },
  cardText: { marginTop: 5, fontSize: 10.5, lineHeight: 14, color: BODY },
  cardFoot: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  cardDate: { flex: 1, fontSize: 10.5, color: INK },
  cardBar: { width: 80 },
  cardPct: { width: 30, fontSize: 11.5, fontWeight: '600', color: INK, textAlign: 'right' },
  pager: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20 },
  showing: { fontSize: 12, color: NAVY },
  pageBtn: { width: 29, height: 31, alignItems: 'center', justifyContent: 'center', borderRadius: 5, borderWidth: 1, borderColor: '#DCE3EE', backgroundColor: '#FFFFFF' },
  pageOn: { borderColor: '#0B6BFF', backgroundColor: '#0B6BFF' },
  pageText: { fontSize: 12, color: INK },
});
