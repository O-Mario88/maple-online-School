import { Image } from '@/components/picture';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Bar } from '@/features/learner/dashboard/DashParts';
import { PremiumTiles } from '@/features/portal/Premium';
import type { Tone } from '@/features/portal/tokens';
import type { IconName } from '@/lib/icons';
import type { ProjectStatus } from '@/lib/projects';

import { type Page, type Project, type ProjectsState, STATUS_LABEL } from './useProjects';
import { Maple } from '@/constants/maple';

const INK = Maple.navy;
const NAVY = Maple.blueHover;
const BODY = Maple.body;
const BLUE = Maple.blue;
export const STATUS_TONE: Record<ProjectStatus, { bg: string; fg: string; bar: string }> = {
  in_progress: { bg: Maple.blueSelected, fg: Maple.blueHover, bar: Maple.successText },
  completed: { bg: Maple.successSoft, fg: Maple.successText, bar: Maple.successText },
  upcoming: { bg: Maple.warningSoft, fg: Maple.warningText, bar: Maple.borderStrong },
  attention: { bg: Maple.errorSoft, fg: Maple.error, bar: Maple.error },
};

export function StatusPill({ status }: { status: ProjectStatus }) {
  const t = STATUS_TONE[status];
  return <Text style={[styles.status, { backgroundColor: t.bg, color: t.fg }]}>{STATUS_LABEL[status]}</Text>;
}

const STAT_ORDER: { key: 'total' | ProjectStatus; label: string; bar?: string }[] = [
  { key: 'total', label: 'Total Projects' },
  { key: 'completed', label: 'Completed', bar: Maple.successText },
  { key: 'in_progress', label: 'In Progress', bar: Maple.warning },
  { key: 'upcoming', label: 'Upcoming', bar: BLUE },
  { key: 'attention', label: 'Needs Attention', bar: Maple.error },
];

const STAT_LOOK: Readonly<Record<string, { icon: IconName; tone: Tone }>> = {
  total: { icon: 'folder', tone: 'blue' },
  in_progress: { icon: 'clock', tone: 'orange' },
  completed: { icon: 'check', tone: 'green' },
  upcoming: { icon: 'calendar', tone: 'purple' },
  attention: { icon: 'alert', tone: 'red' },
};

export function StatCards({ page, s, phone = false }: { page: Page; s: ProjectsState; phone?: boolean }) {
  const pick = (key: string) => (key === 'total' ? s.setStatus(undefined) : key === 'attention' ? s.setAttentionOnly(!s.attentionOnly) : s.setStatus(key as ProjectStatus));
  if (phone) {
    return (
      <PremiumTiles
        title="Project Summary"
        subtitle="Where your projects stand this term."
        minHeight={146}
        items={STAT_ORDER.map((x) => {
          const entry = x.key === 'total' ? null : s.stats[x.key as ProjectStatus];
          return { label: x.label, value: String(x.key === 'total' ? s.stats.total : (entry?.count ?? 0)), icon: STAT_LOOK[x.key].icon, tone: STAT_LOOK[x.key].tone, progress: entry ? entry.percent / 100 : undefined, caption: entry ? `${entry.percent}% of projects` : 'All your projects', onPress: () => pick(x.key) };
        })}
      />
    );
  }
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
            onPress={() => pick(x.key)}
            accessibilityRole="button"
            accessibilityLabel={`${count} ${x.label}${entry ? `, ${entry.percent}%` : ''}`}>
            <Image decorative source={page.statIcons[x.key]} style={styles.statIcon} />
            <View style={styles.flex}>
              <Text style={styles.statNum}>{count}</Text>
              <Text style={styles.statLabel}>{x.label}</Text>
              {entry && x.bar ? (
                <View style={styles.statBar}>
                  <View style={styles.flex}>
                    <Bar value={entry.percent / 100} color={x.bar} track={Maple.blueSelected} height={7} />
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
      <Image decorative source={p.thumb} style={styles.thumb} contentFit="cover" />
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
            <Bar value={p.progress} color={t.bar} track={Maple.blueSelected} height={7} />
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
      {/* The tabs scroll sideways when they don't fit, instead of widening the page. */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabs} accessibilityRole="tablist">
        {TABS.map((t) => {
          const on = t.key === s.status && !s.attentionOnly;
          return (
            <Pressable key={t.label} style={styles.tab} onPress={() => s.setStatus(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Text style={[styles.tabText, on && styles.tabOn]}>{`${t.label} (${counts[t.key ?? 'all']})`}</Text>
              {on ? <View style={styles.tabLine} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Icon name="search" size={15} color={INK} />
          <TextInput style={styles.searchInput} value={s.query} onChangeText={s.setQuery} placeholder="Search projects..." placeholderTextColor={Maple.secondary} accessibilityLabel="Search projects" />
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
  white: { color: Maple.surface },
  status: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 5, fontSize: 10.5, fontWeight: '500', overflow: 'hidden' },
  stats: { flexDirection: 'row', gap: 8 },
  statsP: { flexWrap: 'wrap' },
  stat: { flex: 1, height: 83, flexDirection: 'row', gap: 14, paddingHorizontal: 12, paddingTop: 10, borderRadius: 8, borderWidth: 1, borderColor: Maple.blueSelected, backgroundColor: Maple.surface },
  statP: { flexBasis: '47%', flexGrow: 1, height: 76 },
  statIcon: { width: 44, height: 44 },
  statNum: { fontSize: 19, fontWeight: '700', color: NAVY },
  statLabel: { marginTop: 1, fontSize: 11.5, color: BODY },
  statBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 9 },
  statPct: { fontSize: 12, color: INK },
  tabsScroll: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: Maple.blueSelected },
  tabs: { flexDirection: 'row', gap: 12, paddingHorizontal: 6 },
  tab: { paddingVertical: 8 },
  tabText: { fontSize: 11.5, color: BODY },
  tabOn: { color: BLUE, fontWeight: '700' },
  tabLine: { position: 'absolute', left: 0, right: 0, bottom: -1, height: 3, backgroundColor: BLUE },
  searchRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  search: { flex: 1, height: 32, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, borderRadius: 5, borderWidth: 1, borderColor: Maple.blueLine, backgroundColor: Maple.surface },
  searchInput: { flex: 1, height: 30, paddingVertical: 0, fontSize: 12, color: INK },
  filter: { height: 32, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, borderRadius: 5, borderWidth: 1, borderColor: Maple.blueLine, backgroundColor: Maple.surface },
  filterOn: { borderColor: BLUE, backgroundColor: Maple.blueSoft },
  filterText: { fontSize: 12, color: BLUE },
  cards: { gap: 8, marginTop: 12 },
  empty: { paddingVertical: 30, fontSize: 12.5, color: BODY, textAlign: 'center' },
  card: { flexDirection: 'row', gap: 12, padding: 10, borderRadius: 6, borderWidth: 1, borderColor: Maple.blueSelected, backgroundColor: Maple.surface },
  cardOn: { borderWidth: 1.5, borderColor: BLUE, backgroundColor: Maple.blueSoft },
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
  pageBtn: { width: 29, height: 31, alignItems: 'center', justifyContent: 'center', borderRadius: 5, borderWidth: 1, borderColor: Maple.blueLine, backgroundColor: Maple.surface },
  pageOn: { borderColor: Maple.blue, backgroundColor: Maple.blue },
  pageText: { fontSize: 12, color: INK },
});
